import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";
import { tools } from "./ToolDetails";

const Tools = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favoriteTools") || "[]");
    setFavorites(storedFavorites);
  }, []);

  const toggleFavorite = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(toolId)
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId];
    setFavorites(newFavorites);
    localStorage.setItem("favoriteTools", JSON.stringify(newFavorites));
  };

  const favoriteTools = tools.filter(tool => favorites.includes(tool.id));
  const categories = [...new Set(tools.map(tool => tool.category))];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Tools</h1>
          <p className="text-muted-foreground">Useful online tools at your fingertips</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All Tools</TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Favorites
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tools.map((tool) => (
                <Card 
                  key={tool.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 relative"
                  onClick={() => navigate(`/tools/${tool.id}`)}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-2 right-2 h-8 w-8 ${favorites.includes(tool.id) ? "text-yellow-500" : "text-muted-foreground"}`}
                    onClick={(e) => toggleFavorite(e, tool.id)}
                  >
                    <Star className={`h-4 w-4 ${favorites.includes(tool.id) ? "fill-current" : ""}`} />
                  </Button>
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
          </TabsContent>

          <TabsContent value="favorites">
            {favoriteTools.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No favorite tools yet. Click the star icon on any tool to add it to favorites.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favoriteTools.map((tool) => (
                  <Card 
                    key={tool.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 relative"
                    onClick={() => navigate(`/tools/${tool.id}`)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-yellow-500"
                      onClick={(e) => toggleFavorite(e, tool.id)}
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </Button>
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
            )}
          </TabsContent>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tools.filter(tool => tool.category === category).map((tool) => (
                  <Card 
                    key={tool.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 relative"
                    onClick={() => navigate(`/tools/${tool.id}`)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-2 right-2 h-8 w-8 ${favorites.includes(tool.id) ? "text-yellow-500" : "text-muted-foreground"}`}
                      onClick={(e) => toggleFavorite(e, tool.id)}
                    >
                      <Star className={`h-4 w-4 ${favorites.includes(tool.id) ? "fill-current" : ""}`} />
                    </Button>
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Tools;
