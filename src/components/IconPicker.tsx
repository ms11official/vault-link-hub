import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FolderOpen,
  Briefcase,
  Home,
  ShoppingCart,
  FileText,
  Heart,
  DollarSign,
  Calendar,
  Package,
  ShoppingBag,
  Scale,
  User,
  Star,
  Music,
  Camera,
  Video,
  Image,
  Book,
  Bookmark,
  Tag,
  Flag,
  Bell,
  Clock,
  Map,
  MapPin,
  Globe,
  Phone,
  Mail,
  MessageSquare,
  Lock,
  Key,
  Shield,
  Settings,
  Wrench,
  Zap,
  Coffee,
  Gift,
  Trophy,
  Award,
  Smile,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Car,
  Plane,
  Train,
  Ship,
  Bike,
  Building,
  School,
  Hospital,
  Store,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  BarChart,
  PieChart,
  Activity,
  Clipboard,
  Archive,
  Box,
  Layers,
  Grid,
  List,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  FolderOpen,
  Briefcase,
  Home,
  ShoppingCart,
  FileText,
  Heart,
  DollarSign,
  Calendar,
  Package,
  ShoppingBag,
  Scale,
  User,
  Star,
  Music,
  Camera,
  Video,
  Image,
  Book,
  Bookmark,
  Tag,
  Flag,
  Bell,
  Clock,
  Map,
  MapPin,
  Globe,
  Phone,
  Mail,
  MessageSquare,
  Lock,
  Key,
  Shield,
  Settings,
  Wrench,
  Zap,
  Coffee,
  Gift,
  Trophy,
  Award,
  Smile,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Car,
  Plane,
  Train,
  Ship,
  Bike,
  Building,
  School,
  Hospital,
  Store,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  BarChart,
  PieChart,
  Activity,
  Clipboard,
  Archive,
  Box,
  Layers,
  Grid,
  List,
};

const iconNames = Object.keys(iconMap);

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = iconMap[value] || FolderOpen;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          type="button"
        >
          <SelectedIcon className="h-4 w-4" />
          <span>{value || "Select icon"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-popover" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-6 gap-1 p-2">
            {filteredIcons.map((name) => {
              const Icon = iconMap[name];
              const isSelected = value === name;
              return (
                <Button
                  key={name}
                  variant={isSelected ? "secondary" : "ghost"}
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  title={name}
                  type="button"
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-center text-muted-foreground py-4 text-sm">
              No icons found
            </p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export const getIconComponent = (iconName: string): LucideIcon => {
  return iconMap[iconName] || FolderOpen;
};

export default IconPicker;
