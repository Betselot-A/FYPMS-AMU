// ============================================================
// ProjectHub Landing Page
// Professional introduction to the Final Year Project system.
// ============================================================
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LandingNavbar from "@/components/LandingNavbar";
import {
  GraduationCap,
  Users,
  FileText,
  Bell,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const features = [
  { icon: Users, title: "Team Collaboration", desc: "Form project groups and work seamlessly with your peers and advisors." },
  { icon: FileText, title: "Submission Tracking", desc: "Upload files, track milestones, and stay on top of every deadline." },
  { icon: MessageSquare, title: "Direct Messaging", desc: "Communicate with advisors and examiners without leaving the platform." },
  { icon: Bell, title: "Smart Notifications", desc: "Get alerted about feedback, deadlines, and important project updates." },
  { icon: ShieldCheck, title: "Role-Based Access", desc: "Students, advisors, coordinators, examiners, and admins—each with tailored views." },
  { icon: Sparkles, title: "Progress Insights", desc: "Visual dashboards that keep everyone informed at a glance." },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <LandingNavbar />
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] -z-10 opacity-20 blur-[120px] bg-gradient-to-r from-[#02a3fe] to-[#28c7b9] rounded-full pointer-events-none" />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto text-center max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Streamline Your Final Year Project
          </div>
          <h1 className="text-5xl md:text-7xl font-luxury text-foreground leading-tight mb-6 tracking-wide">
            Where Great Projects <br />
            <span className="bg-clip-text text-transparent bg-gradient-hero" style={{ backgroundImage: "var(--gradient-hero)" }}>
              Come to Life
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            ProjectHub brings students, advisors, and examiners together on one platform—so you can focus on building, not bureaucracy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="gradient-primary text-primary-foreground px-8 text-base shadow-lg hover:shadow-glow-primary hover:scale-[1.02] transition-all duration-300">
                Get Started <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" className="gradient-accent text-primary-foreground px-8 text-base shadow-lg hover:shadow-glow-accent hover:scale-[1.02] transition-all duration-300">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Decorative divider */}
      <div className="container mx-auto px-4 py-8">
        <div className="luxury-line" />
      </div>

      {/* Features - Boxless Luxury Grid */}
      <section className="py-20 px-4 relative">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -z-10 -translate-y-1/2" />
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20 animate-fade-in text-luxury">
            <h2 className="text-4xl md:text-5xl font-luxury text-foreground mb-4 tracking-wider">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              A complete toolkit for managing final year projects from proposal to presentation, beautifully refined.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative pl-8 py-2 hover:pl-10 transition-all duration-500"
              >
                {/* Floating Side Bar Instead of a Box */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-border to-transparent group-hover:via-primary transition-colors duration-500" />
                
                <div className="mb-4">
                  <div className="inline-flex p-3 rounded-full bg-primary/5 text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                     <f.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-2xl font-luxury text-foreground mb-3">{f.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="rounded-2xl gradient-primary p-10 md:p-14 shadow-elevated">
            <GraduationCap className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-luxury font-bold text-primary-foreground mb-3">
              Ready to Collaborate?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Contact your administrator to get your account credentials and start managing your project today.
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="px-8 text-base font-semibold text-primary">
                Sign In Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} ProjectHub. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
