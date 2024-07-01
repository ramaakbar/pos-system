import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";

import { serverEnvs } from "@/env/server";

import { db } from ".";
import { sessionsTable } from "./schema/sessions";
import { User, usersTable } from "./schema/users";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionsTable, usersTable);

export const auth = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: serverEnvs.NODE_ENV === "production",
    },
  },
  getUserAttributes: (userAttr) => {
    return userAttr;
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof auth;
    DatabaseUserAttributes: User;
  }
}
