import { faker } from "@faker-js/faker";

import { db as DbType } from "..";
import { usersTable } from "../schema/users";

function userFactory() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const date = faker.date.between({
    from: "2022-01-01T00:00:00.000Z",
    to: "2023-01-31T00:00:00.000Z",
  });

  const userObj: typeof usersTable.$inferSelect = {
    id: faker.string.numeric(15),
    email: faker.internet.email({ firstName, lastName }),
    password: faker.internet.password(),
    role: "Member",
    createdAt: date,
    updatedAt: date,
  };
  return userObj;
}
export async function userSeeder({
  db,
  count,
}: {
  db: typeof DbType;
  count: number;
}) {
  await Promise.all(
    [...Array(count)].map(async () => {
      await db.insert(usersTable).values(userFactory());
    })
  );
}
