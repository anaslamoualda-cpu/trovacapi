import HeroSection from "@/components/HeroSection";
import ImageUpload from "@/components/ImageUpload";
import ContactForm from "@/components/ContactForm";
import ContactInfo from "@/components/ContactInfo";
import HowItWorks from "@/components/HowItWorks";

const Index = () => (
  <div className="min-h-screen bg-background">
    <HeroSection />
    <ImageUpload />
    <ContactForm />
    <ContactInfo />
    <HowItWorks />
    <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border">
      © {new Date().getFullYear()} TroviCapi
    </footer>
  </div>
);

export default Index;