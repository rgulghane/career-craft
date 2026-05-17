/**
 * Next.js instrumentation hook. MongoDB connects lazily on the first server request.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Intentionally empty — avoids pulling the MongoDB driver into Edge instrumentation bundles.
}
