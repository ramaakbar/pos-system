import { randomInt } from "crypto";
import { faker } from "@faker-js/faker";

import { db as DbType } from "..";
import { categoriesTable } from "../schema/categories";
import { productsTable } from "../schema/products";

function productFactory(ctg: Array<typeof categoriesTable.$inferSelect>) {
  const productObj: typeof productsTable.$inferInsert = {
    name: faker.commerce.productName(),
    categoryId: ctg[randomInt(ctg.length)].id,
    description: faker.commerce.productDescription(),
    price: parseInt(faker.commerce.price({ min: 1000, max: 20000, dec: 0 })),
    media: "/cookie-sample.jpg",
    quantity: faker.number.int({ min: 0, max: 30 }),
  };
  return productObj;
}
export async function productSeeder({
  tx,
  count,
}: {
  tx: typeof DbType;
  count: number;
}) {
  const categories = await tx.select().from(categoriesTable);
  await Promise.all(
    [...Array(count)].map(async () => {
      await tx.insert(productsTable).values(productFactory(categories));
    })
  );
}
