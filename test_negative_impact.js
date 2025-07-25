// Test how negative messages impact the weighted sentiment calculation
import WebSocket from 'ws';

async function testNegativeImpact() {
  const ws = new WebSocket('ws://localhost:5000/ws');
  
  ws.on('open', () => {
    console.log('Connected to WebSocket');
    
    ws.send(JSON.stringify({
      type: 'join',
      userId: 'test-user-sentiment',
      questionId: 1
    }));
    
    console.log('Sending highly negative message...');
    ws.send(JSON.stringify({
      type: 'chat_message',
      content: 'This is fucking terrible, I hate this bullshit approach. Complete waste of time!'
    }));
    
    setTimeout(() => {
      console.log('Sending another negative message...');
      ws.send(JSON.stringify({
        type: 'chat_message',
        content: 'Shit, this sucks so bad. Awful and stupid idea.'
      }));
    }, 2000);
    
    setTimeout(() => ws.close(), 5000);
  });
  
  ws.on('message', (data) => {
    const parsed = JSON.parse(data.toString());
    if (parsed.type === 'sentiment_update') {
      console.log(`Sentiment Update - Avg: ${parsed.avgSentiment.toFixed(3)}, Positive %: ${parsed.positivePercentage.toFixed(1)}%`);
    }
  });
  
  ws.on('close', () => {
    console.log('Test completed');
  });
}

testNegativeImpact();