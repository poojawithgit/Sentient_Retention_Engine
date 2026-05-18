import { Nav } from "../components/landing/Nav";
import { Hero } from "../components/landing/Hero";
import { Marquee } from "../components/landing/Marquee";
import { Pipeline } from "../components/landing/Work";
import { Services } from "../components/landing/Services";
import { About } from "../components/landing/About";
import { CTA } from "../components/landing/CTA";
import { Cursor } from "../components/landing/Cursor";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden grain">
      <Cursor />
      <Nav />
      <Hero />
      <Marquee />
      <Pipeline />
      <Services />
      <About />
      <CTA />
    </main>
  );
};

export default Index;
