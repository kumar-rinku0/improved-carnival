import { db } from "@/db/public-db";
import { users, employees, positions, operators } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserFromDb(email: string, password: string) {
  try {
    const database = await db();

    const [record] = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        dbPassword: users.password,
        emailVerified: users.email_verified,
        image: users.image,

        employeeId: employees.id,
        positionId: positions.id,
        operatorUuid: operators.uuid,
        positionTitle: positions.title,
        operatorName: operators.name,
      })
      .from(users)
      .leftJoin(employees, eq(users.id, employees.user_id))
      .leftJoin(positions, eq(employees.position_id, positions.id))
      .leftJoin(operators, eq(employees.operator_id, operators.id))
      .where(eq(users.email, email))
      .limit(1);

    if (!record) {
      return null;
    }

    if (record.dbPassword !== password) {
      return null;
    }

    const userData = {
      id: record.id,
      name: record.name,
      email: record.email,
      emailVerified: record.emailVerified,
      image: record.image,

      employeeId: record.employeeId,
      positionId: record.positionId,
      operatorId: record.operatorUuid,
      role: record.positionTitle,
      userDetails: {
        operatorName: record.operatorName,
        positionTitle: record.positionTitle,
      },
    };

    return userData;
  } catch (error) {
    console.error("[getUserFromDb] Error:", error);
    return null;
  }
}
