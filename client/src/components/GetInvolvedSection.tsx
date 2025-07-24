import { Card, CardContent } from "@/components/ui/card";

interface ActionItem {
  id: number;
  title: string;
  description: string;
  url: string;
  icon: string;
}

interface GetInvolvedSectionProps {
  actionItems: ActionItem[];
}

export default function GetInvolvedSection({ actionItems }: GetInvolvedSectionProps) {
  if (!actionItems || actionItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
          <i className="fas fa-hands-helping text-accent mr-2"></i>
          Take Action
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {actionItems.map((item) => (
            <div 
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-accent hover:shadow-md transition-all"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${item.icon} text-accent`}></i>
                </div>
                <div>
                  <h4 className="font-medium text-text mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <a 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline text-sm font-medium"
                  >
                    Learn More →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
