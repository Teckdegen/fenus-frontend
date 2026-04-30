import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ComingSoon from "./pages/ComingSoon.tsx";
import AppLayout from "./components/app/AppLayout.tsx";
import Dashboard from "./pages/app/Dashboard.tsx";
import Trove from "./pages/app/Trove.tsx";
import Stability from "./pages/app/Stability.tsx";
import Redeem from "./pages/app/Redeem.tsx";
import Pools from "./pages/app/Pools.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="trove" element={<Trove />} />
            <Route path="stability" element={<Stability />} />
            <Route path="redeem" element={<Redeem />} />
            <Route path="pools" element={<Pools />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
