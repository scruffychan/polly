import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { analyzeSentiment } from "./sentimentAnalysis";
import {
  insertQuestionSchema,
  insertVoteSchema,
  insertResearchPaperSchema,
  insertChatMessageSchema,
  insertActionItemSchema,
  insertUserFeedbackSchema,
} from "@shared/schema";

interface WebSocketClient extends WebSocket {
  userId?: string;
  questionId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Question routes
  app.get('/api/questions/active', async (req, res) => {
    try {
      // Deactivate expired questions first
      await storage.deactivateExpiredQuestions();
      
      const question = await storage.getActiveQuestion();
      if (!question) {
        return res.json(null);
      }

      const [papers, actionItems, voteStats] = await Promise.all([
        storage.getResearchPapersForQuestion(question.id),
        storage.getActionItemsForQuestion(question.id),
        storage.getVoteStatsForQuestion(question.id)
      ]);

      // Calculate total votes
      const totalVotes = voteStats.reduce((sum, stat) => sum + stat.count, 0);

      res.json({
        ...question,
        researchPapers: papers,
        actionItems,
        voteStats,
        totalVotes
      });
    } catch (error) {
      console.error("Error fetching active question:", error);
      res.status(500).json({ message: "Failed to fetch active question" });
    }
  });

  app.get('/api/questions/history', async (req, res) => {
    try {
      const questions = await storage.getQuestionHistory();
      
      const questionsWithStats = await Promise.all(
        questions.map(async (question) => {
          const voteStats = await storage.getVoteStatsForQuestion(question.id);
          const totalVotes = voteStats.reduce((sum, stat) => sum + stat.count, 0);
          
          return {
            ...question,
            voteStats,
            totalVotes
          };
        })
      );

      res.json(questionsWithStats);
    } catch (error) {
      console.error("Error fetching question history:", error);
      res.status(500).json({ message: "Failed to fetch question history" });
    }
  });

  app.post('/api/questions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const questionData = insertQuestionSchema.parse({
        ...req.body,
        createdBy: userId
      });

      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.post('/api/questions/:id/activate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const questionId = parseInt(req.params.id);
      await storage.activateQuestion(questionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error activating question:", error);
      res.status(500).json({ message: "Failed to activate question" });
    }
  });

  // Vote routes
  app.get('/api/votes/check/:questionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const questionId = parseInt(req.params.questionId);
      
      const vote = await storage.getUserVoteForQuestion(userId, questionId);
      res.json({ hasVoted: !!vote, vote });
    } catch (error) {
      console.error("Error checking vote:", error);
      res.status(500).json({ message: "Failed to check vote" });
    }
  });

  app.post('/api/votes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user already voted for this question
      const existingVote = await storage.getUserVoteForQuestion(userId, req.body.questionId);
      if (existingVote) {
        return res.status(400).json({ message: "You have already voted on this question" });
      }

      const voteData = insertVoteSchema.parse({
        ...req.body,
        userId
      });

      const vote = await storage.createVote(voteData);
      res.json(vote);
    } catch (error) {
      console.error("Error creating vote:", error);
      res.status(500).json({ message: "Failed to submit vote" });
    }
  });

  // Research paper routes
  app.post('/api/research-papers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const paperData = insertResearchPaperSchema.parse(req.body);
      const paper = await storage.createResearchPaper(paperData);
      res.json(paper);
    } catch (error) {
      console.error("Error creating research paper:", error);
      res.status(500).json({ message: "Failed to create research paper" });
    }
  });

  // Action item routes
  app.post('/api/action-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const itemData = insertActionItemSchema.parse(req.body);
      const item = await storage.createActionItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating action item:", error);
      res.status(500).json({ message: "Failed to create action item" });
    }
  });

  // Chat message routes
  app.get('/api/chat/:questionId', async (req, res) => {
    try {
      const questionId = parseInt(req.params.questionId);
      const messages = await storage.getChatMessagesForQuestion(questionId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // User feedback routes
  app.post('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const feedbackData = insertUserFeedbackSchema.parse({
        ...req.body,
        userId
      });

      const feedback = await storage.createUserFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  app.get('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const feedback = await storage.getAllUserFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketClient) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join') {
          ws.userId = message.userId;
          ws.questionId = message.questionId;
          
          // Send initial chat history
          const messages = await storage.getChatMessagesForQuestion(message.questionId);
          ws.send(JSON.stringify({
            type: 'chat_history',
            messages
          }));
        }
        
        if (message.type === 'chat_message' && ws.userId && ws.questionId) {
          // Analyze sentiment
          const sentiment = analyzeSentiment(message.content);
          
          // Save message to database
          const chatMessage = await storage.createChatMessage({
            questionId: ws.questionId,
            userId: ws.userId,
            content: message.content
          });

          // Update sentiment
          await storage.updateMessageSentiment(chatMessage.id, sentiment.score);

          // Get user info for broadcast
          const user = await storage.getUser(ws.userId);
          
          const messageWithUser = {
            ...chatMessage,
            sentiment: sentiment.score,
            user
          };

          // Broadcast to all connected clients for this question
          wss.clients.forEach((client: WebSocketClient) => {
            if (client.readyState === WebSocket.OPEN && client.questionId === ws.questionId) {
              client.send(JSON.stringify({
                type: 'new_message',
                message: messageWithUser
              }));
            }
          });

          // Calculate and broadcast updated sentiment stats
          const allMessages = await storage.getChatMessagesForQuestion(ws.questionId);
          const sentiments = allMessages
            .filter(msg => msg.sentiment !== null)
            .map(msg => msg.sentiment as number);
          
          if (sentiments.length > 0) {
            // Weight recent messages more heavily (last 20 messages get 2x weight)
            const recentSentiments = sentiments.slice(-20);
            const olderSentiments = sentiments.slice(0, -20);
            
            const recentWeight = recentSentiments.length * 2;
            const olderWeight = olderSentiments.length;
            const totalWeight = recentWeight + olderWeight;
            
            const recentAvg = recentSentiments.length > 0 ? 
              recentSentiments.reduce((sum, s) => sum + s, 0) / recentSentiments.length : 0;
            const olderAvg = olderSentiments.length > 0 ? 
              olderSentiments.reduce((sum, s) => sum + s, 0) / olderSentiments.length : 0;
            
            const avgSentiment = totalWeight > 0 ? 
              (recentAvg * recentWeight + olderAvg * olderWeight) / totalWeight : 0;
            
            // Calculate positive percentage with recent message weighting
            const recentPositiveCount = recentSentiments.filter(s => s > 0.1).length;
            const recentNeutralCount = recentSentiments.filter(s => s >= -0.1 && s <= 0.1).length;
            const olderPositiveCount = olderSentiments.filter(s => s > 0.1).length;
            const olderNeutralCount = olderSentiments.filter(s => s >= -0.1 && s <= 0.1).length;
            
            const totalPositiveWeighted = (recentPositiveCount * 2) + olderPositiveCount;
            const totalNeutralWeighted = (recentNeutralCount * 2) + olderNeutralCount;
            const positivePercentage = ((totalPositiveWeighted + totalNeutralWeighted * 0.5) / totalWeight) * 100;
            
            wss.clients.forEach((client: WebSocketClient) => {
              if (client.readyState === WebSocket.OPEN && client.questionId === ws.questionId) {
                client.send(JSON.stringify({
                  type: 'sentiment_update',
                  avgSentiment,
                  positivePercentage
                }));
              }
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
