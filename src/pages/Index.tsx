import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import Stats from "@/components/Stats";
import BlogPreview from "@/components/BlogPreview";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <BlogPreview />
      <Footer />
    </main>
  );
};

export default Index;
