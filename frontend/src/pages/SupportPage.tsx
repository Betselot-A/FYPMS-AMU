import LandingNavbar from "@/components/LandingNavbar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService, userService } from "@/api";

const faqs = [
  { q: "How do I get an account?", a: "Your administrator creates accounts for all users. Contact your department admin to receive your login credentials." },
  { q: "I forgot my password. What do I do?", a: "Reach out to your system administrator to reset your password." },
  { q: "How do I submit my project files?", a: "Navigate to Dashboard → Submissions, then click 'New Submission' to upload your files." },
  { q: "Can I change my project group?", a: "Group changes are managed by the coordinator. Contact your project coordinator to request a change." },
  { q: "How do I view feedback from my advisor?", a: "Go to Dashboard → Submissions, select your submission, and view the feedback section." },
  { q: "Who assigns advisors and examiners?", a: "The project coordinator handles all advisor and examiner assignments." },
];

const SupportPage = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Find the Admin user to receive this support request
      const usersRes = await userService.getAll({ limit: 1000 });
      const admin = usersRes.data.users.find(u => u.role === "admin");

      if (admin) {
        await notificationService.create({
          userId: admin.id,
          subject: `Support Request from ${name}`,
          message: `Contact Email: ${email}\n\nMessage: ${message}`,
          type: "warning" // Mark as warning to catch admin's attention
        });
        
        toast({ 
          title: "Message sent to Admin!", 
          description: "Your report has been logged in the system. We'll get back to you soon." 
        });
        
        if (!user) {
          setName("");
          setEmail("");
        }
        setMessage("");
      } else {
        // Fallback for public users or if no admin found
        toast({ title: "Message sent!", description: "We'll get back to you as soon as possible via email." });
      }
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Submission failed", 
        description: "Could not deliver your message to the system admin." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* High-Impact Full-Width Hero */}
      <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 bg-gradient-to-br from-[#0ea5e9] to-[#2563eb]"
          style={{ backgroundImage: "url('/support-hero.png')" }}
          aria-hidden="true"
        />
        {/* Semi-Transparent Overlay for Contrast */}
        <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[1px]" />

        {/* Centered Content Overlay */}
        <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
            How can we <br className="hidden md:block" />
            <span className="text-[#38bdf8]">help you</span> today?
          </h1>
        </div>

        {/* Bottom Fade out */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Branded & Centered Contact Section */}
      <section className="py-8 px-4 bg-muted/20 overflow-hidden font-sans">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] flex flex-col lg:flex-row relative group">

            {/* Left: Contact Form Section */}
            <div className="w-full lg:w-[57%] p-8 lg:p-11 space-y-6 relative z-10 bg-white flex flex-col justify-center">
              <div className="space-y-2 text-center lg:text-center">
                <h2 className="text-3xl font-black tracking-tighter text-[#0f172a] mx-auto">Contact Us</h2>
                <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                  {user ? "Send a direct report to the system administrator." : "Send us a message and our team will get back to you within 24 hours."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 pt-2 max-w-md mx-auto w-full">
                {/* Name Input */}
                <div className="space-y-1 group">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-[#2563eb] transition-colors">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={!!user}
                    className="w-full border-b-[2px] border-slate-100 bg-transparent py-1.5 text-sm text-slate-800 font-bold focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-slate-200 disabled:opacity-50"
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-1 group">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-[#2563eb] transition-colors">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. john@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!user}
                    className="w-full border-b-[2px] border-slate-100 bg-transparent py-1.5 text-sm text-slate-800 font-bold focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-slate-200 disabled:opacity-50"
                  />
                </div>

                {/* Message Input */}
                <div className="space-y-1 group">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-[#2563eb] transition-colors">
                    {user ? "Report / Comment" : "Your Message"}
                  </label>
                  <textarea
                    placeholder="What would you like to report or comment on?"
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full border-b-[2px] border-slate-100 bg-transparent py-1.5 text-sm text-slate-800 font-bold focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-slate-200 resize-none"
                  />
                </div>

                <div className="pt-2 text-center lg:text-left">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 px-10 bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] hover:opacity-90 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:scale-95 w-full md:w-auto flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {user ? "Send Report" : "Send Message"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Decorative Sidebar */}
            <div className="w-full lg:w-[43%] relative bg-gradient-to-br from-[#10b981] to-[#059669] overflow-hidden flex items-center justify-center p-10 order-first lg:order-last min-h-[220px]">
              <div className="absolute inset-0">
                <svg className="w-full h-full opacity-30" viewBox="0 0 500 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,0 L500,0 L500,800 L0,800 Z" fill="none" />
                  <path d="M0,200 C200,50 300,350 500,200 L500,800 L0,800 Z" fill="#065f46" />
                </svg>
              </div>
            </div>

            {/* OVERLAPPING Info Circle */}
            <div className="hidden lg:flex absolute left-[57%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[280px] h-[280px] rounded-full bg-white shadow-[0_20px_40px_-8px_rgba(0,0,0,0.1)] flex-col items-center justify-center p-6 text-center space-y-4 animate-in zoom-in-95 duration-700 pointer-events-none">
              <div className="space-y-1 pointer-events-auto">
                <h3 className="text-xl font-black tracking-tighter text-[#0f172a]">ProjectHub</h3>
                <div className="w-8 h-1 bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] mx-auto rounded-full" />
              </div>
              <div className="space-y-3 text-slate-500 pointer-events-auto text-[11px] font-black tracking-tight">
                <p>Main Campus, University</p>
                <p>+251 912 345 678</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 bg-muted/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Common Questions</span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-[#0f172a] font-serif uppercase">Frequently Asked</h2>
          </div>

          <div className="border-t border-slate-100 bg-white shadow-sm overflow-hidden rounded-2xl">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="border-b border-slate-100 last:border-0">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full text-left px-8 py-7 flex items-center justify-between group hover:bg-slate-50/50 transition-all"
                  >
                    <span className={`text-sm font-bold tracking-tight transition-colors ${isOpen ? 'text-[#0ea5e9]' : 'text-slate-600 group-hover:text-slate-900'}`}>{faq.q}</span>
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      {isOpen ? "×" : "+"}
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-8 pb-8 pt-0 text-sm leading-relaxed text-slate-500 font-medium">{faq.a}</div>
                  </div>
                </div>
              );
            })}
          </div>
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
