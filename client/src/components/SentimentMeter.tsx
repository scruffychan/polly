interface SentimentMeterProps {
  avgSentiment: number;
  positivePercentage: number;
}

export default function SentimentMeter({ avgSentiment, positivePercentage }: SentimentMeterProps) {
  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.3) return 'Constructive';
    if (sentiment > 0.1) return 'Positive';
    if (sentiment > -0.1) return 'Neutral';
    if (sentiment > -0.3) return 'Critical';
    return 'Negative';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'bg-green-400';
    if (sentiment > 0.1) return 'bg-blue-400';
    if (sentiment > -0.1) return 'bg-gray-400';
    if (sentiment > -0.3) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-600">Discussion Tone:</span>
      <div className="flex items-center space-x-2">
        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getSentimentColor(avgSentiment)}`}
            style={{ width: `${Math.max(10, positivePercentage)}%` }}
          ></div>
        </div>
        <span className={`text-sm font-medium ${
          avgSentiment > 0.1 ? 'text-green-600' : 
          avgSentiment > -0.1 ? 'text-gray-600' : 'text-red-600'
        }`}>
          {getSentimentLabel(avgSentiment)}
        </span>
      </div>
    </div>
  );
}
