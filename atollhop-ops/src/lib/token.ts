import { db } from "@/db/public-db";
import { eq } from "drizzle-orm";
import { SignJWT, JWK } from "jose";
import { users, employees, operators } from "@/db/schema";

export async function generateTokenFor(
  username: string,
  password: string
): Promise<string> {
  const database = await db();

  const [foundUser] = await database
    .select()
    .from(users)
    .where(eq(users.email, username))
    .limit(1);

  if (!foundUser || foundUser.password !== password) {
    throw new Error("Invalid credentials");
  }

  const [empOp] = await database
    .select({
      employeeUuid: employees.uuid,
      operatorUuid: operators.uuid,
    })
    .from(employees)
    .innerJoin(operators, eq(employees.operator_id, operators.id))
    .where(eq(employees.user_id, foundUser.id))
    .limit(1);

  if (!empOp) {
    throw new Error("No operator record for this user");
  }

  if (!process.env.PRIVATE_KEY_JWK) {
    throw new Error("Missing PRIVATE_KEY_JWK");
  }
  const privateKey: JWK = JSON.parse(process.env.PRIVATE_KEY_JWK);

  const token = await new SignJWT({ operator_id: empOp.operatorUuid })
    .setProtectedHeader({ alg: "RS256", kid: "my-key-id" })
    .setSubject(empOp.operatorUuid)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  return token;
}
