import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Calculator, 
  FileText, 
  Image, 
  QrCode, 
  Clock, 
  Calendar,
  Palette,
  Type,
  Hash,
  Globe,
  ExternalLink
} from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  details: string;
}

const tools: Tool[] = [
  {
    id: "calculator",
    name: "Calculator",
    description: "Online scientific calculator",
    icon: <Calculator className="h-8 w-8" />,
    link: "https://www.calculator.net/",
    details: "A free online calculator with scientific, mortgage, loan, and other calculators."
  },
  {
    id: "pdf-tools",
    name: "PDF Tools",
    description: "Edit, merge, split PDFs",
    icon: <FileText className="h-8 w-8" />,
    link: "https://www.ilovepdf.com/",
    details: "Every tool you need to work with PDFs in one place. Merge, split, compress, convert, rotate, unlock and watermark PDFs."
  },
  {
    id: "image-editor",
    name: "Image Editor",
    description: "Edit images online",
    icon: <Image className="h-8 w-8" />,
    link: "https://www.photopea.com/",
    details: "A free online image editor similar to Photoshop. Edit photos, create designs, and more."
  },
  {
    id: "qr-generator",
    name: "QR Generator",
    description: "Create QR codes",
    icon: <QrCode className="h-8 w-8" />,
    link: "https://www.qr-code-generator.com/",
    details: "Generate QR codes for URLs, text, email, phone numbers, and more."
  },
  {
    id: "world-clock",
    name: "World Clock",
    description: "Check time zones",
    icon: <Clock className="h-8 w-8" />,
    link: "https://www.timeanddate.com/worldclock/",
    details: "View current time in cities around the world. Convert time zones and plan meetings across locations."
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "View calendar & holidays",
    icon: <Calendar className="h-8 w-8" />,
    link: "https://www.timeanddate.com/calendar/",
    details: "View calendars for any year, check holidays, and plan events."
  },
  {
    id: "color-picker",
    name: "Color Picker",
    description: "Pick & convert colors",
    icon: <Palette className="h-8 w-8" />,
    link: "https://colorpicker.me/",
    details: "Pick colors from anywhere, convert between formats (HEX, RGB, HSL), and create color palettes."
  },
  {
    id: "font-finder",
    name: "Font Finder",
    description: "Identify & explore fonts",
    icon: <Type className="h-8 w-8" />,
    link: "https://fonts.google.com/",
    details: "Explore Google Fonts library with over 1500 free fonts for any project."
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate secure passwords",
    icon: <Hash className="h-8 w-8" />,
    link: "https://passwordsgenerator.net/",
    details: "Generate strong, secure passwords with customizable length and character types."
  },
  {
    id: "speed-test",
    name: "Speed Test",
    description: "Test internet speed",
    icon: <Globe className="h-8 w-8" />,
    link: "https://www.speedtest.net/",
    details: "Test your internet connection speed including download, upload, and ping."
  }
];

const Tools = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tools</h1>
          <p className="text-muted-foreground">Useful online tools at your fingertips</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Card 
              key={tool.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              onClick={() => setSelectedTool(tool)}
            >
              <CardHeader className="pb-2">
                <div className="text-primary mb-2">{tool.icon}</div>
                <CardTitle className="text-lg">{tool.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="text-primary">{selectedTool?.icon}</div>
              <DialogTitle>{selectedTool?.name}</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              {selectedTool?.details}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button asChild>
              <a href={selectedTool?.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Visit Tool
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Tools;
