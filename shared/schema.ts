import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  options: jsonb("options").notNull().$type<string[]>(),
  isActive: boolean("is_active").default(false),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Votes table
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  selectedOption: text("selected_option").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Research papers table
export const researchPapers = pgTable("research_papers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  source: text("source").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  year: integer("year").notNull(),
  credibilityBadge: text("credibility_badge").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  sentiment: real("sentiment"),
  isModerated: boolean("is_moderated").default(false),
  hasCommonGroundBadge: boolean("has_common_ground_badge").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Action items table
export const actionItems = pgTable("action_items", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(),
  country: text("country").default("US"), // Default to US for existing data
  createdAt: timestamp("created_at").defaultNow(),
});

// User feedback table
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  topicSuggestion: text("topic_suggestion").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const questionsRelations = relations(questions, ({ many, one }) => ({
  votes: many(votes),
  researchPapers: many(researchPapers),
  chatMessages: many(chatMessages),
  actionItems: many(actionItems),
  createdByUser: one(users, {
    fields: [questions.createdBy],
    references: [users.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  question: one(questions, {
    fields: [votes.questionId],
    references: [questions.id],
  }),
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
}));

export const researchPapersRelations = relations(researchPapers, ({ one }) => ({
  question: one(questions, {
    fields: [researchPapers.questionId],
    references: [questions.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  question: one(questions, {
    fields: [chatMessages.questionId],
    references: [questions.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
  question: one(questions, {
    fields: [actionItems.questionId],
    references: [questions.id],
  }),
}));

export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
  user: one(users, {
    fields: [userFeedback.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  votes: many(votes),
  chatMessages: many(chatMessages),
  feedback: many(userFeedback),
  createdQuestions: many(questions),
}));

// Insert schemas
export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertResearchPaperSchema = createInsertSchema(researchPapers).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  sentiment: true,
  isModerated: true,
  hasCommonGroundBadge: true,
});

export const insertActionItemSchema = createInsertSchema(actionItems).omit({
  id: true,
  createdAt: true,
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type ResearchPaper = typeof researchPapers.$inferSelect;
export type InsertResearchPaper = z.infer<typeof insertResearchPaperSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ActionItem = typeof actionItems.$inferSelect;
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
