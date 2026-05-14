import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Web3Provider } from "@/components/Web3Provider";
import "@/lib/web3";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AppLayout from "./components/app/AppLayout.tsx";
import Dashboard from "./pages/app/Dashboard.tsx";
import Trove from "./pages/app/Trove.tsx";
import Transfer from "./pages/app/Transfer.tsx";
import Pools from "./pages/app/Pools.tsx";
import Faucet from "./pages/app/Faucet.tsx";
import Admin from "./pages/app/Admin.tsx";
import Portfolio from "./pages/app/Portfolio.tsx";
import Docs from "./pages/Docs.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="trove" element={<Trove />} />
              <Route path="transfer" element={<Transfer />} />
              <Route path="pools" element={<Pools />} />
              <Route path="faucet" element={<Faucet />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;
