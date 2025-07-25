import {
  users,
  questions,
  votes,
  researchPapers,
  chatMessages,
  actionItems,
  userFeedback,
  type User,
  type UpsertUser,
  type Question,
  type InsertQuestion,
  type Vote,
  type InsertVote,
  type ResearchPaper,
  type InsertResearchPaper,
  type ChatMessage,
  type InsertChatMessage,
  type ActionItem,
  type InsertActionItem,
  type UserFeedback,
  type InsertUserFeedback,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, isNull, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Question operations
  createQuestion(question: InsertQuestion): Promise<Question>;
  getActiveQuestion(): Promise<Question | undefined>;
  getQuestionById(id: number): Promise<Question | undefined>;
  getQuestionHistory(): Promise<Question[]>;
  activateQuestion(id: number): Promise<void>;
  deactivateExpiredQuestions(): Promise<void>;

  // Vote operations
  getUserVoteForQuestion(userId: string, questionId: number): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  getVoteStatsForQuestion(questionId: number): Promise<{ option: string; count: number }[]>;

  // Research paper operations
  createResearchPaper(paper: InsertResearchPaper): Promise<ResearchPaper>;
  getResearchPapersForQuestion(questionId: number): Promise<ResearchPaper[]>;

  // Chat message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesForQuestion(questionId: number): Promise<(ChatMessage & { user: User })[]>;
  updateMessageSentiment(messageId: number, sentiment: number): Promise<void>;

  // Action item operations
  createActionItem(item: InsertActionItem): Promise<ActionItem>;
  getActionItemsForQuestion(questionId: number): Promise<ActionItem[]>;

  // User feedback operations
  createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getAllUserFeedback(): Promise<(UserFeedback & { user: User })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Question operations
  async createQuestion(questionData: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values({
        ...questionData,
        options: questionData.options as string[]
      })
      .returning();
    return question;
  }

  async getActiveQuestion(): Promise<Question | undefined> {
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.isActive, true))
      .limit(1);
    return question;
  }

  async getQuestionById(id: number): Promise<Question | undefined> {
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id));
    return question;
  }

  async getQuestionHistory(): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.isActive, false))
      .orderBy(desc(questions.endDate));
  }

  async activateQuestion(id: number): Promise<void> {
    // First deactivate all other questions
    await db
      .update(questions)
      .set({ isActive: false })
      .where(eq(questions.isActive, true));

    // Then activate the specified question
    await db
      .update(questions)
      .set({ isActive: true })
      .where(eq(questions.id, id));
  }

  async deactivateExpiredQuestions(): Promise<void> {
    const now = new Date();
    await db
      .update(questions)
      .set({ isActive: false })
      .where(and(
        eq(questions.isActive, true),
        lte(questions.endDate, now)
      ));
  }

  // Vote operations
  async getUserVoteForQuestion(userId: string, questionId: number): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(
        eq(votes.userId, userId),
        eq(votes.questionId, questionId)
      ));
    return vote;
  }

  async createVote(voteData: InsertVote): Promise<Vote> {
    const [vote] = await db
      .insert(votes)
      .values(voteData)
      .returning();
    return vote;
  }

  async getVoteStatsForQuestion(questionId: number): Promise<{ option: string; count: number }[]> {
    const results = await db
      .select({
        option: votes.selectedOption,
        count: count(),
      })
      .from(votes)
      .where(eq(votes.questionId, questionId))
      .groupBy(votes.selectedOption);

    return results.map(r => ({ option: r.option, count: Number(r.count) }));
  }

  // Research paper operations
  async createResearchPaper(paperData: InsertResearchPaper): Promise<ResearchPaper> {
    const [paper] = await db
      .insert(researchPapers)
      .values(paperData)
      .returning();
    return paper;
  }

  async getResearchPapersForQuestion(questionId: number): Promise<ResearchPaper[]> {
    return await db
      .select()
      .from(researchPapers)
      .where(eq(researchPapers.questionId, questionId))
      .orderBy(desc(researchPapers.createdAt));
  }

  // Chat message operations
  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getChatMessagesForQuestion(questionId: number): Promise<(ChatMessage & { user: User })[]> {
    return await db
      .select({
        id: chatMessages.id,
        questionId: chatMessages.questionId,
        userId: chatMessages.userId,
        content: chatMessages.content,
        sentiment: chatMessages.sentiment,
        isModerated: chatMessages.isModerated,
        hasCommonGroundBadge: chatMessages.hasCommonGroundBadge,
        createdAt: chatMessages.createdAt,
        user: users,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.questionId, questionId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(50);
  }

  async updateMessageSentiment(messageId: number, sentiment: number): Promise<void> {
    await db
      .update(chatMessages)
      .set({ sentiment })
      .where(eq(chatMessages.id, messageId));
  }

  // Action item operations
  async createActionItem(itemData: InsertActionItem): Promise<ActionItem> {
    const [item] = await db
      .insert(actionItems)
      .values(itemData)
      .returning();
    return item;
  }

  async getActionItemsForQuestion(questionId: number, userCountry?: string): Promise<ActionItem[]> {
    // Get action items for the user's country first, then fallback to US/global items
    const countryCode = userCountry || "US";
    
    const items = await db
      .select()
      .from(actionItems)
      .where(eq(actionItems.questionId, questionId))
      .orderBy(desc(actionItems.createdAt));
    
    // Filter by country first, then add global/US items as fallback
    const countryItems = items.filter(item => item.country === countryCode);
    const fallbackItems = items.filter(item => item.country === "US" || item.country === "global");
    
    // Return country-specific items first, then fallbacks (avoiding duplicates)
    const result = [...countryItems];
    fallbackItems.forEach(item => {
      if (!result.some(existing => existing.title === item.title)) {
        result.push(item);
      }
    });
    
    return result.slice(0, 6); // Limit to 6 items
  }

  // User feedback operations
  async createUserFeedback(feedbackData: InsertUserFeedback): Promise<UserFeedback> {
    const [feedback] = await db
      .insert(userFeedback)
      .values(feedbackData)
      .returning();
    return feedback;
  }

  async getAllUserFeedback(): Promise<(UserFeedback & { user: User })[]> {
    return await db
      .select({
        id: userFeedback.id,
        userId: userFeedback.userId,
        topicSuggestion: userFeedback.topicSuggestion,
        description: userFeedback.description,
        createdAt: userFeedback.createdAt,
        user: users,
      })
      .from(userFeedback)
      .innerJoin(users, eq(userFeedback.userId, users.id))
      .orderBy(desc(userFeedback.createdAt));
  }
}

export const storage = new DatabaseStorage();
