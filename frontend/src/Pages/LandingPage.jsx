import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// --- Custom Hooks ---

// Count up from zero to target duration
const useCountUp = (target, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);

  return count;
};

// Fade in on scroll using Intersection Observer
const useFadeIn = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return { ref, className: `transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}` };
};

// --- Components ---

const StatItem = ({ label, value, suffix = "" }) => {
  const count = useCountUp(value);
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeInHero = useFadeIn();
  const fadeInFeatures = useFadeIn();
  const fadeInMockup = useFadeIn();
  const fadeInRewards = useFadeIn();
  const fadeInAI = useFadeIn();
  const fadeInWorks = useFadeIn();
  const fadeInCTA = useFadeIn();

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-[60] transition-all duration-300 ${scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="text-xl">💰</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">SpendWise</span>
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {["Features", "Budget AI", "Rewards", "Reports", "Pricing"].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                {item}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">Log in</button>
            <button onClick={() => navigate("/signup")} className="px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95">Get started free</button>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-[70] bg-white dark:bg-slate-900 transition-transform duration-500 lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-12">
            <span className="text-2xl font-black tracking-tighter">SpendWise</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-600"><span className="text-3xl">✕</span></button>
          </div>
          <div className="flex flex-col gap-6 text-xl font-bold mb-auto">
            {["Features", "Budget AI", "Rewards", "Reports", "Pricing"].map(item => (
              <a key={item} href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-indigo-600">{item}</a>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={() => navigate("/login")} className="w-full py-4 text-center border border-slate-200 dark:border-slate-700 rounded-2xl font-bold">Log in</button>
            <button onClick={() => navigate("/signup")} className="w-full py-4 text-center bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20">Get started free</button>
          </div>
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 md:px-10 lg:px-20 overflow-hidden relative">
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-20 left-[-10%] w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full"></div>

        <div {...fadeInHero} className={`max-w-4xl mx-auto text-center ${fadeInHero.className}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            AI-powered budgeting is here
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-8">
            Master your money with <span className="text-indigo-600">SpendWise</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The all-in-one financial cockpit that uses AI to automate your budget, track rewards, and help you save ₹10,000+ every single month.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button onClick={() => navigate("/signup")} className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">Start tracking free</button>
            <button className="w-full sm:w-auto px-8 py-4 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all">Watch Demo</button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-y border-slate-100 dark:border-slate-800">
            <StatItem value={50000} suffix="+" label="Active Users" />
            <StatItem value={24000000} suffix="+" label="Tracked Monthly" />
            <StatItem value={98} suffix="%" label="Satisfaction" />
            <StatItem value={4.9} suffix="★" label="Rating" />
          </div>
        </div>
      </section>

      {/* --- APP MOCKUP SECTION --- */}
      <section className="py-20 px-6 md:px-10 lg:px-20 bg-slate-50 dark:bg-slate-900/50">
        <div {...fadeInMockup} className={`max-w-6xl mx-auto ${fadeInMockup.className}`}>
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden scale-[0.9] lg:scale-100">
            {/* Browser Header */}
            <div className="bg-slate-900 p-4 border-b border-slate-700 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="ml-4 flex-1 h-6 bg-slate-800 rounded-lg max-w-sm flex items-center px-4 text-[10px] text-slate-500">spendwise.app/dashboard</div>
            </div>
            
            <div className="flex h-[500px]">
              {/* Mock Sidebar */}
              <div className="w-48 bg-slate-900 border-r border-slate-700 p-6 space-y-4 hidden md:block">
                {[1,2,3,4,5].map(i => <div key={i} className={`h-8 rounded-lg ${i===1 ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-slate-800/30'}`}></div>)}
              </div>
              {/* Mock Content */}
              <div className="flex-1 p-8 space-y-8 overflow-hidden">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"></div>
                  <div className="h-24 bg-rose-500/10 border border-rose-500/20 rounded-2xl"></div>
                  <div className="h-24 bg-slate-100/5 border border-slate-700 rounded-2xl"></div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  {/* Mock Bar Chart */}
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-6 flex items-end gap-2 h-48">
                    {[40, 70, 50, 90, 60, 30].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-t-lg ${i%2===0 ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
                    ))}
                  </div>
                  {/* Mock Table */}
                  <div className="space-y-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
                        <div className="flex-1 ml-4 h-3 bg-slate-700 rounded-full max-w-[100px]"></div>
                        <div className="w-12 h-3 bg-slate-800 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-20 px-6 md:px-10 lg:px-20 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Everything you need to <span className="text-indigo-600">Grow</span></h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Stop worrying about where your money went and start telling it where to go.</p>
        </div>
        
        <div {...fadeInFeatures} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${fadeInFeatures.className}`}>
          {[
            { icon: "📊", color: "bg-blue-500", title: "Smart Dashboard", desc: "Real-time analytics and beautiful visualizations of your cash flow." },
            { icon: "🤖", color: "bg-indigo-500", title: "AI Budget Maker", desc: "Claude-powered financial genius that builds your monthly plan in seconds." },
            { icon: "📄", color: "bg-emerald-500", title: "PDF Reports", desc: "Generate professional income statements for banks or personal review." },
            { icon: "💎", color: "bg-amber-500", title: "Rewards Store", desc: "Earn points for staying under budget and redeem them for digital items." },
            { icon: "🔁", color: "bg-rose-500", title: "Recurring Transactions", desc: "Automate your subscriptions and bills with node-cron integration." },
            { icon: "🎯", color: "bg-cyan-500", title: "Debt & Goal Tracker", desc: "Track liabilities and savings goals with projected payoff dates." }
          ].map((f, i) => (
            <div key={i} className="group bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500/50 hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-slate-200/20 dark:shadow-none">
              <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- REWARDS STORE SECTION --- */}
      <section id="rewards" className="py-20 px-6 md:px-10 lg:px-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-[-20%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full"></div>
        
        <div {...fadeInRewards} className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${fadeInRewards.className}`}>
          <div>
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Gamified Savings.<br /><span className="text-amber-400">Earn Real Rewards.</span></h2>
            <p className="text-slate-400 text-lg mb-12">Who said budgeting was boring? Complete financial challenges, maintain streaks, and earn points to unlock exclusive features.</p>
            
            <div className="flex flex-wrap gap-3 mb-12">
              {[
                { pts: 10, task: "per transaction" },
                { pts: 50, task: "under budget" },
                { pts: 75, task: "weekly streak" },
                { pts: 100, task: "goal reached" },
                { pts: 150, task: "debt cleared" }
              ].map((item, i) => (
                <div key={i} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full flex items-center gap-2">
                  <span className="text-amber-400 font-black">+{item.pts}</span>
                  <span className="text-xs font-bold text-slate-300 uppercase">{item.task}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/signup")} className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl transition-all shadow-xl shadow-amber-400/20 uppercase tracking-widest">Join the Club</button>
          </div>

          <div className="grid grid-cols-2 gap-6 relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
            {[
              { emoji: "🎨", price: 200, name: "Premium PDF Theme", desc: "Unlock sleek custom report styles." },
              { emoji: "🤖", price: 100, name: "Extra AI Sessions", desc: "Ask Claude budget follow-ups." },
              { emoji: "🛡️", price: 80, name: "Streak Shield", desc: "Protect your streak for 24h." },
              { emoji: "📊", price: 300, name: "Dashboard Widget", desc: "Bonus analytics for power users." }
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-700 shadow-2xl">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <div className="px-2 py-0.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-md text-[10px] font-black w-fit mb-3">{item.price} PTS</div>
                <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- AI BUDGET SECTION --- */}
      <section id="budget-ai" className="py-20 px-6 md:px-10 lg:px-20 max-w-7xl mx-auto">
        <div {...fadeInAI} className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${fadeInAI.className}`}>
          {/* Chat Mockup */}
          <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[40px] border dark:border-slate-700 shadow-inner">
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl rounded-tl-none shadow-md max-w-[90%] border dark:border-slate-700">
                <p className="text-sm font-bold text-indigo-400 mb-2">Claude Assistant</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Based on your activity, here is your proposed Balanced Budget for April:</p>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-2">
                   <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Food</span><span className="text-slate-700 dark:text-white">₹6,000</span></div>
                   <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Transport</span><span className="text-slate-700 dark:text-white">₹3,000</span></div>
                   <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Fun</span><span className="text-slate-700 dark:text-white">₹2,500</span></div>
                   <div className="flex justify-between text-xs font-bold pt-2 border-t dark:border-slate-700"><span className="text-indigo-400">Savings Goal</span><span className="text-emerald-500 font-black">₹15,000</span></div>
                </div>
              </div>
              <div className="bg-indigo-600 p-4 rounded-3xl rounded-tr-none shadow-lg text-white text-sm ml-auto max-w-[70%]">
                How can I save ₹2,000 more this month?
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl rounded-tl-none shadow-md max-w-[85%] border dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300 italic">"Your Transport costs were 35% above average last month. Switching to public transport 3 days/week would save exactly ₹2,100."</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-8">Personal Finance, <span className="text-indigo-600">Personalized.</span></h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 leading-relaxed">SpendWise uses state-of-the-art AI to translate your messy bank statements into a clear, actionable roadmap for wealth.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {["Spending pattern analysis", "50/30/20 rule generator", "Savings recommendations", "Natural language chat"].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/signup")} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">Setup My AI Plan</button>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="py-20 px-6 md:px-10 lg:px-20 bg-slate-50 dark:bg-slate-900/50">
        <div {...fadeInWorks} className={`max-w-7xl mx-auto text-center ${fadeInWorks.className}`}>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-20 uppercase tracking-tighter">Only 3 Steps to Profit</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[20%] left-0 w-full h-[2px] bg-slate-200 dark:bg-slate-800 -z-10"></div>
            {[
              { step: 1, title: "Sign Up", desc: "Connect your main income sources and set base currency." },
              { step: 2, title: "Log Entries", desc: "Manually log daily expenses or bulk upload CSVs from your bank." },
              { step: 3, title: "Grow Wealth", desc: "Let AI build your budget while you earn rewards and track goals." }
            ].map((s, i) => (
              <div key={i} className="space-y-6">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 border-4 border-indigo-600 rounded-full flex items-center justify-center text-2xl font-black text-indigo-600 mx-auto shadow-xl">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase">{s.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-20 px-6 md:px-10 lg:px-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 italic">Trusted by thousands of Savers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Arjun Mehta", role: "Software Engineer", initial: "A", quote: "SpendWise changed how I see my salary. I saved 40% more in just two months thanks to the AI suggestions." },
            { name: "Priya Sharma", role: "UI Designer", initial: "P", quote: "The Rewards Store makes saving fun. I actually look forward to logging my bills to build my weekly streak!" },
            { name: "Vikram Singh", role: "Business Owner", initial: "V", quote: "Finally, a MERN app that handles complicated category tracking and recurring subscriptions properly." }
          ].map((t, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[32px] border dark:border-slate-700 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-full flex items-center justify-center text-2xl font-black text-white mb-6 shadow-lg shadow-indigo-600/20">
                {t.initial}
              </div>
              <div className="flex gap-1 mb-6 text-amber-500">{"★★★★★".split("").map((s, idx)=><span key={idx}>{s}</span>)}</div>
              <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic mb-8 flex-grow">"{t.quote}"</p>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FINAL CTA SECTION --- */}
      <section className="py-24 px-6 md:px-10 lg:px-20 bg-indigo-600 text-white">
        <div {...fadeInCTA} className={`max-w-4xl mx-auto text-center ${fadeInCTA.className}`}>
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Ready to start your<br /> financial freedom journey?</h2>
          <p className="text-indigo-100 text-lg mb-12 max-w-xl mx-auto">Join 50,000+ people using SpendWise to automate their savings and track wealth.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button onClick={() => navigate("/signup")} className="w-full sm:w-auto px-10 py-5 bg-white text-indigo-600 font-black rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">Create Free Account</button>
              <button className="w-full sm:w-auto px-10 py-5 bg-indigo-700 text-white font-bold rounded-2xl hover:bg-indigo-800 transition-all border border-indigo-500/50">View Pricing</button>
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-60 text-sm font-bold uppercase tracking-tighter">
            <span className="flex items-center gap-2">🛡️ No credit card required</span>
            <span className="flex items-center gap-2">🔄 Cancel anytime</span>
            <span className="flex items-center gap-2">🔒 Bank-grade security</span>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-500 py-20 px-6 md:px-10 lg:px-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-white font-black text-2xl mb-6 tracking-tighter">
                <span className="text-indigo-500">💰</span> SpendWise
              </div>
              <p className="text-sm leading-relaxed max-w-xs mb-8">Building the next generation of predictive financial tools for everyone, everywhere.</p>
              <div className="flex gap-4">
                {['tw', 'gh', 'li'].map(s => <div key={s} className="w-10 h-10 bg-slate-800 rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer flex items-center justify-center font-bold text-white text-xs uppercase">{s}</div>)}
              </div>
            </div>
            {[
              { title: "Product", links: ["Features", "Security", "AI Engine", "API Docs"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Resources", links: ["Support", "Community", "Tools", "Guides"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookie Policy"] }
            ].map(col => (
               <div key={col.title}>
                 <h5 className="text-white font-black uppercase text-xs mb-6 tracking-widest">{col.title}</h5>
                 <ul className="space-y-4 text-sm font-medium">
                   {col.links.map(link => <li key={link} className="hover:text-white cursor-pointer transition-colors">{link}</li>)}
                 </ul>
               </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
            <p>© 2026 SpendWise Technologies Inc. All rights reserved.</p>
            <p>Made with 💙 by Antigravity Studio</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
