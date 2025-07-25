// Test the problematic message to see what's wrong
function analyzeSentiment(text) {
  const lowerText = text.toLowerCase();
  
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like',
    'happy', 'pleased', 'excited', 'brilliant', 'awesome', 'perfect', 'best', 'beautiful',
    'agree', 'support', 'helpful', 'valuable', 'important', 'appreciate', 'thank',
    'constructive', 'insightful', 'interesting', 'thoughtful', 'reasonable', 'fair',
    'solution', 'opportunity', 'progress', 'hope', 'optimistic', 'positive', 'inspiring',
    'refreshing', 'enlightening', 'grateful', 'faith', 'brilliant', 'quality', 'learning'
  ];

  const strongNegativeWords = [
    'hate', 'horrible', 'terrible', 'awful', 'stupid', 'ridiculous', 'useless', 'pointless',
    'disaster', 'impossible', 'hopeless', 'destructive', 'dangerous', 'waste', 'shit', 'fuck',
    'damn', 'crap'
  ];
  
  const moderateNegativeWords = [
    'bad', 'dislike', 'angry', 'upset', 'disappointed', 'frustrated', 'worried', 
    'concerned', 'wrong', 'problem', 'issue', 'failure', 'harmful', 'pessimistic', 
    'negative', 'fear', 'threat', 'oppose', 'against'
  ];
  
  const mildNegativeWords = [
    'disagree'
  ];

  const constructiveWords = [
    'understand', 'perspective', 'common ground', 'together', 'compromise', 'balance',
    'both sides', 'middle ground', 'collaborate', 'cooperation', 'listen', 'respect',
    'discussion', 'dialogue', 'conversation', 'consider', 'think about', 'maybe',
    'perhaps', 'could be', 'might', 'possibly', 'research shows', 'evidence',
    'study', 'data', 'facts', 'information', 'diverse', 'viewpoints', 'nuanced',
    'backing up', 'well-reasoned', 'civil', 'respectful', 'thoughtful discussion'
  ];

  let positiveScore = 0;
  let negativeScore = 0;
  let constructiveScore = 0;

  // Count positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      console.log(`Found positive word: "${word}" x${matches.length}`);
      positiveScore += matches.length;
    }
  });

  // Count negative words with different weights
  strongNegativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      console.log(`Found strong negative word: "${word}" x${matches.length} (weight 2x)`);
      negativeScore += matches.length * 2;
    }
  });
  
  moderateNegativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      console.log(`Found moderate negative word: "${word}" x${matches.length} (weight 1.2x)`);
      negativeScore += matches.length * 1.2;
    }
  });
  
  mildNegativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      console.log(`Found mild negative word: "${word}" x${matches.length} (weight 0.5x)`);
      negativeScore += matches.length * 0.5;
    }
  });

  // Count constructive words
  constructiveWords.forEach(phrase => {
    const regex = new RegExp(phrase.replace(/\s+/g, '\\s+'), 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      console.log(`Found constructive phrase: "${phrase}" x${matches.length} (weight 1.5x)`);
      constructiveScore += matches.length * 1.5;
    }
  });

  const totalWords = text.split(/\s+/).length;
  const netSentiment = (positiveScore + constructiveScore) - negativeScore;
  
  let score = netSentiment / Math.max(totalWords, 1);
  score = Math.max(-1, Math.min(1, score));

  const totalSentimentWords = positiveScore + negativeScore + constructiveScore;
  let magnitude = totalSentimentWords / Math.max(totalWords, 1);
  magnitude = Math.min(1, magnitude);

  console.log(`\nScoring breakdown for: "${text}"`);
  console.log(`Total words: ${totalWords}`);
  console.log(`Positive score: ${positiveScore}`);
  console.log(`Negative score: ${negativeScore}`);
  console.log(`Constructive score: ${constructiveScore}`);
  console.log(`Net sentiment: ${netSentiment}`);
  console.log(`Final score: ${score.toFixed(3)}`);
  console.log(`Magnitude: ${magnitude.toFixed(3)}`);

  return {
    score: Number(score.toFixed(3)),
    magnitude: Number(magnitude.toFixed(3))
  };
}

function getSentimentLabel(score) {
  if (score > 0.3) return 'Constructive';
  if (score > 0.1) return 'Positive';
  if (score > -0.1) return 'Neutral';
  if (score > -0.3) return 'Critical';
  return 'Negative';
}

// Test the problematic message
const testMessage = "Shit i hate this, terrible, awful";
const result = analyzeSentiment(testMessage);
const label = getSentimentLabel(result.score);

console.log(`\nFINAL RESULT:`);
console.log(`Label: ${label}`);
console.log(`This should definitely be NEGATIVE, not positive!`);