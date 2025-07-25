// Comprehensive sentiment analysis testing and reporting
import { analyzeSentiment, getSentimentLabel } from './server/sentimentAnalysis.ts';

const testCategories = {
  "Highly Positive": [
    "This is absolutely amazing! I love this approach!",
    "What a brilliant and thoughtful discussion! Thank you all!",
    "I'm so grateful for this enlightening conversation!",
    "This platform is fantastic for bringing people together!",
    "Your insights are incredibly valuable and inspiring!"
  ],
  
  "Constructive Positive": [
    "I appreciate your perspective, it helps me understand better.",
    "This discussion is really opening my mind to new ideas.",
    "Thank you for sharing that research, it's very helpful.",
    "I can see the value in both approaches we've discussed.",
    "The diversity of viewpoints here is truly enlightening."
  ],
  
  "Neutral/Informative": [
    "According to recent studies, social media usage has increased.",
    "The data shows mixed results on this particular topic.",
    "Research indicates several trends worth considering here.",
    "The study sample size was 10,000 participants total.",
    "Different demographics show varying usage patterns."
  ],
  
  "Constructive Critical": [
    "I disagree with this approach, but I understand the reasoning.",
    "While I see the benefits, I'm concerned about potential downsides.",
    "I question whether this addresses the underlying issues effectively.",
    "This solution seems incomplete, though it's a good start.",
    "I have reservations about the feasibility, but appreciate the effort."
  ],
  
  "Negative": [
    "This is a terrible idea that will never work.",
    "I hate this approach, it's completely useless and pointless.",
    "This is stupid and a complete waste of everyone's time.",
    "What a horrible and destructive policy proposal.",
    "This is impossible and hopeless, total disaster waiting to happen."
  ]
};

function runSentimentTests() {
  console.log("🧠 SENTIMENT ANALYSIS COMPREHENSIVE TEST REPORT");
  console.log("=" .repeat(60));
  
  let totalTests = 0;
  let categoryResults = {};
  
  for (const [category, messages] of Object.entries(testCategories)) {
    console.log(`\n📊 ${category.toUpperCase()}`);
    console.log("-".repeat(40));
    
    const scores = [];
    
    messages.forEach((message, index) => {
      const result = analyzeSentiment(message);
      const label = getSentimentLabel(result.score);
      
      scores.push(result.score);
      totalTests++;
      
      console.log(`${index + 1}. "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
      console.log(`   Score: ${result.score.toFixed(3)} | Magnitude: ${result.magnitude.toFixed(3)} | Label: ${label}`);
    });
    
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const positiveCount = scores.filter(s => s > 0.1).length;
    const neutralCount = scores.filter(s => s >= -0.1 && s <= 0.1).length;
    const negativeCount = scores.filter(s => s < -0.1).length;
    
    categoryResults[category] = {
      avgScore,
      positiveCount,
      neutralCount,
      negativeCount,
      total: scores.length,
      scores
    };
    
    console.log(`   📈 Category Average: ${avgScore.toFixed(3)}`);
    console.log(`   📊 Distribution: ${positiveCount} positive, ${neutralCount} neutral, ${negativeCount} negative`);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("🎯 OVERALL ANALYSIS SUMMARY");
  console.log("=".repeat(60));
  
  for (const [category, results] of Object.entries(categoryResults)) {
    const posPercent = (results.positiveCount / results.total * 100).toFixed(1);
    const neutralPercent = (results.neutralCount / results.total * 100).toFixed(1);
    const negPercent = (results.negativeCount / results.total * 100).toFixed(1);
    
    console.log(`${category}:`);
    console.log(`  Average Score: ${results.avgScore.toFixed(3)}`);
    console.log(`  Distribution: ${posPercent}% positive, ${neutralPercent}% neutral, ${negPercent}% negative\n`);
  }
  
  console.log(`Total messages tested: ${totalTests}`);
  console.log("\n🔍 ALGORITHM EFFECTIVENESS:");
  
  // Check if algorithm correctly identifies categories
  const highly_pos_avg = categoryResults["Highly Positive"].avgScore;
  const constructive_pos_avg = categoryResults["Constructive Positive"].avgScore;
  const neutral_avg = categoryResults["Neutral/Informative"].avgScore;
  const constructive_crit_avg = categoryResults["Constructive Critical"].avgScore;
  const negative_avg = categoryResults["Negative"].avgScore;
  
  console.log(`✅ Highly Positive detection: ${highly_pos_avg > 0.3 ? 'GOOD' : 'NEEDS IMPROVEMENT'} (${highly_pos_avg.toFixed(3)})`);
  console.log(`✅ Constructive Positive detection: ${constructive_pos_avg > 0.1 ? 'GOOD' : 'NEEDS IMPROVEMENT'} (${constructive_pos_avg.toFixed(3)})`);
  console.log(`✅ Neutral detection: ${Math.abs(neutral_avg) < 0.2 ? 'GOOD' : 'NEEDS IMPROVEMENT'} (${neutral_avg.toFixed(3)})`);
  console.log(`✅ Constructive Critical detection: ${constructive_crit_avg > -0.2 && constructive_crit_avg < 0.2 ? 'GOOD' : 'NEEDS IMPROVEMENT'} (${constructive_crit_avg.toFixed(3)})`);
  console.log(`✅ Negative detection: ${negative_avg < -0.2 ? 'GOOD' : 'NEEDS IMPROVEMENT'} (${negative_avg.toFixed(3)})`);
}

// Run the comprehensive test
runSentimentTests();