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
    'solution', 'opportunity', 'progress', 'hope', 'optimistic', 'positive'
  ];

  // Negative keywords
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'angry', 'upset',
    'disappointed', 'frustrated', 'worried', 'concerned', 'wrong', 'stupid', 'ridiculous',
    'disagree', 'oppose', 'against', 'problem', 'issue', 'failure', 'disaster',
    'destructive', 'harmful', 'dangerous', 'waste', 'useless', 'pointless',
    'impossible', 'hopeless', 'pessimistic', 'negative', 'fear', 'threat'
  ];

  // Common ground and constructive words (get bonus points)
  const constructiveWords = [
    'understand', 'perspective', 'common ground', 'together', 'compromise', 'balance',
    'both sides', 'middle ground', 'collaborate', 'cooperation', 'listen', 'respect',
    'discussion', 'dialogue', 'conversation', 'consider', 'think about', 'maybe',
    'perhaps', 'could be', 'might', 'possibly', 'research shows', 'evidence',
    'study', 'data', 'facts', 'information'
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

  // Count negative words
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeScore += matches.length;
  });

  // Count constructive words (bonus for constructive dialogue)
  constructiveWords.forEach(phrase => {
    const regex = new RegExp(phrase.replace(/\s+/g, '\\s+'), 'gi');
    const matches = lowerText.match(regex);
    if (matches) constructiveScore += matches.length * 1.5; // Weight constructive language higher
  });

  // Calculate base sentiment
  const totalWords = text.split(/\s+/).length;
  const netSentiment = (positiveScore + constructiveScore) - negativeScore;
  
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
