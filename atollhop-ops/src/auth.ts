// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db/public-db";
import { eq } from "drizzle-orm";

import {
  employees,
  operators,
  positions,
  employee_policies,
} from "@/db/schema";

import { getUserFromDb } from "../utils/db";
import { signInSchema } from "./lib/zod";
import { generateTokenFor } from "@/lib/token";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  return {
    pages: {
      signIn: "/login",
    },
    providers: [
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          try {
            const { email, password } = await signInSchema.parseAsync(
              credentials
            );

            const dbUser = await getUserFromDb(email, password);
            if (!dbUser) {
              throw new Error("Invalid credentials");
            }

            const database = await db();

            let ePolicyDetails = null;
            let positionDetails: unknown = null;
            let operatorUuid: string | undefined;

            const employeeRecord = await database
              .select({
                employeePk: employees.id,
                employeeUuid: employees.uuid,
                positionPk: employees.position_id,
                operatorPk: employees.operator_id,
              })
              .from(employees)
              .where(eq(employees.user_id, dbUser.id))
              .then((res) => res[0]);

            if (employeeRecord) {
              const operatorRecord = await database
                .select({
                  operatorUuid: operators.uuid,
                  operatorName: operators.name,
                  operatorEmail: operators.email,
                })
                .from(operators)
                .where(eq(operators.id, employeeRecord.operatorPk))
                .then((res) => res[0]);

              if (!operatorRecord) {
                throw new Error("No matching operator found for this employee");
              }
              operatorUuid = operatorRecord.operatorUuid;

              if (employeeRecord.positionPk) {
                positionDetails = await database
                  .select({
                    positionPk: positions.id,
                    positionUuid: positions.uuid,
                    operatorPk: positions.operator_id,
                    policyName: positions.policy_name,
                    title: positions.title,
                  })
                  .from(positions)
                  .where(eq(positions.id, employeeRecord.positionPk))
                  .then((res) => res[0]);
              }

              ePolicyDetails = await database
                .select({
                  policyPk: employee_policies.id,
                  policyUuid: employee_policies.uuid,
                  policy: employee_policies.policy,
                })
                .from(employee_policies)
                .where(
                  eq(employee_policies.employee_id, employeeRecord.employeePk)
                )
                .then((res) => res[0]);
            } else {
              const operatorRecord = await database
                .select({
                  operatorPk: operators.id,
                  operatorUuid: operators.uuid,
                  name: operators.name,
                  email: operators.email,
                })
                .from(operators)
                .where(eq(operators.email, dbUser.email!))
                .then((res) => res[0]);

              if (operatorRecord) {
                operatorUuid = operatorRecord.operatorUuid;
                positionDetails = {
                  operatorPk: operatorRecord.operatorPk,
                  policyName: "",
                };
              }
            }

            if (!operatorUuid) {
              throw new Error("No operator uuid found for user");
            }

            const access_token = await generateTokenFor(email, password);

            return {
              id: dbUser.id.toString(),
              name: dbUser.name,
              email: dbUser.email,
              emailVerified: dbUser.emailVerified,
              image: dbUser.image,
              role: dbUser.role,
              ePolicyDetails,
              positionDetails,
              operator_id: operatorUuid,
              access_token,
            };
          } catch (error) {
            console.error("Authorize error:", error);
            return null;
          }
        },
      }),
    ],
    secret: process.env.AUTH_SECRET,
    session: {
      strategy: "jwt",
      maxAge: 60000,
    },
    jwt: {
      maxAge: 60000,
    },
    callbacks: {
      authorized({ request, auth }) {
        const { pathname } = request.nextUrl;

        if (
          pathname.startsWith("/login") ||
          pathname.startsWith("/api") ||
          pathname.startsWith("/_next/") ||
          pathname === "/favicon.ico"
        ) {
          return true;
        }

        return !!auth;
      },
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
          token.role = user.role;
          token.ePolicyDetails = user.ePolicyDetails;
          token.positionDetails = user.positionDetails;
          token.operator_id = user.operator_id;
          token.access_token = user.access_token;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email!;
          session.user.name = token.name;
          session.user.role = token.role as string;
          session.user.ePolicyDetails = token.ePolicyDetails;
          session.user.positionDetails = token.positionDetails;
          session.user.operator_id = token.operator_id as string;
          session.user.access_token = token.access_token as string;
        }
        return session;
      },
    },
  };
});
