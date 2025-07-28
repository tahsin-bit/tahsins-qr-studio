import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, Upload, Palette, QrCode, Square } from "lucide-react";
import { toast } from "sonner";

interface QROptions {
  text: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  margin: number;
  frameType: "none" | "simple" | "rounded" | "gradient" | "neon" | "vintage";
  frameColor: string;
}

export const QRGenerator = () => {
  const [options, setOptions] = useState<QROptions>({
    text: "https://lovable.dev",
    size: 300,
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    errorCorrectionLevel: "M",
    margin: 4,
    frameType: "none",
    frameColor: "#6366f1",
  });
  
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generateQR();
  }, [options, logoDataUrl]);

  const drawFrame = (ctx: CanvasRenderingContext2D, frameSize: number) => {
    const padding = frameSize * 0.1;
    const frameWidth = frameSize - padding * 2;
    const frameHeight = frameSize - padding * 2;
    
    ctx.save();
    
    switch (options.frameType) {
      case "simple":
        ctx.strokeStyle = options.frameColor;
        ctx.lineWidth = 8;
        ctx.strokeRect(padding, padding, frameWidth, frameHeight);
        break;
        
      case "rounded":
        const radius = 20;
        ctx.strokeStyle = options.frameColor;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.roundRect(padding, padding, frameWidth, frameHeight, radius);
        ctx.stroke();
        break;
        
      case "gradient":
        const gradient = ctx.createLinearGradient(0, 0, frameSize, frameSize);
        gradient.addColorStop(0, options.frameColor);
        gradient.addColorStop(0.5, options.backgroundColor);
        gradient.addColorStop(1, options.frameColor);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 12;
        ctx.strokeRect(padding, padding, frameWidth, frameHeight);
        break;
        
      case "neon":
        // Outer glow
        ctx.shadowColor = options.frameColor;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = options.frameColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(padding, padding, frameWidth, frameHeight);
        // Inner glow
        ctx.shadowBlur = 10;
        ctx.strokeRect(padding + 4, padding + 4, frameWidth - 8, frameHeight - 8);
        break;
        
      case "vintage":
        // Double border effect
        ctx.strokeStyle = options.frameColor;
        ctx.lineWidth = 12;
        ctx.strokeRect(padding, padding, frameWidth, frameHeight);
        ctx.strokeStyle = options.backgroundColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(padding + 4, padding + 4, frameWidth - 8, frameHeight - 8);
        break;
    }
    
    ctx.restore();
  };

  const generateQR = async () => {
    try {
      const qrOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel,
        type: 'image/png' as const,
        quality: 0.92,
        margin: options.margin,
        color: {
          dark: options.foregroundColor,
          light: options.backgroundColor,
        },
        width: options.size,
      };

      const dataUrl = await QRCode.toDataURL(options.text, qrOptions);
      
      // Always use canvas for compositing (frame + logo)
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Add extra space for frames
      const frameSize = options.frameType !== "none" ? options.size + 60 : options.size;
      canvas.width = frameSize;
      canvas.height = frameSize;

      // Clear canvas
      ctx.clearRect(0, 0, frameSize, frameSize);
      
      // Draw QR code
      const qrImg = new Image();
      qrImg.onload = () => {
        const qrX = (frameSize - options.size) / 2;
        const qrY = (frameSize - options.size) / 2;
        
        ctx.drawImage(qrImg, qrX, qrY, options.size, options.size);
        
        // Draw frame if selected
        if (options.frameType !== "none") {
          drawFrame(ctx, frameSize);
        }
        
        // Draw logo if uploaded
        if (logoDataUrl) {
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoSize = options.size * 0.2;
            const logoX = (frameSize - logoSize) / 2;
            const logoY = (frameSize - logoSize) / 2;
            
            // Add background circle for logo
            ctx.fillStyle = options.backgroundColor;
            ctx.beginPath();
            ctx.arc(frameSize / 2, frameSize / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw logo
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            
            const finalDataUrl = canvas.toDataURL('image/png');
            setQrDataUrl(finalDataUrl);
          };
          logoImg.src = logoDataUrl;
        } else {
          const finalDataUrl = canvas.toDataURL('image/png');
          setQrDataUrl(finalDataUrl);
        }
      };
      qrImg.src = dataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error("Failed to generate QR code");
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Logo file size must be less than 5MB");
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoDataUrl(e.target?.result as string);
        toast.success("Logo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoDataUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Logo removed");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Controls Panel */}
      <Card className="p-6 bg-gradient-card border-qr-primary/20 shadow-card">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <QrCode className="w-6 h-6 text-qr-primary" />
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              QR Code Settings
            </h2>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="text" className="text-foreground font-medium">Content</Label>
            <Textarea
              id="text"
              placeholder="Enter text or URL..."
              value={options.text}
              onChange={(e) => setOptions(prev => ({ ...prev, text: e.target.value }))}
              className="min-h-[100px] bg-background/50 border-border focus:border-qr-primary"
            />
          </div>

          {/* Size Control */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">Size: {options.size}px</Label>
            <Slider
              value={[options.size]}
              onValueChange={(value) => setOptions(prev => ({ ...prev, size: value[0] }))}
              max={500}
              min={200}
              step={10}
              className="w-full"
            />
          </div>

          {/* Color Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fg-color" className="text-foreground font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Foreground
              </Label>
              <div className="flex gap-2">
                <Input
                  id="fg-color"
                  type="color"
                  value={options.foregroundColor}
                  onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                  className="w-16 h-10 p-1 border-border"
                />
                <Input
                  value={options.foregroundColor}
                  onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                  className="flex-1 bg-background/50 border-border focus:border-qr-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bg-color" className="text-foreground font-medium">Background</Label>
              <div className="flex gap-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={options.backgroundColor}
                  onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-16 h-10 p-1 border-border"
                />
                <Input
                  value={options.backgroundColor}
                  onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="flex-1 bg-background/50 border-border focus:border-qr-primary"
                />
              </div>
            </div>
          </div>

          {/* Error Correction */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Error Correction Level</Label>
            <Select 
              value={options.errorCorrectionLevel} 
              onValueChange={(value: "L" | "M" | "Q" | "H") => 
                setOptions(prev => ({ ...prev, errorCorrectionLevel: value }))
              }
            >
              <SelectTrigger className="bg-background/50 border-border focus:border-qr-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7%)</SelectItem>
                <SelectItem value="M">Medium (15%)</SelectItem>
                <SelectItem value="Q">Quartile (25%)</SelectItem>
                <SelectItem value="H">High (30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frame Selection */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium flex items-center gap-2">
              <Square className="w-4 h-4" />
              Frame Style
            </Label>
            <Select 
              value={options.frameType} 
              onValueChange={(value: typeof options.frameType) => 
                setOptions(prev => ({ ...prev, frameType: value }))
              }
            >
              <SelectTrigger className="bg-background/50 border-border focus:border-qr-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Frame</SelectItem>
                <SelectItem value="simple">Simple Border</SelectItem>
                <SelectItem value="rounded">Rounded Frame</SelectItem>
                <SelectItem value="gradient">Gradient Frame</SelectItem>
                <SelectItem value="neon">Neon Glow</SelectItem>
                <SelectItem value="vintage">Vintage Style</SelectItem>
              </SelectContent>
            </Select>
            
            {options.frameType !== "none" && (
              <div className="space-y-2">
                <Label htmlFor="frame-color" className="text-foreground font-medium">Frame Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="frame-color"
                    type="color"
                    value={options.frameColor}
                    onChange={(e) => setOptions(prev => ({ ...prev, frameColor: e.target.value }))}
                    className="w-16 h-10 p-1 border-border"
                  />
                  <Input
                    value={options.frameColor}
                    onChange={(e) => setOptions(prev => ({ ...prev, frameColor: e.target.value }))}
                    className="flex-1 bg-background/50 border-border focus:border-qr-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Logo Upload */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Logo (Optional)
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-qr-primary/30 hover:bg-qr-primary/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                {logoFile ? "Change Logo" : "Upload Logo"}
              </Button>
              {logoFile && (
                <Button variant="destructive" onClick={removeLogo}>
                  Remove
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            {logoFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {logoFile.name}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Preview Panel */}
      <Card className="p-6 bg-gradient-card border-qr-primary/20 shadow-card">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Preview
          </h2>
          
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="relative p-6 bg-background/10 rounded-lg border border-qr-primary/20 backdrop-blur-sm">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Generated QR Code"
                  className="max-w-full h-auto shadow-glow rounded-lg"
                />
              ) : (
                <div className="w-[300px] h-[300px] bg-muted/20 rounded-lg flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Download Button */}
          <Button 
            onClick={downloadQR}
            disabled={!qrDataUrl}
            className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium py-3 shadow-glow"
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>

          {/* Info */}
          <div className="bg-background/10 rounded-lg p-4 border border-qr-primary/20">
            <h3 className="font-medium text-foreground mb-2">QR Code Info</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Size: {options.size}×{options.size}px</p>
              <p>Error Correction: {options.errorCorrectionLevel}</p>
              <p>Content Length: {options.text.length} characters</p>
              <p>Frame: {options.frameType === "none" ? "No Frame" : options.frameType}</p>
              {logoFile && <p>Logo: {logoFile.name}</p>}
            </div>
          </div>
        </div>
      </Card>

      {/* Hidden canvas for logo compositing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};