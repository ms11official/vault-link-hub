import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      onSearch?.(searchQuery);
    }
  };

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Databseplus" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-foreground">Databseplus</span>
          </div>
          
          <div className="flex-1 max-w-md ml-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search... (Ctrl+K)"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
