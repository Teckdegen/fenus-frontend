import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import EquityMarket from "@/components/EquityMarket";
import SupportedAssets from "@/components/SupportedAssets";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <EquityMarket />
      <SupportedAssets />
      <Footer />
    </main>
  );
};

export default Index;
