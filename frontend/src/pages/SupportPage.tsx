// ============================================================
// ProjectHub Support Center
// Helpful resources and contact channel for system users.
// ============================================================
import LandingNavbar from "@/components/LandingNavbar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  { q: "How do I get an account?", a: "Your administrator creates accounts for all users. Contact your department admin to receive your login credentials." },
  { q: "I forgot my password. What do I do?", a: "Reach out to your system administrator to reset your password." },
  { q: "How do I submit my project files?", a: "Navigate to Dashboard → Submissions, then click 'New Submission' to upload your files." },
  { q: "Can I change my project group?", a: "Group changes are managed by the coordinator. Contact your project coordinator to request a change." },
  { q: "How do I view feedback from my advisor?", a: "Go to Dashboard → Submissions, select your submission, and view the feedback section." },
  { q: "Who assigns advisors and examiners?", a: "The project coordinator handles all advisor and examiner assignments." },
];

const SupportPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent!", description: "We'll get back to you as soon as possible." });
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Support Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Have a question? Check our FAQ below or send us a message.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-display font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-lg">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-display font-bold text-foreground">Contact Us</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-xl p-6">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea id="contact-message" placeholder="Describe your issue or question..." rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">
              Send Message
            </Button>
          </form>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} ProjectHub. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SupportPage;
