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
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <span className="text-primary font-semibold tracking-wide uppercase text-sm mb-4 block">
                Simplify Final Year Projects
              </span>
              <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 leading-tight mb-6">
                Creating a better <br />
                <span className="text-primary">Project experience</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg">
                ProjectHub brings students, advisors, and examiners together on one platform—so you can focus on building, not bureaucracy. Built by students, for students.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12">
                    Start Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in [animation-delay:200ms]">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/assets/student-hero.png" 
                  alt="Student Success" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story/Experience Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative animate-fade-in">
              <div className="rounded-3xl overflow-hidden shadow-xl border-8 border-white">
                <img 
                  src="/assets/students-collab.png" 
                  alt="Collaborative Environment" 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 md:right-0 bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 animate-fade-in [animation-delay:400ms]">
                <div className="text-center">
                  <p className="text-4xl font-display font-bold text-primary">100%</p>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Visibility</p>
                </div>
              </div>
            </div>
            <div className="animate-fade-in [animation-delay:300ms]">
              <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-4">Our Story</h2>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6">
                Empowering Every Stage of Your Final Year Project
              </h3>
              <p className="text-slate-600 mb-6">
                ProjectHub was born from a simple frustration: the final year project process is often scattered across emails, WhatsApp groups, and paper forms. We set out to build a single platform that connects students with their advisors, coordinators, and examiners—making every step transparent and efficient.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-800">5 Roles, One Unified Platform</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-800">Proven Efficiency & Clarity</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center text-primary italic font-serif text-xl border-dashed">
                  PH
                </div>
                <div>
                  <p className="font-bold text-slate-900">ProjectHub Team</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Student Centric</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us / Values Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <div className="w-12 h-0.5 bg-primary mb-6" />
              <h2 className="text-slate-500 font-semibold tracking-wide uppercase text-sm mb-4 block">
                Why Choose Us
              </h2>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6 leading-tight">
                Modern Solutions for Your <br /> Final Year Journey
              </h3>
              <p className="text-slate-600 mb-8">
                Carrying nothing on am warrant towards. Polite in of in oh needed itself silent course. Assistance travelling so especially do prosperous appearance mr celebrated.
              </p>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <span className="font-bold text-slate-900 uppercase tracking-widest text-sm">How it works</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in [animation-delay:200ms]">
              <div className="p-8 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 space-y-4">
                <Target className="w-10 h-10" />
                <h4 className="text-xl font-bold">Mission-Driven</h4>
                <p className="text-white/80 text-sm">We simplified the final year project experience for every stakeholder.</p>
              </div>
              <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-xl space-y-4">
                <Eye className="w-10 h-10 text-primary" />
                <h4 className="text-xl font-bold text-slate-900">Transparency</h4>
                <p className="text-slate-500 text-sm">Real-time visibility into project progress, feedback, and deadlines.</p>
              </div>
              <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-xl space-y-4">
                <Sparkles className="w-10 h-10 text-primary" />
                <h4 className="text-xl font-bold text-slate-900">Student-Centric</h4>
                <p className="text-slate-500 text-sm">Every feature is designed with the student journey in mind.</p>
              </div>
              <div className="p-8 rounded-2xl bg-slate-900 text-white shadow-xl space-y-4">
                <Users className="w-10 h-10 text-primary" />
                <h4 className="text-xl font-bold">Collaboration</h4>
                <p className="text-white/80 text-sm">Breaking down silos between students, advisors, and examiners.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-4 bg-slate-50 text-center">
        <div className="container mx-auto">
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Process</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">How we works</h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-16 rounded-full" />
          
          <p className="text-slate-500 max-w-lg mx-auto mb-12">
            Stay on top of every milestone with our streamlined project management flow.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: Zap, label: "Form Group" },
              { step: "02", icon: CheckCircle, label: "Submit Title" },
              { step: "03", icon: Users, label: "Get Advisor" },
              { step: "04", icon: Award, label: "Final Grade" }
            ].map((item, idx) => (
              <div key={idx} className="relative group p-6">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg mx-auto flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform">
                  <item.icon className="w-10 h-10 text-primary" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{item.label}</h4>
                <span className="absolute top-0 right-1/2 translate-x-12 -z-10 text-8xl font-display font-black text-slate-100/50">
                  {item.step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-12 px-4 bg-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">P</div>
            <span className="font-bold text-slate-900 text-lg">ProjectHub</span>
          </div>
          <div className="flex gap-8">
            <Link to="/" className="hover:text-primary transition-colors font-medium">Home</Link>
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
