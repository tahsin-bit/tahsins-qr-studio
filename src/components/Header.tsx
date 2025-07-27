import { QrCode, Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="relative overflow-hidden bg-gradient-card border-b border-qr-primary/20 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-primary opacity-5" />
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-qr-primary/20 rounded-full border border-qr-primary/30 shadow-glow">
              <QrCode className="w-8 h-8 text-qr-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              QR Studio
            </h1>
            <Sparkles className="w-6 h-6 text-qr-secondary animate-pulse" />
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create beautiful, customizable QR codes with logos and themes. 
            Perfect for branding, marketing, and professional use.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-qr-primary rounded-full" />
              <span>Custom Colors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-qr-secondary rounded-full" />
              <span>Logo Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-qr-accent rounded-full" />
              <span>High Quality</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};