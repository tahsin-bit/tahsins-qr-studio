import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Upload, 
  Move,
  Save,
  Share2,
  QrCode,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  id?: string;
  title: string;
  description?: string;
  coverPhoto?: string;
  brandLogo?: string;
  links: LinkData[];
}

const socialMediaDetector = (url: string): string | null => {
  const domain = url.toLowerCase();
  if (domain.includes('facebook.com') || domain.includes('fb.com')) return 'facebook';
  if (domain.includes('instagram.com')) return 'instagram';
  if (domain.includes('twitter.com') || domain.includes('x.com')) return 'twitter';
  if (domain.includes('linkedin.com')) return 'linkedin';
  if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'youtube';
  if (domain.includes('whatsapp.com') || domain.includes('wa.me')) return 'whatsapp';
  if (domain.includes('telegram.me') || domain.includes('t.me')) return 'telegram';
  return null;
};

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

export const WebProfileBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    title: '',
    description: '',
    links: []
  });
  
  const coverPhotoRef = useRef<HTMLInputElement>(null);
  const brandLogoRef = useRef<HTMLInputElement>(null);
  
  const handleCoverPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, coverPhoto: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleBrandLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, brandLogo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const addLink = () => {
    const newLink: LinkData = {
      id: Date.now().toString(),
      title: '',
      url: '',
      description: ''
    };
    setProfile(prev => ({ ...prev, links: [...prev.links, newLink] }));
  };
  
  const updateLink = (id: string, field: keyof LinkData, value: string) => {
    setProfile(prev => ({
      ...prev,
      links: prev.links.map(link => {
        if (link.id === id) {
          const updatedLink = { ...link, [field]: value };
          
          // Auto-detect social media and set icon
          if (field === 'url') {
            const socialType = socialMediaDetector(value);
            updatedLink.socialIcon = socialType || undefined;
          }
          
          return updatedLink;
        }
        return link;
      })
    }));
  };
  
  const removeLink = (id: string) => {
    setProfile(prev => ({ ...prev, links: prev.links.filter(link => link.id !== id) }));
  };
  
  const handleCustomLogoUpload = (linkId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateLink(linkId, 'customLogo', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const saveProfile = () => {
    if (!profile.title.trim()) {
      toast({ title: "Error", description: "Profile title is required", variant: "destructive" });
      return;
    }
    
    const profileId = Date.now().toString();
    const profileWithId = { ...profile, id: profileId };
    
    // Save to localStorage (in real app, this would be saved to database)
    localStorage.setItem(`profile_${profileId}`, JSON.stringify(profileWithId));
    
    toast({ title: "Success", description: "Profile saved successfully!" });
    
    // Navigate to the published profile
    navigate(`/profile/${profileId}`);
  };
  
  const generateQRCode = () => {
    if (!profile.title.trim()) {
      toast({ title: "Error", description: "Please save your profile first", variant: "destructive" });
      return;
    }
    
    // For now, just navigate to QR generator with profile data
    navigate('/', { state: { profileData: profile } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/')}>
                ← Back to QR Generator
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Web Profile Builder</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={generateQRCode} className="gap-2">
                <QrCode className="w-4 h-4" />
                Generate QR Code
              </Button>
              <Button onClick={saveProfile} className="gap-2">
                <Save className="w-4 h-4" />
                Save & Publish
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Builder Panel */}
          <div className="space-y-6">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="profile-title">Profile Title</Label>
                  <Input
                    id="profile-title"
                    value={profile.title}
                    onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Your Name or Brand"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-description">Description (Optional)</Label>
                  <Textarea
                    id="profile-description"
                    value={profile.description || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell people about yourself or your brand"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cover Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Cover Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => coverPhotoRef.current?.click()}
                    className="w-full gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Cover Photo
                  </Button>
                  <input
                    ref={coverPhotoRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPhotoUpload}
                    className="hidden"
                  />
                  {profile.coverPhoto && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                      <img
                        src={profile.coverPhoto}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Brand Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => brandLogoRef.current?.click()}
                    className="w-full gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Brand Logo
                  </Button>
                  <input
                    ref={brandLogoRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBrandLogoUpload}
                    className="hidden"
                  />
                  {profile.brandLogo && (
                    <div className="flex justify-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden border border-border">
                        <img
                          src={profile.brandLogo}
                          alt="Brand Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Links Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Links</CardTitle>
                  <Button onClick={addLink} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Link
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.links.map((link, index) => (
                    <div key={link.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Link {index + 1}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLink(link.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={link.title}
                            onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                            placeholder="Link title"
                          />
                        </div>
                        
                        <div>
                          <Label>URL</Label>
                          <Input
                            value={link.url}
                            onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                            placeholder="https://example.com"
                          />
                        </div>
                        
                        <div>
                          <Label>Description (Optional)</Label>
                          <Input
                            value={link.description || ''}
                            onChange={(e) => updateLink(link.id, 'description', e.target.value)}
                            placeholder="Brief description"
                          />
                        </div>

                        {/* Icon Preview */}
                        <div className="flex items-center gap-2">
                          {link.socialIcon ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <SocialIcon type={link.socialIcon} className="w-4 h-4" />
                              <span>Auto-detected: {link.socialIcon}</span>
                            </div>
                          ) : link.customLogo ? (
                            <div className="flex items-center gap-2">
                              <img src={link.customLogo} alt="Custom logo" className="w-6 h-6 rounded" />
                              <span className="text-sm text-muted-foreground">Custom logo</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleCustomLogoUpload(link.id, e)}
                                className="hidden"
                                id={`logo-${link.id}`}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`logo-${link.id}`)?.click()}
                                className="gap-2"
                              >
                                <Upload className="w-3 h-3" />
                                Upload Logo
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {profile.links.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No links added yet. Click "Add Link" to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-card rounded-lg overflow-hidden border border-border">
                  {/* Cover Photo */}
                  <div className="relative h-32 bg-gradient-primary">
                    {profile.coverPhoto && (
                      <img
                        src={profile.coverPhoto}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  
                  {/* Brand Logo */}
                  <div className="relative -mt-12 flex justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-card bg-card overflow-hidden">
                      {profile.brandLogo ? (
                        <img
                          src={profile.brandLogo}
                          alt="Brand Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Profile Info */}
                  <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      {profile.title || 'Your Profile Title'}
                    </h2>
                    {profile.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {profile.description}
                      </p>
                    )}
                    
                    {/* Links */}
                    <div className="space-y-3">
                      {profile.links.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div className="w-8 h-8 flex items-center justify-center">
                            {link.socialIcon ? (
                              <SocialIcon type={link.socialIcon} className="w-5 h-5" />
                            ) : link.customLogo ? (
                              <img src={link.customLogo} alt="" className="w-6 h-6 rounded" />
                            ) : (
                              <Globe className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-foreground">
                              {link.title || 'Link Title'}
                            </div>
                            {link.description && (
                              <div className="text-xs text-muted-foreground">
                                {link.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};