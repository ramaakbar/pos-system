import { db } from ".";
import { userSeeder } from "./seeder-factory/users";

async function seed() {
  try {
    console.log("⏳ Running seeder...");

    const start = Date.now();

    await userSeeder({ db, count: 30 });

    const end = Date.now();

    console.log(`✅ Seeder completed in ${end - start}ms`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder failed: ", error);
    process.exit(1);
  }
}

seed();
