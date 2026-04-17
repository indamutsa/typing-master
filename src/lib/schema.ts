import { pgTable, text, integer, real, primaryKey, timestamp, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name"),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const keyStats = pgTable(
  "key_stats",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    attempts: integer("attempts").notNull().default(0),
    errors: integer("errors").notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.key] }),
  })
);

export const sessionRecords = pgTable(
  "session_records",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mode: text("mode").notNull(),
    wpm: integer("wpm").notNull(),
    accuracy: real("accuracy").notNull(),
    duration: integer("duration").notNull(),
    charsTyped: integer("chars_typed").notNull(),
    bestStreak: integer("best_streak").notNull(),
    completedAt: integer("completed_at").notNull(),
  },
  (table) => ({
    userDateIdx: index("idx_sessions_user_date").on(table.userId, table.completedAt),
  })
);

export const userSettings = pgTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  aiProvider: text("ai_provider").default("deepseek"),
  testDuration: integer("test_duration").default(60),
  topN: integer("top_n").default(5),
  wordCountTarget: integer("word_count_target").default(200),
  soundEnabled: integer("sound_enabled").default(0),
});
