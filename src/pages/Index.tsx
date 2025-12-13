import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Overview from "@/components/Overview";
import Patents from "@/components/Patents";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Education from "@/components/Education";
import FreelanceProjects from "@/components/FreelanceProjects";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Overview />
      <Patents />
      <Experience />
      <Skills />
      <Education />
      <FreelanceProjects />
      <Footer />
    </main>
  );
};

export default Index;
