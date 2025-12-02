import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
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
  Link,
  Ruler,
  FileCode,
  Languages,
  Timer,
  Percent,
  Binary,
  FileJson,
  Minimize2,
  Scissors
} from "lucide-react";
import { useState, useEffect } from "react";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  details: string;
  features: string[];
  category: string;
}

const tools: Tool[] = [
  {
    id: "calculator",
    name: "Calculator",
    description: "Online scientific calculator",
    icon: <Calculator className="h-8 w-8" />,
    link: "https://www.calculator.net/",
    details: "A free online calculator with scientific, mortgage, loan, and other calculators. Perfect for quick calculations, financial planning, and scientific computations.",
    features: ["Scientific calculations", "Financial calculators", "Unit conversions", "Math equations"],
    category: "Math & Finance"
  },
  {
    id: "pdf-tools",
    name: "PDF Tools",
    description: "Edit, merge, split PDFs",
    icon: <FileText className="h-8 w-8" />,
    link: "https://www.ilovepdf.com/",
    details: "Every tool you need to work with PDFs in one place. Merge, split, compress, convert, rotate, unlock and watermark PDFs with ease.",
    features: ["Merge PDFs", "Split PDFs", "Compress files", "Convert formats", "Add watermarks"],
    category: "Documents"
  },
  {
    id: "image-editor",
    name: "Image Editor",
    description: "Edit images online",
    icon: <Image className="h-8 w-8" />,
    link: "https://www.photopea.com/",
    details: "A free online image editor similar to Photoshop. Edit photos, create designs, apply filters, and work with layers professionally.",
    features: ["Layer editing", "Filters & effects", "Photo retouching", "Design creation"],
    category: "Design"
  },
  {
    id: "qr-generator",
    name: "QR Generator",
    description: "Create QR codes",
    icon: <QrCode className="h-8 w-8" />,
    link: "https://www.qr-code-generator.com/",
    details: "Generate QR codes for URLs, text, email, phone numbers, WiFi credentials, and more. Customize colors and download in various formats.",
    features: ["URL QR codes", "WiFi QR codes", "Custom colors", "Multiple formats"],
    category: "Utilities"
  },
  {
    id: "world-clock",
    name: "World Clock",
    description: "Check time zones",
    icon: <Clock className="h-8 w-8" />,
    link: "https://www.timeanddate.com/worldclock/",
    details: "View current time in cities around the world. Convert time zones and plan meetings across different locations efficiently.",
    features: ["Multiple time zones", "Meeting planner", "Time converter", "Daylight saving info"],
    category: "Time & Date"
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "View calendar & holidays",
    icon: <Calendar className="h-8 w-8" />,
    link: "https://www.timeanddate.com/calendar/",
    details: "View calendars for any year, check holidays for different countries, and plan events with ease.",
    features: ["Any year calendar", "Holiday lists", "Event planning", "Printable calendars"],
    category: "Time & Date"
  },
  {
    id: "color-picker",
    name: "Color Picker",
    description: "Pick & convert colors",
    icon: <Palette className="h-8 w-8" />,
    link: "https://colorpicker.me/",
    details: "Pick colors from anywhere, convert between formats (HEX, RGB, HSL), and create beautiful color palettes for your designs.",
    features: ["Color formats", "Palette generator", "Color harmonies", "Gradient creator"],
    category: "Design"
  },
  {
    id: "font-finder",
    name: "Font Finder",
    description: "Identify & explore fonts",
    icon: <Type className="h-8 w-8" />,
    link: "https://fonts.google.com/",
    details: "Explore Google Fonts library with over 1500 free fonts for any project. Preview, compare, and download fonts easily.",
    features: ["1500+ free fonts", "Font pairing", "Variable fonts", "Icon fonts"],
    category: "Design"
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate secure passwords",
    icon: <Hash className="h-8 w-8" />,
    link: "https://passwordsgenerator.net/",
    details: "Generate strong, secure passwords with customizable length and character types. Protect your accounts with unbreakable passwords.",
    features: ["Custom length", "Special characters", "No similar chars", "Bulk generation"],
    category: "Security"
  },
  {
    id: "speed-test",
    name: "Speed Test",
    description: "Test internet speed",
    icon: <Globe className="h-8 w-8" />,
    link: "https://www.speedtest.net/",
    details: "Test your internet connection speed including download, upload, and ping. Track your connection quality over time.",
    features: ["Download speed", "Upload speed", "Ping test", "Server selection"],
    category: "Network"
  },
  {
    id: "url-shortener",
    name: "URL Shortener",
    description: "Shorten long URLs",
    icon: <Link className="h-8 w-8" />,
    link: "https://bitly.com/",
    details: "Create short, memorable links for sharing. Track clicks and engagement with detailed analytics.",
    features: ["Custom short links", "Click tracking", "QR codes", "Link management"],
    category: "Utilities"
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "Convert any units",
    icon: <Ruler className="h-8 w-8" />,
    link: "https://www.unitconverters.net/",
    details: "Convert between different units of measurement including length, weight, temperature, volume, and more.",
    features: ["Length units", "Weight units", "Temperature", "Volume & area"],
    category: "Math & Finance"
  },
  {
    id: "text-formatter",
    name: "Text Formatter",
    description: "Format & transform text",
    icon: <FileCode className="h-8 w-8" />,
    link: "https://www.textfixer.com/",
    details: "Transform and format text in various ways. Convert case, remove duplicates, sort lines, and more.",
    features: ["Case conversion", "Remove duplicates", "Sort lines", "Word count"],
    category: "Text"
  },
  {
    id: "translator",
    name: "Translator",
    description: "Translate languages",
    icon: <Languages className="h-8 w-8" />,
    link: "https://translate.google.com/",
    details: "Translate text, documents, and websites between over 100 languages instantly with Google Translate.",
    features: ["100+ languages", "Document translation", "Voice input", "Camera translation"],
    category: "Text"
  },
  {
    id: "stopwatch",
    name: "Stopwatch & Timer",
    description: "Online timer tools",
    icon: <Timer className="h-8 w-8" />,
    link: "https://www.online-stopwatch.com/",
    details: "Free online stopwatch, countdown timer, and alarm clock. Perfect for workouts, cooking, and productivity.",
    features: ["Stopwatch", "Countdown timer", "Alarm clock", "Multiple timers"],
    category: "Time & Date"
  },
  {
    id: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Calculate percentages",
    icon: <Percent className="h-8 w-8" />,
    link: "https://www.calculator.net/percent-calculator.html",
    details: "Calculate percentages easily. Find percentage of a number, percentage change, and more.",
    features: ["Percentage of number", "Percentage change", "Tip calculator", "Discount calculator"],
    category: "Math & Finance"
  },
  {
    id: "binary-converter",
    name: "Binary Converter",
    description: "Convert number systems",
    icon: <Binary className="h-8 w-8" />,
    link: "https://www.rapidtables.com/convert/number/",
    details: "Convert between binary, decimal, hexadecimal, and octal number systems easily.",
    features: ["Binary to decimal", "Hex converter", "Octal converter", "ASCII converter"],
    category: "Developer"
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format & validate JSON",
    icon: <FileJson className="h-8 w-8" />,
    link: "https://jsonformatter.curiousconcept.com/",
    details: "Format, validate, and beautify JSON data. Perfect for developers working with APIs and data.",
    features: ["JSON formatter", "JSON validator", "JSON to XML", "Minify JSON"],
    category: "Developer"
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Compress images online",
    icon: <Minimize2 className="h-8 w-8" />,
    link: "https://tinypng.com/",
    details: "Compress PNG and JPEG images while maintaining quality. Reduce file sizes for faster websites.",
    features: ["PNG compression", "JPEG compression", "Bulk compression", "Quality control"],
    category: "Design"
  },
  {
    id: "screenshot-tool",
    name: "Screenshot Tool",
    description: "Capture website screenshots",
    icon: <Scissors className="h-8 w-8" />,
    link: "https://screenshot.guru/",
    details: "Capture full-page screenshots of any website. Perfect for documentation and presentations.",
    features: ["Full page capture", "Custom dimensions", "Multiple formats", "Direct URL input"],
    category: "Utilities"
  }
];

const ToolDetails = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const tool = tools.find(t => t.id === toolId);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favoriteTools") || "[]");
    setIsFavorite(favorites.includes(toolId));
  }, [toolId]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favoriteTools") || "[]");
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== toolId);
    } else {
      newFavorites = [...favorites, toolId];
    }
    localStorage.setItem("favoriteTools", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  if (!tool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tool not found</h1>
          <Button onClick={() => navigate("/tools")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/tools")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex-1">{tool.name}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={isFavorite ? "text-yellow-500" : ""}
          >
            <Star className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-xl text-primary">
                  {tool.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{tool.name}</CardTitle>
                  <CardDescription>{tool.category}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{tool.details}</p>
              <Button asChild className="w-full">
                <a href={tool.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit {tool.name}
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tool.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Click the "Visit {tool.name}" button above</li>
              <li>The tool will open in a new browser tab</li>
              <li>Follow the instructions on the tool's website</li>
              <li>Add to favorites by clicking the star icon for quick access</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ToolDetails;
export { tools };
