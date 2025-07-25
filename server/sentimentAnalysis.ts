export interface SentimentResult {
  score: number; // -1 to 1, where -1 is negative, 0 is neutral, 1 is positive
  magnitude: number; // 0 to 1, intensity of sentiment
}

// Simple sentiment analysis using keyword-based approach
export function analyzeSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like',
    'happy', 'pleased', 'excited', 'brilliant', 'awesome', 'perfect', 'best', 'beautiful',
    'agree', 'support', 'helpful', 'valuable', 'important', 'appreciate', 'thank',
    'constructive', 'insightful', 'interesting', 'thoughtful', 'reasonable', 'fair',
    'solution', 'opportunity', 'progress', 'hope', 'optimistic', 'positive', 'inspiring',
    'refreshing', 'enlightening', 'grateful', 'faith', 'brilliant', 'quality', 'learning'
  ];

  // Negative keywords (weighted by severity)
  const strongNegativeWords = [
    'hate', 'horrible', 'terrible', 'awful', 'stupid', 'ridiculous', 'useless', 'pointless',
    'disaster', 'impossible', 'hopeless', 'destructive', 'dangerous', 'waste'
  ];
  
  const moderateNegativeWords = [
    'bad', 'dislike', 'angry', 'upset', 'disappointed', 'frustrated', 'worried', 
    'concerned', 'wrong', 'problem', 'issue', 'failure', 'harmful', 'pessimistic', 
    'negative', 'fear', 'threat', 'oppose', 'against'
  ];
  
  const mildNegativeWords = [
    'disagree'  // This can be constructive, so weight it less
  ];

  // Common ground and constructive words (get bonus points)
  const constructiveWords = [
    'understand', 'perspective', 'common ground', 'together', 'compromise', 'balance',
    'both sides', 'middle ground', 'collaborate', 'cooperation', 'listen', 'respect',
    'discussion', 'dialogue', 'conversation', 'consider', 'think about', 'maybe',
    'perhaps', 'could be', 'might', 'possibly', 'research shows', 'evidence',
    'study', 'data', 'facts', 'information', 'diverse', 'viewpoints', 'nuanced',
    'backing up', 'well-reasoned', 'civil', 'respectful', 'thoughtful discussion'
  ];
  
  // Context modifiers that can change sentiment
  const contextModifiers = [
    { phrase: 'but I understand', modifier: 0.3 },
    { phrase: 'however I see', modifier: 0.2 },
    { phrase: 'while I disagree', modifier: 0.2 },
    { phrase: 'I respectfully disagree', modifier: 0.4 },
    { phrase: 'mixed results', modifier: 0 }, // Keep neutral
    { phrase: 'worth considering', modifier: 0.1 }
  ];

  let positiveScore = 0;
  let negativeScore = 0;
  let constructiveScore = 0;

  // Count positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveScore += matches.length;
  });

  // Count negative words with different weights
  strongNegativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeScore += matches.length * 2; // Weight strong negative words more
  });
  
  moderateNegativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeScore += matches.length * 1.2; // Moderate weight
  });
  
  mildNegativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeScore += matches.length * 0.5; // Light weight for potentially constructive disagreement
  });

  // Count constructive words (bonus for constructive dialogue)
  constructiveWords.forEach(phrase => {
    const regex = new RegExp(phrase.replace(/\s+/g, '\\s+'), 'gi');
    const matches = lowerText.match(regex);
    if (matches) constructiveScore += matches.length * 1.5; // Weight constructive language higher
  });
  
  // Apply context modifiers
  let contextAdjustment = 0;
  contextModifiers.forEach(({ phrase, modifier }) => {
    const regex = new RegExp(phrase.replace(/\s+/g, '\\s+'), 'gi');
    if (lowerText.match(regex)) {
      contextAdjustment += modifier;
    }
  });

  // Calculate base sentiment
  const totalWords = text.split(/\s+/).length;
  const netSentiment = (positiveScore + constructiveScore + contextAdjustment) - negativeScore;
  
  // Normalize score between -1 and 1
  let score = netSentiment / Math.max(totalWords, 1);
  score = Math.max(-1, Math.min(1, score));

  // Calculate magnitude (how strong the sentiment is)
  const totalSentimentWords = positiveScore + negativeScore + constructiveScore;
  let magnitude = totalSentimentWords / Math.max(totalWords, 1);
  magnitude = Math.min(1, magnitude);

  return {
    score: Number(score.toFixed(3)),
    magnitude: Number(magnitude.toFixed(3))
  };
}

export function getSentimentLabel(score: number): string {
  if (score > 0.3) return 'Constructive';
  if (score > 0.1) return 'Positive';
  if (score > -0.1) return 'Neutral';
  if (score > -0.3) return 'Critical';
  return 'Negative';
}

export function getSentimentColor(score: number): string {
  if (score > 0.3) return 'green';
  if (score > 0.1) return 'blue';
  if (score > -0.1) return 'gray';
  if (score > -0.3) return 'yellow';
  return 'red';
}
