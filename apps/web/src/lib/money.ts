/** Razorpay API amounts are in paise; app storage uses rupees. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
