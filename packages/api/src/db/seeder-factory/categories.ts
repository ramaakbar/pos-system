import { faker } from "@faker-js/faker";

import { db as DbType } from "..";
import { categoriesTable } from "../schema/categories";

function categoryFactory() {
  const categoryObj: typeof categoriesTable.$inferInsert = {
    name: faker.word.adjective(),
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
      await tx
        .insert(categoriesTable)
        .values(categoryFactory())
        .returning({ id: categoriesTable.id, code: categoriesTable.code });
    })
  );
}
