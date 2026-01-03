import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataExportSectionProps {
  userId: string;
}

const DataExportSection = ({ userId }: DataExportSectionProps) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);

  const fetchAllData = async () => {
    const [categoriesRes, itemsRes] = await Promise.all([
      supabase.from("categories").select("*").eq("user_id", userId),
      supabase.from("items").select("*").eq("user_id", userId),
    ]);

    return {
      categories: categoriesRes.data || [],
      items: itemsRes.data || [],
      exportedAt: new Date().toISOString(),
      userId,
    };
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = async () => {
    setExporting("json");
    try {
      const data = await fetchAllData();
      const jsonString = JSON.stringify(data, null, 2);
      downloadFile(jsonString, `databseplus-backup-${Date.now()}.json`, "application/json");
      toast({
        title: "Export Successful",
        description: "Your data has been exported as JSON",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const exportAsCSV = async () => {
    setExporting("csv");
    try {
      const data = await fetchAllData();
      
      // Convert items to CSV
      const itemsHeaders = ["id", "title", "content", "type", "category_id", "created_at", "updated_at"];
      const itemsCSV = [
        itemsHeaders.join(","),
        ...data.items.map((item: any) =>
          itemsHeaders.map((h) => `"${String(item[h] || "").replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Convert categories to CSV
      const catHeaders = ["id", "name", "icon", "parent_category_id", "created_at", "updated_at"];
      const categoriesCSV = [
        catHeaders.join(","),
        ...data.categories.map((cat: any) =>
          catHeaders.map((h) => `"${String(cat[h] || "").replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Download both files
      downloadFile(itemsCSV, `databseplus-items-${Date.now()}.csv`, "text/csv");
      downloadFile(categoriesCSV, `databseplus-categories-${Date.now()}.csv`, "text/csv");

      toast({
        title: "Export Successful",
        description: "Your data has been exported as CSV files",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Your Data
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Download a backup of all your categories and items
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={exportAsJSON}
            variant="outline"
            className="flex-1"
            disabled={exporting !== null}
          >
            {exporting === "json" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileJson className="h-4 w-4 mr-2" />
            )}
            Export as JSON
          </Button>
          <Button
            onClick={exportAsCSV}
            variant="outline"
            className="flex-1"
            disabled={exporting !== null}
          >
            {exporting === "csv" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            Export as CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExportSection;
