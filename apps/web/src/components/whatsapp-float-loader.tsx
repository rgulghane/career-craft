import { getSupportWhatsAppNumber } from "@career-craft/shared";
import { WhatsAppFloatButton } from "./whatsapp-float";

/** Server wrapper — resolves WhatsApp number from env for the client float button. */
export function WhatsAppFloatLoader() {
  return <WhatsAppFloatButton phoneNumber={getSupportWhatsAppNumber()} />;
}
