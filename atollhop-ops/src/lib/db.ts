import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { signOperatorJWT } from "./jwt";

export async function getDbConnection(operatorId: string) {
  const token = await signOperatorJWT(operatorId);

  const client = neon(process.env.NEON_AUTHENTICATED_URL!, {
    authToken: token,
  });
  return drizzle(client, { schema });
}
