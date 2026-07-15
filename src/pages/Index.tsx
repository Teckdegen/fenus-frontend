import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import EquityMarket from "@/components/EquityMarket";
import SupportedAssets from "@/components/SupportedAssets";
import UseCases from "@/components/UseCases";
import PoweredBy from "@/components/PoweredBy";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <EquityMarket />
      <SupportedAssets />
      <UseCases />
      <PoweredBy />
      <Footer />
    </main>
  );
};

export default Index;
