import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Wand2, RefreshCw, Palette } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface LogoDesign {
  text: string;
  style: string;
  color: string;
  fontSize: number;
  fontFamily: string;
}

const styles = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "minimalist", label: "Minimalist" },
  { value: "bold", label: "Bold" },
  { value: "elegant", label: "Elegant" },
];

const colors = [
  { value: "#000000", label: "Black" },
  { value: "#1E40AF", label: "Blue" },
  { value: "#DC2626", label: "Red" },
  { value: "#059669", label: "Green" },
  { value: "#7C3AED", label: "Purple" },
  { value: "#EA580C", label: "Orange" },
  { value: "#0891B2", label: "Cyan" },
  { value: "#BE185D", label: "Pink" },
];

const fonts = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Roboto", label: "Roboto" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Oswald", label: "Oswald" },
];

export default function LogoCreator() {
  const { user } = useAuth();
  const [design, setDesign] = useState<LogoDesign>({
    text: "",
    style: "modern",
    color: "#000000",
    fontSize: 48,
    fontFamily: "Inter",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateLogo = () => {
    if (!design.text.trim()) {
      toast.error("Please enter text for your logo");
      return;
    }

    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGenerating(false);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background based on style
    if (design.style === "minimalist") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (design.style === "bold") {
      ctx.fillStyle = design.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#FFFFFF";
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = design.color;
    }

    // Configure text
    ctx.font = `bold ${design.fontSize}px ${design.fontFamily}, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Add style effects
    if (design.style === "bold") {
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    } else if (design.style === "elegant") {
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 5;
    }

    // Draw text
    ctx.fillText(design.text, canvas.width / 2, canvas.height / 2);

    // Add decorative elements based on style
    if (design.style === "modern") {
      ctx.strokeStyle = design.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(100, canvas.height / 2);
      ctx.lineTo(250, canvas.height / 2);
      ctx.moveTo(canvas.width - 250, canvas.height / 2);
      ctx.lineTo(canvas.width - 100, canvas.height / 2);
      ctx.stroke();
    } else if (design.style === "classic") {
      ctx.fillStyle = design.color;
      ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 60, 300, 4);
      ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 + 56, 300, 4);
    }

    setIsGenerating(false);
    toast.success("Logo generated successfully!");
  };

  const downloadLogo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${design.text || "logo"}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Logo downloaded!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Logo Creator</h1>
        <p className="text-gray-600">
          Create professional logos for your business or brand
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Design Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Design Your Logo</CardTitle>
            <CardDescription>
              Customize your logo with text, style, colors, and fonts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text">Logo Text *</Label>
              <Input
                id="text"
                value={design.text}
                onChange={(e) => setDesign({ ...design, text: e.target.value })}
                placeholder="Enter your brand name or text"
                maxLength={20}
              />
              <p className="text-xs text-gray-500">
                {design.text.length}/20 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select
                value={design.style}
                onValueChange={(value) => setDesign({ ...design, style: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setDesign({ ...design, color: color.value })}
                    className={`w-full h-12 rounded border-2 transition-all ${
                      design.color === color.value
                        ? "border-gray-900 scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={design.color}
                  onChange={(e) => setDesign({ ...design, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={design.color}
                  onChange={(e) => setDesign({ ...design, color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select
                value={design.fontFamily}
                onValueChange={(value) =>
                  setDesign({ ...design, fontFamily: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontSize">
                Font Size: {design.fontSize}px
              </Label>
              <Input
                id="fontSize"
                type="range"
                min="24"
                max="120"
                value={design.fontSize}
                onChange={(e) =>
                  setDesign({ ...design, fontSize: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={generateLogo}
                disabled={isGenerating || !design.text.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Logo
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Your logo will appear here</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center min-h-[400px] border-2 border-dashed border-gray-200">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto"
                style={{ display: "block" }}
              />
            </div>
            <Button
              onClick={downloadLogo}
              disabled={!design.text.trim()}
              className="w-full"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Logo
            </Button>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> For best results, use 2-3 words. Keep it simple
                and memorable. You can download and use your logo for your business,
                website, or social media.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

