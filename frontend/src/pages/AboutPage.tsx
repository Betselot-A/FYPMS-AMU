// ============================================================
// ProjectHub About Page
// Mission statement and core values of the project system.
// ============================================================
import LandingNavbar from "@/components/LandingNavbar";
import { Link } from "react-router-dom";
import { Target, Eye, Sparkles, Users, CheckCircle, Award, ShieldCheck, Zap, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <LandingNavbar />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] -z-10 opacity-10 blur-[120px] bg-primary rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] -z-10 opacity-10 blur-[100px] bg-accent rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-36 pb-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in relative z-10 text-left">
              <div className="inline-flex items-center gap-3 mb-8 luxury-glow text-primary">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold uppercase tracking-[0.2em] text-xs">Empowering the Next Generation</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-luxury font-bold text-foreground leading-tight mb-8 tracking-wide">
                Creating a better <br />
                <span className="bg-clip-text text-transparent bg-gradient-hero" style={{ backgroundImage: "var(--gradient-hero)" }}>
                  Project Experience
                </span>
              </h1>
              <div className="w-24 mb-8 luxury-line" />
              <p className="text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed font-light">
                ProjectHub brings students, advisors, and examiners together on one seamless platform—so you can focus on building the future, not navigating bureaucracy.
              </p>
              <div>
                <Link to="/login">
                  <Button size="lg" className="gradient-primary text-primary-foreground px-10 h-14 text-lg rounded-full shadow-lg hover:shadow-glow-primary hover:scale-[1.02] transition-all duration-300">
                    Begin Your Journey <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-fade-in [animation-delay:200ms] hidden lg:block">
              {/* Soft underlying glow */}
              <div className="absolute inset-x-0 -bottom-10 h-32 bg-primary/20 blur-[60px] rounded-full -z-10" />
              
              <div className="relative rounded-3xl overflow-hidden group">
                {/* Floating Image */}
                <img 
                  src="/assets/student-hero.png" 
                  alt="Students Collaborating" 
                  className="w-full h-auto object-cover transform group-hover:scale-[1.03] transition-transform duration-700"
                />
              </div>
              
              {/* Decorative dotted pattern floating */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[radial-gradient(hsl(var(--primary))_2px,transparent_2px)] [background-size:16px_16px] opacity-20 -z-10 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Highlight Section */}
      <section className="py-12 border-y border-border/50 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Groups", val: "500+" },
              { label: "Projects Completed", val: "1.2k+" },
              { label: "Advisors Enrolled", val: "120+" },
              { label: "Success Rate", val: "99%" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.val}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section (Boxless) */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-20">
            <div className="relative group">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="pl-12">
                <div className="inline-flex items-center justify-center mb-8 luxury-glow text-primary">
                  <Target className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h3 className="text-4xl font-luxury text-foreground mb-6 tracking-wide">Our Mission</h3>
                <p className="text-xl text-muted-foreground leading-relaxed font-light">
                  To streamline the final-year research journey for students and faculty through an integrated, transparent, and user-friendly digital ecosystem that fosters collaboration and excellence.
                </p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-accent/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="pl-12">
                <div className="inline-flex items-center justify-center mb-8 luxury-glow text-accent">
                  <Eye className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h3 className="text-4xl font-luxury text-foreground mb-6 tracking-wide">Our Vision</h3>
                <p className="text-xl text-muted-foreground leading-relaxed font-light">
                  To become the global standard for university project management, bridging the gap between academic research and practical implementation with unparalleled elegance and efficiency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid Section (Boxless List) */}
      <section className="py-24 px-4 relative overflow-hidden bg-background">
        {/* Soft center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10" />
        
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-luxury text-foreground mb-6 tracking-wide">Our Core Values</h2>
            <div className="w-16 mx-auto mb-6 luxury-line" />
            <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
              Guided by principles that prioritize academic integrity, student growth, and seamless communication.
            </p>
          </div>
          {/* Desktop 360 Circle Layout */}
          <div className="hidden lg:flex relative w-full max-w-[1000px] aspect-square mx-auto items-center justify-center mt-20">
            {/* Center Circular Image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] z-0">
              {/* Strong glow behind */}
              <div className="absolute inset-0 bg-primary/30 blur-[120px] rounded-full -z-10 scale-125" />
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full border-[1px] border-primary/15 scale-[1.08]" />
              {/* Mid ring with gradient */}
              <div className="w-full h-full rounded-full p-3" style={{ background: 'conic-gradient(from 0deg, #02a3fe22, #28c7b944, #02a3fe22, #28c7b944, #02a3fe22)' }}>
                {/* Inner ring */}
                <div className="w-full h-full rounded-full border-[4px] border-primary/50 overflow-hidden shadow-[0_0_40px_rgba(2,163,254,0.3)_inset]">
                  <img 
                    src="/assets/students-collab.png" 
                    alt="Group of students working on a project" 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000 saturate-150 contrast-110"
                  />
                </div>
              </div>
            </div>

            {/* Rotating Ring Wrapper — orbits around center image */}
            <div
              className="absolute inset-0 animate-orbit-pause"
              style={{ animation: 'orbit 30s linear infinite', transformOrigin: 'center center' }}
            >
              {[
                { icon: ShieldCheck, title: "Academic Integrity", desc: "Built-in checks ensuring adherence.", top: '11%', left: '50%' },
                { icon: Award, title: "Excellence", desc: "Visualizing quality through progress.", top: '28%', left: '84%' },
                { icon: CheckCircle, title: "Transparency", desc: "Clarity on all deadlines and expectations.", top: '72%', left: '84%' },
                { icon: Sparkles, title: "Innovation", desc: "Using technology to solve bureaucracy.", top: '89%', left: '50%' },
                { icon: Users, title: "Collaboration", desc: "Centralized communication channels.", top: '72%', left: '16%' },
                { icon: Zap, title: "Efficiency", desc: "Automating administration tasks.", top: '28%', left: '16%' },
              ].map((v, i) => (
                <div
                  key={i}
                  className="absolute w-44 flex flex-col items-center text-center z-10"
                  style={{ top: v.top, left: v.left, transform: 'translate(-50%, -50%)' }}
                >
                  {/* Counter-rotate content so text stays upright */}
                  <div
                    className="flex flex-col items-center group cursor-default"
                    style={{ animation: 'counter-orbit 30s linear infinite' }}
                  >
                    <div className="text-primary opacity-60 group-hover:opacity-100 mb-2 transition-opacity duration-500">
                      <v.icon className="w-8 h-8" strokeWidth={1} />
                    </div>
                    <h4 className="text-lg font-luxury text-foreground mb-1">{v.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-light">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile/Tablet Vertical Stack */}
          <div className="flex flex-col lg:hidden items-center justify-center gap-12 mt-16 relative">
            {/* Center Image for Mobile */}
            <div className="w-80 h-80 rounded-full border border-primary/20 p-3 bg-background/50 backdrop-blur-sm shadow-2xl luxury-glow mb-8">
              <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-primary/40 shadow-inner">
                <img 
                  src="/assets/students-collab.png" 
                  alt="Group of students working on a project" 
                  className="w-full h-full object-cover saturate-125 contrast-110"
                />
              </div>
            </div>
            {/* Mobile List */}
            {[
              { icon: ShieldCheck, title: "Academic Integrity", desc: "Built-in checks ensuring adherence to all standards." },
              { icon: Award, title: "Excellence", desc: "Visualizing progress to encourage highest quality." },
              { icon: CheckCircle, title: "Transparency", desc: "Absolute clarity on all deadlines and expectations." },
              { icon: Sparkles, title: "Innovation", desc: "Leveraging modern technology to solve bureaucracy." },
              { icon: Users, title: "Collaboration", desc: "Centralized communication for real-time feedback." },
              { icon: Zap, title: "Efficiency", desc: "Automating administration so you focus on research." },
            ].map((v, i) => (
              <div key={i} className="group relative flex flex-col items-center text-center gap-3">
                <div className="text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 tracking-wider">
                  <v.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h4 className="text-2xl font-luxury text-foreground mb-2">{v.title}</h4>
                <p className="text-base text-muted-foreground font-light">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section - Flowing Line */}
      <section className="py-32 px-4 bg-background border-t border-border/10">
        <div className="container mx-auto max-w-5xl text-center">
          <span className="uppercase tracking-[0.2em] text-xs font-semibold text-accent mb-4 block">
            The Journey
          </span>
          <h2 className="text-4xl md:text-5xl font-luxury text-foreground mb-20 tracking-wide">How It Flows</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between relative gap-12 md:gap-0">
            {/* Minimalist connecting line */}
            <div className="hidden md:block absolute top-1/2 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />
            
            {[
              { step: "I", label: "Form Group" },
              { step: "II", label: "Submit Title" },
              { step: "III", label: "Get Advisor" },
              { step: "IV", label: "Final Grade" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center group relative bg-background px-6">
                <span className="text-3xl font-luxury text-muted-foreground mb-4 group-hover:text-primary transition-colors duration-500">
                  {item.step}
                </span>
                <h4 className="font-luxury text-foreground text-xl tracking-wide uppercase">{item.label}</h4>
                <div className="w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-500 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-4 bg-secondary/10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold">
               <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">ProjectHub</span>
          </div>
          <div className="flex gap-8">
            <Link to="/" className="hover:text-primary transition-colors font-medium">Home</Link>
            <Link to="/about" className="text-primary font-medium">About</Link>
            <Link to="/support" className="hover:text-primary transition-colors font-medium">Support</Link>
            <Link to="/login" className="hover:text-primary transition-colors font-medium">Login</Link>
          </div>
          <p>© {new Date().getFullYear()} ProjectHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
