import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lock, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4 font-sans">
      <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row w-full max-w-[1000px] min-h-[600px] relative">
        
        {/* Left Side: Branding & Decorative */}
        <div className="w-full md:w-[45%] bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] relative overflow-hidden flex flex-col justify-center p-12 text-white">
          {/* Abstract circles */}
          <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] rounded-full bg-blue-600/20 shadow-inner" />
          <div className="absolute top-[20%] right-[-15%] w-[180px] h-[180px] rounded-full bg-white/5" />
          
          <div className="relative z-10 space-y-4 animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-5xl font-black tracking-tighter mb-2">WELCOME</h1>
            <h2 className="text-xl font-bold tracking-[0.2em] text-blue-100/80 mb-6 uppercase">ProjectHub Identity</h2>
            <p className="text-blue-100/70 max-w-[280px] leading-relaxed text-sm">
              Empowering academic collaboration through seamless project management and supervision.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-[55%] bg-white p-12 flex flex-col justify-center relative">
          <div className="max-w-[400px] mx-auto w-full space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            
            <header className="space-y-2 text-center md:text-left">
              <h3 className="text-4xl font-bold text-[#1E293B]">Sign in</h3>
              <p className="text-slate-400 text-sm">Welcome back! Please enter your details.</p>
            </header>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 block" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Username/Email Input */}
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2563eb] transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="User Name" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 pl-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#2563eb]/20 transition-all text-slate-700 font-medium"
                  />
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2563eb] transition-colors" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 pl-12 pr-16 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#2563eb]/20 transition-all text-slate-700 font-medium"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-[#2563eb] tracking-widest transition-colors uppercase"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : "SHOW"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="rounded-md border-slate-300 data-[state=checked]:bg-[#2563eb] data-[state=checked]:border-[#2563eb]" />
                  <label htmlFor="remember" className="text-sm font-semibold text-slate-600 cursor-pointer select-none">Remember me</label>
                </div>
                <button type="button" className="text-sm font-bold text-[#2563eb] hover:underline transition-all">Forgot Password?</button>
              </div>

              <div className="space-y-6 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] hover:opacity-90 text-white rounded-2xl text-lg font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>

              <div className="text-center pt-8 border-t border-slate-50 mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  Dont have an account? <br />
                  <span className="text-slate-300 font-medium normal-case tracking-normal">Contact your department coordinator for access.</span>
                </p>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
