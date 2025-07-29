import { storage } from "./storage";

interface AutoQuestion {
  text: string;
  options: string[];
  researchPapers?: {
    title: string;
    source: string;
    year: number;
    summary: string;
    url?: string;
  }[];
  actionItems?: {
    title: string;
    description: string;
    category: string;
    url?: string;
  }[];
}

// Pool of controversial and topical questions for automated generation
const questionPool: AutoQuestion[] = [
  {
    text: "Should artificial intelligence be regulated by government agencies like the FDA regulates pharmaceuticals?",
    options: [
      "Yes, AI poses significant risks that require federal oversight",
      "No, regulation would stifle innovation and economic growth",
      "Only for AI systems used in critical sectors like healthcare",
      "Industry self-regulation is sufficient",
      "International cooperation is needed before domestic regulation"
    ],
    researchPapers: [
      {
        title: "AI Governance and Regulatory Frameworks",
        source: "MIT Technology Review",
        year: 2024,
        summary: "Comprehensive analysis of current AI regulation proposals and their potential impact on innovation."
      },
      {
        title: "The Economic Impact of AI Regulation",
        source: "Brookings Institution",
        year: 2024,
        summary: "Study examining how regulatory frameworks might affect AI development and deployment costs."
      }
    ],
    actionItems: [
      {
        title: "Contact Your Representative About AI Policy",
        description: "Reach out to your congressional representative to share your views on AI regulation",
        category: "civic_engagement",
        url: "https://www.house.gov/representatives/find-your-representative"
      },
      {
        title: "Attend Local Tech Policy Meetups",
        description: "Join community discussions about technology policy in your area",
        category: "community_engagement"
      }
    ]
  },
  {
    text: "Should remote work be considered a fundamental worker right in the post-pandemic economy?",
    options: [
      "Yes, remote work should be legally protected for eligible jobs",
      "No, employers should have full discretion over work arrangements",
      "Only for jobs that can be performed entirely remotely",
      "It should be negotiated industry by industry",
      "Hybrid models should be the standard compromise"
    ],
    researchPapers: [
      {
        title: "Remote Work and Productivity: A Meta-Analysis",
        source: "Journal of Business Research",
        year: 2024,
        summary: "Comprehensive review of remote work studies showing mixed but generally positive productivity outcomes."
      }
    ]
  },
  {
    text: "Should public schools be required to teach financial literacy as a core subject like math and English?",
    options: [
      "Yes, financial literacy is essential for adult success",
      "No, schools are already overburdened with curriculum requirements",
      "Only at the high school level as an elective",
      "It should be integrated into existing math courses",
      "Parents and families should be responsible for financial education"
    ],
    researchPapers: [
      {
        title: "Financial Literacy Education and Economic Outcomes",
        source: "National Bureau of Economic Research",
        year: 2023,
        summary: "Study linking early financial education to better long-term economic decision-making."
      }
    ]
  },
  {
    text: "Should social media platforms face legal liability for content recommended by their algorithms?",
    options: [
      "Yes, platforms should be responsible for algorithmic amplification",
      "No, this would lead to excessive censorship",
      "Only for content that causes measurable harm",
      "Platforms should be required to offer algorithm-free options",
      "Users should have full control over their algorithmic feeds"
    ]
  },
  {
    text: "Should universities be allowed to consider race as a factor in admissions decisions?",
    options: [
      "Yes, to promote diversity and address historical inequities",
      "No, admissions should be based solely on merit",
      "Only socioeconomic factors should be considered",
      "Each institution should decide its own policy",
      "Alternative approaches to diversity should be explored"
    ]
  },
  {
    text: "Should electric vehicle purchases be subsidized by taxpayers?",
    options: [
      "Yes, to accelerate the transition to clean energy",
      "No, government shouldn't pick winners and losers",
      "Only for lower-income buyers",
      "Subsidies should focus on charging infrastructure instead",
      "Carbon pricing would be more effective than subsidies"
    ]
  },
  {
    text: "Should cryptocurrency be banned or heavily regulated due to environmental concerns?",
    options: [
      "Yes, the environmental cost is too high",
      "No, innovation should not be stifled",
      "Only energy-intensive proof-of-work systems should be restricted",
      "Market forces will drive adoption of greener alternatives",
      "Carbon offsetting should be required for crypto operations"
    ]
  },
  {
    text: "Should the minimum wage be tied to local cost of living rather than set nationally?",
    options: [
      "Yes, cost of living varies dramatically by region",
      "No, workers deserve the same minimum protection everywhere",
      "States should set their own minimums above a federal floor",
      "It should be tied to regional median income",
      "Market forces should determine wages without government intervention"
    ]
  }
];

export async function ensureActiveQuestion(): Promise<void> {
  try {
    const activeQuestion = await storage.getActiveQuestion();
    
    if (!activeQuestion) {
      console.log("No active question found, generating automated question...");
      await generateAutomatedQuestion();
    }
  } catch (error) {
    console.error("Error ensuring active question:", error);
  }
}

async function generateAutomatedQuestion(): Promise<void> {
  // Get used questions to avoid repeats
  const usedQuestions = await storage.getQuestionHistory();
  const usedTexts = new Set(usedQuestions.map(q => q.text));
  
  // Find unused questions
  const availableQuestions = questionPool.filter(q => !usedTexts.has(q.text));
  
  // If all questions have been used, reset and use any question
  const questionsToChooseFrom = availableQuestions.length > 0 ? availableQuestions : questionPool;
  
  // Select random question
  const randomIndex = Math.floor(Math.random() * questionsToChooseFrom.length);
  const selectedQuestion = questionsToChooseFrom[randomIndex];
  
  console.log(`Generating automated question: "${selectedQuestion.text}"`);
  
  // Create the question
  const now = new Date();
  const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  const question = await storage.createQuestion({
    text: selectedQuestion.text,
    options: selectedQuestion.options,
    isActive: true,
    startDate: now,
    endDate: endDate,
    createdBy: null // System-generated questions
  });
  
  console.log(`Created automated question with ID: ${question.id}`);
  
  // Add research papers if available
  if (selectedQuestion.researchPapers) {
    for (const paper of selectedQuestion.researchPapers) {
      await storage.createResearchPaper({
        questionId: question.id,
        title: paper.title,
        source: paper.source,
        year: paper.year,
        summary: paper.summary,
        url: paper.url || "",
        type: "Academic",
        credibilityBadge: "High Credibility"
      });
    }
  }
  
  // Add action items if available
  if (selectedQuestion.actionItems) {
    for (const item of selectedQuestion.actionItems) {
      await storage.createActionItem({
        questionId: question.id,
        title: item.title,
        description: item.description,
        url: item.url || "",
        icon: "📞" // Default icon, can be customized per action type
      });
    }
  }
}

// Function to check and generate questions daily
export async function dailyQuestionCheck(): Promise<void> {
  await ensureActiveQuestion();
}