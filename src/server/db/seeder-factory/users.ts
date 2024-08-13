import { faker } from "@faker-js/faker";

import { db as DbType } from "..";
import { usersTable } from "../schema/users";

async function userFactory() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const userObj: typeof usersTable.$inferInsert = {
    id: faker.string.numeric(15),
    email: faker.internet.email({ firstName, lastName }),
    password: await Bun.password.hash("password"),
    role: "Member",
  };
  return userObj;
}
export async function userSeeder({
  tx,
  count,
}: {
  tx: typeof DbType;
  count: number;
}) {
  await Promise.all(
    [...Array(count)].map(async () => {
      await tx.insert(usersTable).values(await userFactory());
    })
  );
}
