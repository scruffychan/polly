import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

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

// Country-specific action items mapping
const getCountrySpecificActions = (country: string, baseActions: ActionItem[]): ActionItem[] => {
  const countryMappings: Record<string, Partial<ActionItem>[]> = {
    US: [
      {
        title: "Contact Your Representatives",
        description: "Reach out to your US Congress members about social media regulation and digital rights policies.",
        url: "https://www.usa.gov/elected-officials",
        icon: "fas fa-flag-usa"
      },
      {
        title: "Join Digital Rights Organizations", 
        description: "Support US organizations like EFF, ACLU working on digital rights and free speech issues.",
        url: "https://www.eff.org",
        icon: "fas fa-users"
      },
      {
        title: "Participate in FCC Public Comments",
        description: "Engage with FCC and FTC public comment periods on social media regulations.",
        url: "https://www.fcc.gov/proceedings-actions/rulemaking",
        icon: "fas fa-comment-dots"
      }
    ],
    CA: [
      {
        title: "Contact Your MP",
        description: "Reach out to your Member of Parliament about Canadian digital rights and content regulation.",
        url: "https://www.ourcommons.ca/members/en",
        icon: "fas fa-flag"
      },
      {
        title: "Support OpenMedia Canada",
        description: "Join Canada's digital rights advocacy organization fighting for internet freedom.",
        url: "https://openmedia.org",
        icon: "fas fa-users"
      },
      {
        title: "CRTC Public Consultations",
        description: "Participate in Canadian Radio-television and Telecommunications Commission consultations.",
        url: "https://crtc.gc.ca/eng/consultation/",
        icon: "fas fa-comment-dots"
      }
    ],
    GB: [
      {
        title: "Contact Your MP",
        description: "Write to your Member of Parliament about UK digital rights and online safety legislation.",
        url: "https://www.parliament.uk/mps-lords-and-offices/mps/",
        icon: "fas fa-flag"
      },
      {
        title: "Support Open Rights Group",
        description: "Join the UK's digital rights organization advocating for privacy and free expression.",
        url: "https://www.openrightsgroup.org",
        icon: "fas fa-users"
      },
      {
        title: "Ofcom Consultations",
        description: "Participate in UK communications regulator consultations on online content.",
        url: "https://www.ofcom.org.uk/consultations-and-statements",
        icon: "fas fa-comment-dots"
      }
    ],
    AU: [
      {
        title: "Contact Your MP",
        description: "Reach out to your Australian Member of Parliament about digital rights and content regulation.",
        url: "https://www.aph.gov.au/Senators_and_Members",
        icon: "fas fa-flag"
      },
      {
        title: "Support Digital Rights Watch",
        description: "Join Australia's leading digital rights advocacy organization fighting for online freedoms.",
        url: "https://digitalrightswatch.org.au",
        icon: "fas fa-users"
      },
      {
        title: "ACMA Public Consultations",
        description: "Participate in Australian Communications and Media Authority consultations on online safety.",
        url: "https://www.acma.gov.au/consultations",
        icon: "fas fa-comment-dots"
      }
    ],
    DE: [
      {
        title: "Contact Your Representative",
        description: "Reach out to your German Bundestag member about digital rights and content regulation.",
        url: "https://www.bundestag.de/en/members",
        icon: "fas fa-flag"
      },
      {
        title: "Support Digital Rights Organizations",
        description: "Join German organizations like Digitale Gesellschaft working on digital rights issues.",
        url: "https://digitalegesellschaft.de",
        icon: "fas fa-users"
      },
      {
        title: "EU Digital Services Act",
        description: "Learn about and engage with EU digital services and content moderation regulations.",
        url: "https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package",
        icon: "fas fa-comment-dots"
      }
    ],
    FR: [
      {
        title: "Contact Your Deputy",
        description: "Contact your French National Assembly deputy about digital rights and content regulation.",
        url: "https://www2.assemblee-nationale.fr/deputes/liste/alphabetique",
        icon: "fas fa-flag"
      },
      {
        title: "Support La Quadrature du Net",
        description: "Join France's leading digital rights organization defending online freedoms.",
        url: "https://www.laquadrature.net",
        icon: "fas fa-users"
      },
      {
        title: "CNIL and Digital Rights",
        description: "Engage with French data protection and digital rights regulatory processes.",
        url: "https://www.cnil.fr",
        icon: "fas fa-comment-dots"
      }
    ]
  };

  const specificActions = countryMappings[country];
  if (!specificActions) {
    return baseActions; // Fall back to original actions
  }

  return specificActions.map((action, index) => ({
    id: baseActions[index]?.id || index + 1,
    title: action.title || baseActions[index]?.title || "",
    description: action.description || baseActions[index]?.description || "",
    url: action.url || baseActions[index]?.url || "",
    icon: action.icon || baseActions[index]?.icon || "fas fa-link"
  }));
};

export default function GetInvolvedSection({ actionItems }: GetInvolvedSectionProps) {
  const [userCountry, setUserCountry] = useState<string>('US');
  const [localizedActions, setLocalizedActions] = useState<ActionItem[]>(actionItems);

  useEffect(() => {
    // Detect user's country using timezone or IP geolocation
    const detectCountry = async () => {
      try {
        // First try timezone-based detection
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (timezone.includes('America/New_York') || timezone.includes('America/Chicago') || 
            timezone.includes('America/Denver') || timezone.includes('America/Los_Angeles') ||
            timezone.includes('America/Phoenix') || timezone.includes('America/Anchorage')) {
          setUserCountry('US');
        } else if (timezone.includes('America/Toronto') || timezone.includes('America/Vancouver') ||
                   timezone.includes('America/Montreal') || timezone.includes('America/Halifax')) {
          setUserCountry('CA');
        } else if (timezone.includes('Europe/London')) {
          setUserCountry('GB');
        } else if (timezone.includes('Australia/Sydney') || timezone.includes('Australia/Melbourne') ||
                   timezone.includes('Australia/Brisbane') || timezone.includes('Australia/Perth') ||
                   timezone.includes('Australia/Adelaide') || timezone.includes('Australia/Darwin')) {
          setUserCountry('AU');
        } else if (timezone.includes('Europe/Berlin') || timezone.includes('Europe/Munich')) {
          setUserCountry('DE');
        } else if (timezone.includes('Europe/Paris')) {
          setUserCountry('FR');
        } else {
          // Fallback to IP-based detection for better accuracy
          try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const countryCode = data.country_code;
            
            // Only use detected country if we have specific resources for it
            if (countryCode && ['US', 'CA', 'GB', 'AU', 'DE', 'FR'].includes(countryCode)) {
              setUserCountry(countryCode);
            } else {
              setUserCountry('US'); // Default fallback for unsupported countries
            }
          } catch {
            setUserCountry('US'); // Default fallback
          }
        }
      } catch {
        setUserCountry('US'); // Default fallback
      }
    };

    detectCountry();
  }, []);

  useEffect(() => {
    if (actionItems && actionItems.length > 0) {
      const countrySpecificActions = getCountrySpecificActions(userCountry, actionItems);
      setLocalizedActions(countrySpecificActions);
    }
  }, [userCountry, actionItems]);

  if (!localizedActions || localizedActions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="fas fa-hands-helping text-orange-600 mr-2"></i>
          Take Action ({userCountry})
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {localizedActions.map((item) => (
            <div 
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-accent hover:shadow-md transition-all"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${item.icon} text-orange-600`}></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <a 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline text-sm font-medium"
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
