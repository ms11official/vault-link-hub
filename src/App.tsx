import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Links from "./pages/Links";
import Emails from "./pages/Emails";
import Messages from "./pages/Messages";
import Passwords from "./pages/Passwords";
import Contacts from "./pages/Contacts";
import WebUrls from "./pages/WebUrls";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/links" element={<Links />} />
          <Route path="/emails" element={<Emails />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/passwords" element={<Passwords />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/weburls" element={<WebUrls />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
