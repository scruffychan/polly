// Test script to generate 50 test messages for sentiment analysis
import WebSocket from 'ws';

const testMessages = [
  // Positive messages
  "I really appreciate this thoughtful discussion!",
  "This is a great way to bring people together.",
  "Thank you for sharing your perspective, it helps me understand better.",
  "I love how this platform encourages respectful dialogue.",
  "What an excellent point! I hadn't considered that angle.",
  "This conversation is really opening my mind to new ideas.",
  "I'm grateful we can discuss this civilly despite our differences.",
  "Your insights are valuable and well-reasoned.",
  "This is exactly the kind of constructive debate we need more of.",
  "I appreciate everyone keeping this discussion respectful.",
  
  // Neutral/informative messages
  "According to recent studies, social media usage has increased by 30%.",
  "The data shows mixed results on this topic.",
  "Let me share some research I found on this subject.",
  "There are valid arguments on both sides of this issue.",
  "The statistics indicate several trends worth considering.",
  "This policy has been implemented in several countries already.",
  "The research methodology used here is quite comprehensive.",
  "Historical context shows this isn't a new debate.",
  "Economic factors play a significant role in this discussion.",
  "The survey results were published last month.",
  "Legal experts have varying opinions on this matter.",
  "The implementation timeline spans several years.",
  "Different demographics show different usage patterns.",
  "The study sample size was 10,000 participants.",
  "Regulatory frameworks vary significantly between regions.",
  
  // Slightly negative but constructive
  "I disagree with this approach, but I understand the reasoning.",
  "This solution seems incomplete to me.",
  "I'm concerned about the potential negative consequences.",
  "While I see the benefits, I worry about the downsides.",
  "This policy might not address the root cause of the problem.",
  "I question whether this is the most effective solution.",
  "The proposed timeline seems unrealistic given the complexity.",
  "I'm skeptical about whether this will actually work in practice.",
  "This approach has failed in other contexts before.",
  "The cost-benefit analysis doesn't seem favorable.",
  "I'm not convinced this addresses the underlying issues.",
  "The potential for unintended consequences seems high.",
  "This might create more problems than it solves.",
  "The evidence supporting this approach is limited.",
  "I have reservations about the feasibility of this plan.",
  
  // More positive messages
  "This discussion has really changed my perspective for the better.",
  "I'm inspired by the quality of conversation here.",
  "What a refreshing approach to handling controversial topics!",
  "The respectful tone here gives me hope for productive dialogue.",
  "I'm learning so much from everyone's different viewpoints.",
  "This platform is brilliant for fostering understanding.",
  "Thank you all for such an enlightening discussion.",
  "The diversity of perspectives here is truly valuable.",
  "I feel more informed after reading everyone's contributions.",
  "This is how democracy should work - through respectful debate.",
  "The moderators are doing an excellent job keeping this civil.",
  "I appreciate how everyone is backing up their points with evidence.",
  "This gives me faith that we can solve complex problems together.",
  "The nuanced discussion here is exactly what we need more of.",
  "I'm grateful for this opportunity to engage with different viewpoints."
];

// Simulate sending messages via WebSocket
async function testSentiment() {
  const ws = new WebSocket('ws://localhost:5000/ws');
  
  ws.on('open', () => {
    console.log('Connected to WebSocket');
    
    // Send join message first
    ws.send(JSON.stringify({
      type: 'join',
      userId: 'test-user-sentiment',
      questionId: 1
    }));
    
    let messageIndex = 0;
    
    // Send messages with delay to simulate real chat
    const sendNextMessage = () => {
      if (messageIndex < testMessages.length) {
        const message = testMessages[messageIndex];
        console.log(`Sending message ${messageIndex + 1}: ${message.substring(0, 50)}...`);
        
        ws.send(JSON.stringify({
          type: 'chat_message',
          content: message
        }));
        
        messageIndex++;
        setTimeout(sendNextMessage, 500); // 500ms delay between messages
      } else {
        console.log('All test messages sent!');
        setTimeout(() => ws.close(), 2000);
      }
    };
    
    // Start sending messages after a short delay
    setTimeout(sendNextMessage, 1000);
  });
  
  ws.on('message', (data) => {
    const parsed = JSON.parse(data.toString());
    if (parsed.type === 'sentiment_update') {
      console.log(`Sentiment Update - Avg: ${parsed.avgSentiment.toFixed(2)}, Positive %: ${parsed.positivePercentage.toFixed(1)}%`);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
}

testSentiment();