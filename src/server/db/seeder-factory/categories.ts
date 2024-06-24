import { faker } from "@faker-js/faker";

import { db as DbType } from "..";
import { categoriesTable } from "../schema/categories";

function categoryFactory() {
  const date = faker.date.between({
    from: "2023-01-01T00:00:00.000Z",
    to: "2024-01-31T00:00:00.000Z",
  });

  const categoryObj: Omit<typeof categoriesTable.$inferSelect, "id"> = {
    name: faker.word.adjective(),
    createdAt: date,
    updatedAt: date,
  };
  return categoryObj;
}
export async function categorySeeder({
  tx,
  count,
}: {
  tx: typeof DbType;
  count: number;
}) {
  await Promise.all(
    [...Array(count)].map(async () => {
      await tx.insert(categoriesTable).values(categoryFactory());
    })
  );
}
