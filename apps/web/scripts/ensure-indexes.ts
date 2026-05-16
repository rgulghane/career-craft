import { ensureIndexes } from "../src/server/db/ensure-indexes";

async function main() {
  await ensureIndexes();
  console.log("MongoDB indexes are up to date.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
