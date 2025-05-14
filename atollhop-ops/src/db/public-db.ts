"use server";

import { drizzle } from "drizzle-orm/neon-serverless";


export async function db() {
  return drizzle(process.env.DATABASE_URL!);
}

