"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import {
  confirmRazorpayPaymentAction,
  createRazorpayOrderAction,
  getEnrollmentPaymentStatusAction,
} from "@/app/enroll/payment-actions";
import { messages } from "@career-craft/shared/content";
import { openRazorpayCheckout } from "@/lib/razorpay-client";

type PayStatus = "idle" | "pending" | "paid" | "error";

const POLL_INTERVAL_MS = 1000;
const POLL_MAX_ATTEMPTS = 15;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isEnrollmentPaid(enrollmentId: string): Promise<boolean> {
  const status = await getEnrollmentPaymentStatusAction(enrollmentId);
  return status.ok && status.status === "PAID";
}

export function RazorpayPayButton({
  enrollmentId,
  amountLabel,
  className,
  children,
  redirectTo = "/dashboard",
}: {
  enrollmentId: string;
  amountLabel?: string;
  className?: string;
  children: (state: { pending: boolean }) => ReactNode;
  /** Where to send the user after payment succeeds. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<PayStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const paymentSucceededRef = useRef(false);
  const checkoutActiveRef = useRef(false);

  const pending = status === "pending";

  const completeSuccess = () => {
    if (paymentSucceededRef.current) {
      return;
    }
    paymentSucceededRef.current = true;
    checkoutActiveRef.current = false;
    setStatus("paid");
    router.refresh();
    window.location.assign(redirectTo);
  };

  const finalizePayment = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) => {
    const confirmed = await confirmRazorpayPaymentAction(
      enrollmentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );
    if (confirmed.ok) {
      completeSuccess();
      return;
    }

    if (await isEnrollmentPaid(enrollmentId)) {
      completeSuccess();
      return;
    }

    for (let i = 0; i < POLL_MAX_ATTEMPTS; i += 1) {
      await sleep(POLL_INTERVAL_MS);
      if (await isEnrollmentPaid(enrollmentId)) {
        completeSuccess();
        return;
      }
      const retry = await confirmRazorpayPaymentAction(
        enrollmentId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      );
      if (retry.ok) {
        completeSuccess();
        return;
      }
    }

    throw new Error(confirmed.error);
  };

  const handlePay = async () => {
    setStatus("pending");
    setErrorMessage(null);
    paymentSucceededRef.current = false;

    try {
      const order = await createRazorpayOrderAction(enrollmentId);
      if (!order.ok) {
        throw new Error(order.error);
      }

      checkoutActiveRef.current = true;

      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Uniconnect",
        description: amountLabel ? `Enrollment · ${amountLabel}` : "Program enrollment",
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: "#f97316" },
        modal: {
          ondismiss: () => {
            checkoutActiveRef.current = false;
            if (!paymentSucceededRef.current) {
              setStatus("idle");
            }
          },
        },
        handler: (response) => {
          void (async () => {
            setStatus("pending");
            try {
              await finalizePayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
              );
            } catch (err) {
              if (await isEnrollmentPaid(enrollmentId)) {
                completeSuccess();
                return;
              }
              setStatus("error");
              setErrorMessage(err instanceof Error ? err.message : messages.errors.generic);
            }
          })();
        },
      });
    } catch (err) {
      checkoutActiveRef.current = false;
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : messages.errors.generic);
    }
  };

  if (status === "paid") {
    return (
      <p className="text-center text-sm text-slate-600 dark:text-slate-300">Redirecting to your dashboard…</p>
    );
  }

  return (
    <>
      {errorMessage ? <p className="mb-2 text-sm text-rose-600 dark:text-rose-400">{errorMessage}</p> : null}
      <button type="button" disabled={pending} className={className} onClick={() => void handlePay()}>
        {children({ pending })}
      </button>
    </>
  );
}
