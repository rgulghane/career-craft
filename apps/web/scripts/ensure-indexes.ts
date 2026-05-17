import { establishDatabaseConnection } from "../src/server/db/startup";

async function main() {
  await establishDatabaseConnection();
  console.log("MongoDB indexes are up to date.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
