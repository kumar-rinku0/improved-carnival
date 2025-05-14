import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string | null;
    userDetails?: unknown;
    employeeId?: string | null;
    operator_id?: string | null;
    positionId?: string | null;
    ePolicyDetails?: unknown;
    oPolicyDetails?: unknown;
    pPolicyDetails?: unknown;
    positionDetails?: unknown;
    access_token?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      userDetails?: unknown;
      ePolicyDetails?: unknown;
      oPolicyDetails?: unknown;
      pPolicyDetails?: unknown;
      positionDetails?: unknown;
      role?: string | null;
      operator_id?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    userDetails?: unknown;
    employeeId?: string | null;
    operator_id?: string | null;
    positionId?: string | null;
  }
}
