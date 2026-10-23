import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import FeatureCards from "@/components/FeatureCards";
import ShowcaseSplit from "@/components/ShowcaseSplit";
import StatsTrio from "@/components/StatsTrio";
import UseCaseImages from "@/components/UseCaseImages";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FeatureCards />
      <ShowcaseSplit />
      <StatsTrio />
      <UseCaseImages />
      <Footer />
    </main>
  );
};

export default Index;
