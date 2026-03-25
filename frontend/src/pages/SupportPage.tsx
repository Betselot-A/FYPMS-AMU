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
import { Mail } from "lucide-react";
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
  const [openIndex, setOpenIndex] = useState<number | null>(0);
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
          {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Support Portal
          </div> */}

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
            How can we <br className="hidden md:block" />
            <span className="text-[#38bdf8]">help you</span> today?
          </h1>

          {/* <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Welcome to the ProjectHub help center. Our dedicated team is ready
            to assist you with any project-related questions, technical issues,
            or collaboration needs.
          </p> */}
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
                  Send us a message and our team will get back to you within 24 hours.
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
                    className="w-full border-b-[2px] border-slate-100 bg-transparent py-1.5 text-sm text-slate-800 font-bold focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-slate-200"
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
                    className="w-full border-b-[2px] border-slate-100 bg-transparent py-1.5 text-sm text-slate-800 font-bold focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-slate-200"
                  />
                </div>

                {/* Message Input */}
                <div className="space-y-1 group">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-[#2563eb] transition-colors">Your Message</label>
                  <textarea
                    placeholder="How can we help you?"
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full border-b-[2px] border-slate-100 bg-transparent py-1.5 text-sm text-slate-800 font-bold focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-slate-200 resize-none"
                  />
                </div>

                <div className="pt-2 text-center lg:text-left">
                  <button
                    type="submit"
                    className="h-11 px-10 bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] hover:opacity-90 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:scale-95 w-full md:w-auto"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Decorative Sidebar - Teal Gradient */}
            <div className="w-full lg:w-[43%] relative bg-gradient-to-br from-[#10b981] to-[#059669] overflow-hidden flex items-center justify-center p-10 order-first lg:order-last min-h-[220px]">
              {/* Dynamic SVG Waves */}
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

              <div className="space-y-3 text-slate-500 pointer-events-auto">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563eb]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.914c-.78.78-2.047.78-2.828 0L6.343 16.657a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <span className="text-[11px] font-black tracking-tight">Main Campus, University</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#10b981]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <span className="text-[11px] font-black tracking-tight">+251 912 345 678</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-2 pointer-events-auto">
                {['f', 't', 'g'].map((social) => (
                  <div key={social} className="w-8 h-8 rounded-lg border-2 border-slate-50 bg-slate-50/50 flex items-center justify-center text-slate-400 font-black text-[9px] hover:border-[#10b981] hover:text-[#10b981] hover:bg-white transition-all cursor-pointer">
                    {social.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden w-full bg-white p-8 text-center space-y-3">
              <h3 className="text-lg font-black text-[#0f172a]">Get in Touch</h3>
              <p className="text-slate-500 text-xs">Main Campus, University — +251 912 345 678</p>
            </div>

          </div>
        </div>
      </section>

      {/* High-Fidelity & Minimalist FAQ Section */}
      <section className="py-12 px-4 bg-muted/5">
        <div className="container mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              Common Questions
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-[#0f172a] font-serif uppercase">
              Frequently Asked
            </h2>
            <div className="w-1 h-1 bg-amber-200/50 rounded-full mx-auto mt-4" />
          </div>

          {/* Minimalist Accordion */}
          <div className="border-t border-slate-100 bg-white shadow-sm overflow-hidden rounded-2xl">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="border-b border-slate-100 last:border-0">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full text-left px-8 py-7 flex items-center justify-between group hover:bg-slate-50/50 transition-all"
                  >
                    <span className={`text-sm font-bold tracking-tight transition-colors ${isOpen ? 'text-[#0ea5e9]' : 'text-slate-600 group-hover:text-slate-900'}`}>
                      {faq.q}
                    </span>

                    {/* Dynamic Icon Logic */}
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      {isOpen ? (
                        <div className="w-6 h-6 bg-slate-800 rotate-45 rounded-sm flex items-center justify-center shadow-lg animate-in zoom-in-75 duration-300">
                          <span className="-rotate-45 text-white text-[10px] font-bold">×</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-md border border-slate-100 flex items-center justify-center group-hover:border-slate-300 transition-colors">
                          <span className="text-slate-300 text-base font-light">+</span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Answer Section */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-8 pb-8 pt-0">
                      <p className="text-sm leading-relaxed text-slate-500 max-w-2xl font-medium">
                        {faq.a}
                      </p>
                    </div>
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
