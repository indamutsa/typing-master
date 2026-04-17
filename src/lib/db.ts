import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createSQL() {
  return neon(process.env.DATABASE_URL!);
}

function createDB() {
  return drizzle(createSQL(), { schema });
}

export function sql(...args: Parameters<ReturnType<typeof neon>>) {
  return createSQL()(...args);
}

export function getDB() {
  return createDB();
}
