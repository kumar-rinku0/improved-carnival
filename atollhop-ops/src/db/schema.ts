import { UUID } from "crypto";

import { InferSelectModel, sql } from "drizzle-orm";
import { crudPolicy, authenticatedRole } from "drizzle-orm/neon";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  pgRole,
  uuid,
  point,
  integer,
  decimal,
  index,
  unique,
  time,
  json,
  serial,
} from "drizzle-orm/pg-core";

/**
 * Helper for RLS checks (session operator_id cast to uuid).
 *
 * Example usage:
 *   read: compareSessionOperatorIdUuid(t.uuid),
 * or in a subquery:
 *   (SELECT "uuid" FROM "operators" WHERE "id" = ...)
 */
const compareSessionOperatorIdUuid = (uuidOrSubquery: unknown) => sql`
  (
    (auth.session()->>'operator_id')::uuid = ${uuidOrSubquery}
  )
`;

/**
 * The 'authenticated' role (already exists in the DB).
 */
export const authenticatedDBRole = pgRole("authenticated").existing();

/* ------------------------------------------------------------------
   1. operators table
   ------------------------------------------------------------------ */
export const operators = pgTable(
  "operators",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    name: varchar("name").notNull(),
    phone: varchar("phone"),
    email: varchar("email"),
    website: varchar("website"),
    address: varchar("address"),
    operating_hours: varchar("operating_hours"),
    logo_url: varchar("logo_url"),
    description: text("description"),
  },
  (t) => [
    // Row-Level Security (RLS) policies
    crudPolicy({
      role: authenticatedRole,
      read: compareSessionOperatorIdUuid(t.uuid),
      modify: compareSessionOperatorIdUuid(t.uuid),
    }),
  ]
);

/* ------------------------------------------------------------------
   2. position_policies table
   ------------------------------------------------------------------ */
export const position_policies = pgTable(
  "position_policies",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    operator_id: integer("operator_id").notNull().references(() => operators.id),
    policy_name: varchar("policy_name").notNull(),
    policy: json("policy"),
  },
  (t) => [
    unique().on(t.operator_id, t.policy_name),
    crudPolicy({
      role: authenticatedRole,
      read: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
      modify: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
    }),
  ]
);

/* ------------------------------------------------------------------
   3. positions table
   ------------------------------------------------------------------ */
export const positions = pgTable(
  "positions",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    operator_id: integer("operator_id").notNull().references(() => operators.id),
    position_policy_id: integer("position_policy_id")
      .notNull()
      .references(() => position_policies.id),
    policy_name: varchar("policy_name").notNull(),
    title: varchar("title").notNull(),
  },
  (t) => [
    crudPolicy({
      role: authenticatedRole,
      read: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
      modify: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
    }),
  ]
);

/* ------------------------------------------------------------------
   4. users table
   ------------------------------------------------------------------ */
export const users = pgTable("users", {
  // Integer primary key
  id: serial("id").primaryKey(),

  // Public-facing UUID
  uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

  // Timestamps
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  // Fields
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  email_verified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
});

/* ------------------------------------------------------------------
   5. employees table
   ------------------------------------------------------------------ */
export const employees = pgTable(
  "employees",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    user_id: integer("user_id").notNull().references(() => users.id),
    position_id: integer("position_id").notNull().references(() => positions.id),
    operator_id: integer("operator_id").notNull().references(() => operators.id),
  },
  (t) => [
    crudPolicy({
      role: authenticatedRole,
      read: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
      modify: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
    }),
  ]
);

/* ------------------------------------------------------------------
   6. employee_policies table
   ------------------------------------------------------------------ */
export const employee_policies = pgTable(
  "employee_policies",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    employee_id: integer("employee_id").notNull().references(() => employees.id),
    operator_id: integer("operator_id").notNull().references(() => operators.id),
    policy: json("policy"),
  },
  (t) => [
    unique().on(t.employee_id, t.operator_id),
    crudPolicy({
      role: authenticatedRole,
      read: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
      modify: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
    }),
  ]
);

/* ------------------------------------------------------------------
   NextAuth tables (no RLS)
   ------------------------------------------------------------------ */
export const accounts = pgTable("accounts", {
  // Integer primary key
  id: serial("id").primaryKey(),

  // Public-facing UUID
  uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

  // Timestamps
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  // Fields
  user_id: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  provider_account_id: varchar("provider_account_id", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: text("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  // Integer primary key
  id: serial("id").primaryKey(),

  // Public-facing UUID
  uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

  // Timestamps
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  // Fields
  session_token: varchar("session_token", { length: 255 }).notNull(),
  user_id: integer("user_id").notNull().references(() => users.id),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verification_tokens = pgTable(
  "verification_tokens",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [unique().on(t.identifier, t.token)]
);

/* ------------------------------------------------------------------
   7. islands table
   ------------------------------------------------------------------ */
export const islands = pgTable(
  "islands",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    name: varchar("name", { length: 100 }).notNull(),
    atoll: varchar("atoll", { length: 50 }),
    coordinates: point("coordinates", { mode: "xy" }),
  },
  () => [
    // Public read, no modifications
    crudPolicy({
      role: authenticatedRole,
      read: true,
      modify: false,
    }),
  ]
);

export const transport_types = pgTable(
  "transport_types",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    type: varchar("type", { length: 20 }).notNull(),
    description: text("description"),
    icon_url: varchar("icon_url", { length: 255 }),
  },
  (t) => [
    crudPolicy({
      role: authenticatedRole,
      read: true,
      modify: false,
    }),
    unique().on(t.type),
  ]
);

export const airports = pgTable(
  "airports",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    name: varchar("name", { length: 100 }).notNull(),
    island_id: integer("island_id").references(() => islands.id).notNull(),
    iata_code: varchar("iata_code", { length: 3 }).unique(),
    icao_code: varchar("icao_code", { length: 4 }).unique(),
    coordinates: point("coordinates", { mode: "xy" }),
    description: text("description"),
  },
  () => [
    crudPolicy({
      role: authenticatedRole,
      read: true,
      modify: false,
    }),
  ]
);

export const airport_operators = pgTable(
  "airport_operators",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    airport_id: integer("airport_id").references(() => airports.id).notNull(),
    operator_id: integer("operator_id").references(() => operators.id).notNull(),
  },
  (t) => [
    unique().on(t.airport_id, t.operator_id),
    crudPolicy({
      role: authenticatedRole,
      read: true,
      modify: false,
    }),
  ]
);

export const currencies = pgTable(
  "currencies",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    price_id: varchar("price_id").notNull().unique(),
    name: varchar("name").notNull(),
    symbol: varchar("symbol", { length: 5 }),
  },
  () => [
    crudPolicy({
      role: authenticatedRole,
      read: true,
      modify: false,
    }),
  ]
);

/* ------------------------------------------------------------------
   8. fare_types table
   ------------------------------------------------------------------ */
export const fare_types = pgTable(
  "fare_types",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    name: varchar("name").notNull().unique(),
    description: varchar("description").notNull(),
  },
  () => [
    crudPolicy({
      role: authenticatedRole,
      read: true,
      modify: false,
    }),
  ]
);

/* ------------------------------------------------------------------
   9. fare_categories table
   ------------------------------------------------------------------ */
export const fare_categories = pgTable(
  "fare_categories",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    operator_id: integer("operator_id").references(() => operators.id).notNull(),
    name: varchar("name").notNull().unique(),
    description: varchar("description").notNull(),
  },
  (t) => [
    crudPolicy({
      role: authenticatedRole,
      read: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
      modify: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
    }),
  ]
);

/* ------------------------------------------------------------------
   10. routes table
   ------------------------------------------------------------------ */
export const routes = pgTable(
  "routes",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    operator_id: integer("operator_id").notNull().references(() => operators.id),
    origin_id: integer("origin_id").notNull().references(() => islands.id),
    destination_id: integer("destination_id").notNull().references(() => islands.id),
    transport_type_id: integer("transport_type_id")
      .notNull()
      .references(() => transport_types.id),
    duration_minutes: integer("duration_minutes").notNull(),
    distance_km: decimal("distance_km", { precision: 10, scale: 2 }),
  },
  (t) => [
    crudPolicy({
      role: authenticatedRole,
      read: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
      modify: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
    }),
  ]
);

/* ------------------------------------------------------------------
   11. schedules table
   ------------------------------------------------------------------ */
export const schedules = pgTable(
  "schedules",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // Public-facing UUID
    uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Fields
    route_id: integer("route_id").notNull().references(() => routes.id),
    departure_time: time("departure_time").notNull(),
    arrival_time: time("arrival_time").notNull(),
    schedule_days: varchar("schedule_days", { length: 10 }).array().notNull(),
    route_code: varchar("route_code", { length: 20 }),
    stop_schedule_ids: integer("stop_schedule_ids").array(),
    part_of_schedule_ids: integer("part_of_schedule_ids").array(),
    start_date: timestamp("start_date", { withTimezone: true }).notNull(),
    end_date: timestamp("end_date", { withTimezone: true }).notNull(),
    max_capacity: integer("max_capacity"),
    stop_details: json("stop_details").default([]).notNull(),
  },
  (t) => [
    crudPolicy({
      role: authenticatedRole,
      read: true,
      modify: false,
    }),
    index("idx_schedules_route_departure").on(t.route_id, t.departure_time),
    index("idx_schedules_days").using("gin", t.schedule_days),
    index("idx_schedules_stop_ids").using("gin", t.stop_schedule_ids),
    index("idx_schedules_part_of").using("gin", t.part_of_schedule_ids),
  ]
);

/* ------------------------------------------------------------------
   12. prices table (was priceSelfManaged)
   ------------------------------------------------------------------ */
export const prices = pgTable(
  "prices",
  {
    // Integer primary key
    id: serial("id").primaryKey(),

    // If desired, you can add a public-facing UUID here too:
    // uuid: uuid("uuid").default(sql`gen_random_uuid()`).unique().notNull(),

    operator_id: integer("operator_id").notNull().references(() => operators.id),
    schedule_id: integer("schedule_id").notNull().references(() => schedules.id),
    currency_id: integer("currency_id").notNull().references(() => currencies.id),
    fare_category_id: integer("fare_category_id")
      .notNull()
      .references(() => fare_categories.id),
    fare_type_id: integer("fare_type_id")
      .notNull()
      .references(() => fare_types.id),

    // Actual fare amount
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  },
  (t) => [
    /*
     * Optional: If you do not want duplicates for the same
     * (operator_id, schedule_id, currency_id, fare_category_id, fare_type_id),
     * you could uncomment:
     *
     * unique().on(
     *   t.operator_id,
     *   t.schedule_id,
     *   t.currency_id,
     *   t.fare_category_id,
     *   t.fare_type_id
     * ),
     */
    crudPolicy({
      role: authenticatedRole,
      read: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
      modify: sql`
        (
          (auth.session()->>'operator_id')::uuid =
            (
              SELECT "uuid"
              FROM "operators"
              WHERE "id" = ${t.operator_id}
            )
        )
      `,
    }),
  ]
);

/* ------------------------------------------------------------------
   TypeScript Models
   ------------------------------------------------------------------ */
export type Operators = InferSelectModel<typeof operators>;
export type PositionPolicies = InferSelectModel<typeof position_policies>;
export type Positions = InferSelectModel<typeof positions>;
export type Users = InferSelectModel<typeof users>;
export type Employees = InferSelectModel<typeof employees>;
export type EmployeePolicies = InferSelectModel<typeof employee_policies>;
export type Accounts = InferSelectModel<typeof accounts>;
export type Sessions = InferSelectModel<typeof sessions>;
export type VerificationTokens = InferSelectModel<typeof verification_tokens>;
export type Islands = InferSelectModel<typeof islands>;
export type TransportTypes = InferSelectModel<typeof transport_types>;
export type Airports = InferSelectModel<typeof airports>;
export type AirportOperators = InferSelectModel<typeof airport_operators>;
export type Currencies = InferSelectModel<typeof currencies>;
export type FareTypes = InferSelectModel<typeof fare_types>;
export type FareCategories = InferSelectModel<typeof fare_categories>;
export type Routes = InferSelectModel<typeof routes>;
export type Schedules = InferSelectModel<typeof schedules>;
export type Prices = InferSelectModel<typeof prices>;

/* ------------------------------------------------------------------
   Misc. Types
   ------------------------------------------------------------------ */
export type ScheduleDay =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type StopDetail = {
  islandId: UUID;
  islandName: string;
  arrivalTime: string;
  departureTime: string;
  waitMinutes: number;
};
