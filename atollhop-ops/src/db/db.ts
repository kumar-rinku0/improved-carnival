"use server";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { auth } from "@/auth";

export interface SessionUserType {
  access_token?: string;
  id: string;
  name: string;
  email: string;
}

export async function db() {
  const session = await auth();

  let authToken: string;
  if (!session) {
    console.warn("No session found; using fallback token");
    authToken = process.env.TEST_ACCESS_TOKEN!;
  } else {
    const user = session.user as SessionUserType;
    authToken = user?.access_token ? `${user.access_token}` : "";
  }

  console.log("Retrieved token:", authToken);
  if (!authToken) {
    throw new Error("No token available");
  }

  const neonClient = neon(process.env.DATABASE_AUTHENTICATED_URL!, {
    authToken,
  });

  return drizzle({ client: neonClient });
}
