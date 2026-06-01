/**
 * Next.js instrumentation hook. MongoDB connects lazily on the first server request.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { configureMongoDns } = await import("./server/db/configure-dns");
    configureMongoDns();
  }
}
