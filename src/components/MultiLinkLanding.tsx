import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface LinkData {
  title: string;
  url: string;
  description?: string;
}

export const MultiLinkLanding = () => {
  const [searchParams] = useSearchParams();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [title, setTitle] = useState("Select a Link");

  useEffect(() => {
    const encodedData = searchParams.get('data');
    if (encodedData) {
      try {
        const decodedData = JSON.parse(atob(encodedData));
        setLinks(decodedData.links || []);
        setTitle(decodedData.title || "Select a Link");
      } catch (error) {
        console.error('Error parsing link data:', error);
      }
    }
  }, [searchParams]);

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-gradient-card border-qr-primary/20 shadow-card">
        <div className="text-center mb-6">
          <Globe className="w-12 h-12 mx-auto mb-4 text-qr-primary" />
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose which link you'd like to visit
          </p>
        </div>

        <div className="space-y-3">
          {links.map((link, index) => (
            <Button
              key={index}
              onClick={() => handleLinkClick(link.url)}
              variant="outline"
              className="w-full h-auto p-4 text-left justify-start bg-background/50 hover:bg-qr-primary/10 border-border hover:border-qr-primary/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3 w-full">
                <ExternalLink className="w-5 h-5 text-qr-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {link.title}
                  </div>
                  {link.description && (
                    <div className="text-sm text-muted-foreground truncate">
                      {link.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground truncate">
                    {link.url}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {links.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No links found</p>
          </div>
        )}
      </Card>
    </div>
  );
};