import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  QrCode, 
  ExternalLink,
  Copy,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Globe,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LinkData {
  id: string;
  title: string;
  url: string;
  description?: string;
  customLogo?: string;
  socialIcon?: string;
}

interface ProfileData {
  id: string;
  title: string;
  description?: string;
  coverPhoto?: string;
  brandLogo?: string;
  links: LinkData[];
}

const SocialIcon = ({ type, className }: { type: string; className?: string }) => {
  const iconMap = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    whatsapp: MessageCircle,
    telegram: MessageCircle,
  };
  
  const IconComponent = iconMap[type as keyof typeof iconMap] || Globe;
  return <IconComponent className={className} />;
};

export const WebProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Load profile from localStorage (in real app, this would be from API)
      const saved = localStorage.getItem(`profile_${id}`);
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    }
    setLoading(false);
  }, [id]);

  const handleLinkClick = (url: string) => {
    // Ensure URL has protocol
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  const copyProfileUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({ title: "Success", description: "Profile URL copied to clipboard!" });
  };

  const generateQRCode = () => {
    if (profile) {
      navigate('/', { state: { profileUrl: window.location.href, profileData: profile } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first design */}
      <div className="max-w-md mx-auto bg-card">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-primary">
          {profile.coverPhoto && (
            <img
              src={profile.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={copyProfileUrl}
              className="bg-background/80 backdrop-blur-sm hover:bg-background/90 gap-2"
            >
              <Copy className="w-3 h-3" />
              Share
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={generateQRCode}
              className="bg-background/80 backdrop-blur-sm hover:bg-background/90 gap-2"
            >
              <QrCode className="w-3 h-3" />
              QR
            </Button>
          </div>
        </div>
        
        {/* Brand Logo */}
        <div className="relative -mt-16 flex justify-center px-6">
          <div className="w-32 h-32 rounded-full border-4 border-card bg-card overflow-hidden shadow-lg">
            {profile.brandLogo ? (
              <img
                src={profile.brandLogo}
                alt="Brand Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {profile.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {profile.title}
          </h1>
          
          {profile.description && (
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {profile.description}
            </p>
          )}
          
          {/* Links */}
          <div className="space-y-3">
            {profile.links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.url)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-card border border-border hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] group"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
                  {link.socialIcon ? (
                    <SocialIcon type={link.socialIcon} className="w-6 h-6 text-primary" />
                  ) : link.customLogo ? (
                    <img src={link.customLogo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <Globe className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    {link.title}
                    <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {link.description && (
                    <div className="text-sm text-muted-foreground">
                      {link.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {profile.links.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No links available</p>
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-border text-center">
            <Badge variant="outline" className="text-xs">
              Made with Tahsin's QR Studio
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};