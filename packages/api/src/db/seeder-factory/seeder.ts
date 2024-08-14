import { db } from "..";
import { categorySeeder } from "./categories";
import { productSeeder } from "./products";
import { userSeeder } from "./users";

async function seed() {
  try {
    console.log("⏳ Running seeder...");

    const start = Date.now();

    await db.transaction(async (tx) => {
      await userSeeder({ tx, count: 30 });
      await categorySeeder({ tx, count: 10 });
      await productSeeder({ tx, count: 50 });
    });

    const end = Date.now();

    console.log(`✅ Seeder completed in ${end - start}ms`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder failed: ", error);
    process.exit(1);
  }
}

seed();
