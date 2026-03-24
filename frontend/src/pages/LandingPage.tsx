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
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Streamline Your Final Year Project
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6">
            Where Great Projects{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
              Come to Life
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            ProjectHub brings students, advisors, and examiners together on one platform—so you can focus on building, not bureaucracy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="gradient-primary text-primary-foreground px-8 text-base">
                Get Started <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="px-8 text-base">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Decorative divider */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-border" />
      </div>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              A complete toolkit for managing final year projects from proposal to presentation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-xl border border-border bg-card hover:shadow-elevated transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="rounded-2xl gradient-primary p-10 md:p-14">
            <GraduationCap className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-3">
              Ready to Collaborate?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              Contact your administrator to get your account credentials and start managing your project today.
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="px-8 text-base font-semibold">
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
