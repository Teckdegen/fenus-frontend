import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import EquityMarket from "@/components/EquityMarket";
import TvlSection from "@/components/TvlSection";
import SupportedAssets from "@/components/SupportedAssets";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <EquityMarket />
      <TvlSection />
      <SupportedAssets />
      <Footer />
    </main>
  );
};

export default Index;
