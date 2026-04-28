'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Server, 
  Zap, 
  RefreshCw, 
  Circle, 
  Shield, 
  Code2, 
  Terminal, 
  Check,
  ChevronRight,
  ExternalLink,
  Play
} from 'lucide-react';
import Link from 'next/link';

// Component: Custom Github Icon (High-fidelity)
const GithubIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

// Component: Live Indicator Banner
const LiveIndicatorBanner = () => {
  return (
    <div className="bg-slate-900 text-white py-2 overflow-hidden relative flex items-center border-b border-white/5">
      <motion.div
        className="flex whitespace-nowrap gap-12 text-xs font-medium items-center"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-1.5 w-1.5 rounded-full bg-green-500 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            </div>
            <span className="text-green-400 font-bold tracking-wider">LIVE</span>
            <span className="opacity-80">imesh4523 deployed <span className="text-indigo-400 font-mono">hosting-frontend</span></span>
            <span className="opacity-50">·</span>
            <span className="opacity-80">main branch</span>
            <span className="opacity-50">·</span>
            <span className="text-green-300 flex items-center gap-1"><CheckCircle2 size={12} /> Success</span>
            <span className="opacity-20 text-lg">/ / /</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// Component: AutoDeploy Card (Floating Card 1)
const AutoDeployCard = () => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setStep(0);
          return 0;
        }
        const newProgress = p + 5;
        if (newProgress > 30) setStep(1);
        if (newProgress > 60) setStep(2);
        if (newProgress > 90) setStep(3);
        return newProgress;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute top-10 left-0 md:-left-12 z-20 w-72"
      animate={{ y: [-10, 10, -10] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      <div className="relative rounded-2xl p-[1.5px] overflow-hidden group shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]">
        <div 
          className="absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] animate-spin opacity-80" 
          style={{ animationDuration: '4s' }}
        ></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-[15px] p-5 h-full">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
              <GithubIcon size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Introducing AutoDeploy</h4>
              <p className="text-[10px] text-slate-500 font-medium">Your GitHub deployment assistant.</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2 mb-4 text-[10px] text-slate-400 border border-slate-100 italic">
            <Search size={12} />
            <span>Paste your repo URL...</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
              <span className="uppercase tracking-wider">Detecting:</span>
              <span className="text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 h-full rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              />
            </div>

            <div className="space-y-2.5 mt-4 pt-4 border-t border-slate-100">
              <div className={`flex items-center gap-2 text-[11px] transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="bg-green-100 p-0.5 rounded-full"><Check size={10} className="text-green-600" /></div>
                <span className="text-slate-600 font-medium">Next.js Framework</span>
              </div>
              <div className={`flex items-center gap-2 text-[11px] transition-all duration-500 delay-100 ${step >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="bg-green-100 p-0.5 rounded-full"><Check size={10} className="text-green-600" /></div>
                <span className="text-slate-600 font-medium">Docker Environment</span>
              </div>
              <div className={`flex items-center gap-2 text-[11px] font-bold text-indigo-600 transition-all duration-500 delay-200 ${step >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <RefreshCw size={12} className="animate-spin" />
                <span className="animate-pulse">Deploying to Edge...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Component: Live Deploy Stats
const LiveDeployStatsCard = () => {
  const [deploys, setDeploys] = useState([
    { id: 1, name: 'UltaCore', branch: 'main', status: 'success', time: '2s ago', icon: <Zap size={14}/>, color: 'text-amber-500' },
    { id: 2, name: 'GitHub', branch: 'push detected', status: 'deploying', time: 'starting...', icon: <GithubIcon size={14}/>, color: 'text-slate-900' },
    { id: 3, name: 'Frontend', branch: 'production', status: 'success', time: '45s ago', icon: <Code2 size={14}/>, color: 'text-blue-500' },
    { id: 4, name: 'API Server', branch: 'main', status: 'success', time: '2m ago', icon: <Server size={14}/>, color: 'text-purple-500' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDeploys(current => {
        const newDeploy = {
          id: Date.now(),
          name: ['Auth API', 'Billing UI', 'Gateway', 'Admin Dash'][Math.floor(Math.random() * 4)],
          branch: ['main', 'production', 'staging'][Math.floor(Math.random() * 3)],
          status: 'success',
          time: 'just now',
          icon: [<Shield size={14}/>, <Terminal size={14}/>, <Code2 size={14}/>, <Server size={14}/>][Math.floor(Math.random() * 4)],
          color: ['text-indigo-500', 'text-cyan-500', 'text-pink-500', 'text-green-500'][Math.floor(Math.random() * 4)]
        };
        const updated = current.map((d, i) => {
          if (i === 1) return { ...d, status: 'success', time: '12s ago' };
          return d;
        });
        return [{...newDeploy, status: 'deploying', time: 'starting...', icon: <GithubIcon size={14}/>, color: 'text-slate-900' }, updated[0], updated[2]];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute bottom-5 right-0 md:-right-10 z-20 w-80"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    >
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <h4 className="font-bold text-slate-900 text-sm tracking-tight">Real-time Deployments</h4>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">LIVE</span>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {deploys.slice(0, 3).map((deploy) => (
              <motion.div
                key={deploy.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors border border-slate-100 ${deploy.color}`}>
                    {deploy.icon}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{deploy.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{deploy.branch}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {deploy.status === 'deploying' ? (
                    <RefreshCw size={12} className="text-indigo-500 animate-spin" />
                  ) : (
                    <CheckCircle2 size={12} className="text-green-500" />
                  )}
                  <span className="text-[9px] font-bold text-slate-400">{deploy.time}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// Component: Social Proof Card
const SocialProofCard = () => (
  <motion.div
    className="absolute top-5 right-10 z-30"
    animate={{ y: [5, -5, 5] }}
    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
  >
    <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-xl rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex -space-x-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-indigo-${(i+1)*200} to-purple-${(i+1)*200} flex items-center justify-center text-[10px] font-bold text-white`}>
            {String.fromCharCode(65+i)}
          </div>
        ))}
        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
          +5k
        </div>
      </div>
      <div>
        <div className="flex text-amber-400 gap-0.5">
          {[...Array(5)].map((_, i) => <Check key={i} size={10} strokeWidth={4} />)}
        </div>
        <p className="text-[11px] font-extrabold text-slate-900 mt-1 uppercase tracking-tight text-left">Trust by Devs</p>
        <p className="text-[9px] text-slate-500 font-medium italic text-left">"Fastest deployment ever!"</p>
      </div>
    </div>
  </motion.div>
);

export default function GitHubDeployDashboard() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedFramework, setDetectedFramework] = useState<{name: string, icon: any} | null>(null);

  const handleDetect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    setIsDetecting(true);
    setDetectedFramework(null);
    
    setTimeout(() => {
      const frameworks = [
        { name: 'Next.js', icon: <Code2 size={24}/> },
        { name: 'React', icon: <Circle size={24}/> },
        { name: 'Node.js', icon: <Terminal size={24}/> },
        { name: 'Vue.js', icon: <Code2 size={24}/> }
      ];
      setDetectedFramework(frameworks[Math.floor(Math.random() * frameworks.length)]);
      setIsDetecting(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
      <LiveIndicatorBanner />
      
      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between relative z-50 border-b border-slate-100/60">
        <Link href="/dashboard" className="flex items-center gap-3 group transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <Zap size={22} fill="currentColor" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter text-slate-900 block leading-none">ULTA<span className="text-indigo-600">HOST</span></span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Dashboard</span>
          </div>
        </Link>
        <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold text-slate-500 uppercase tracking-widest">
          <Link href="#" className="hover:text-indigo-600 transition-colors">Services</Link>
          <Link href="#" className="hover:text-indigo-600 transition-colors">Billing</Link>
          <Link href="#" className="hover:text-indigo-600 transition-colors">Support</Link>
          <Link href="#" className="hover:text-indigo-600 transition-colors">Addons</Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Search size={20}/></button>
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-indigo-600 shadow-sm">R</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8">
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 flex flex-col lg:flex-row items-center gap-16 overflow-hidden lg:overflow-visible">
          
          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] -z-10 animate-pulse" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[120px] -z-10" />

          {/* Left Side */}
          <div className="flex-1 space-y-8 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white border border-slate-100 px-4 py-1.5 rounded-full shadow-sm"
            >
              <div className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded">FLASH</div>
              <span className="text-xs font-bold text-slate-600 tracking-tight text-left">Auto-deploy on every GitHub push!</span>
            </motion.div>

            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-left"
              >
                Deploy Everything <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Without Limits</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-slate-600 max-w-xl leading-relaxed text-left font-medium"
              >
                Experience the world's most automated deployment pipeline. Zero downtime, multi-cloud scaling, and instant rollbacks.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-y-4 gap-x-12"
            >
              {['Auto Deploy', 'Zero Downtime', 'Instant Rollback', 'Multi-Cloud'].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="bg-green-100 p-1 rounded-full"><Check size={14} className="text-green-600" strokeWidth={3}/></div>
                  <span className="text-sm font-bold text-slate-700">{feat}</span>
                </div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-6 pt-4"
            >
              <div className="flex flex-col text-left">
                <span className="text-xs text-slate-500 font-medium tracking-tight">Starting at</span>
                <span className="text-3xl font-extrabold text-slate-900">FREE</span>
              </div>
              <div className="flex gap-4">
                <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-200">
                  <GithubIcon size={18} />
                  Connect GitHub
                </button>
                <button className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
                  <Play size={18} className="text-indigo-600" />
                  See Demo
                </button>
              </div>
            </motion.div>

            <p className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest pt-4">
              <Shield size={14} /> No credit card · Setup in 60 seconds
            </p>
          </div>

          {/* Right Side - Interactive Graphics */}
          <div className="flex-1 relative w-full max-w-lg aspect-square">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative inset-4 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-[10px] font-mono text-slate-500">github-deploy-agent.v1.0.4</div>
              </div>
              <div className="flex-1 p-8 font-mono text-xs leading-relaxed text-slate-400 space-y-4">
                <div className="flex gap-2 text-left">
                  <span className="text-indigo-400">$</span>
                  <span className="text-slate-100">git push origin main</span>
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="space-y-1.5 text-left"
                >
                  <p>Enumerating objects: 12, done.</p>
                  <p>Counting objects: 100% (12/12), done.</p>
                  <p className="text-indigo-300">remote: Analyzing repository structure...</p>
                  <p className="text-green-400 font-bold">remote: [MATCH] Next.js 14 project detected.</p>
                  <p className="text-indigo-300">remote: Optimizing build artifacts...</p>
                  <p className="text-amber-400">remote: [CACHED] 84% of modules reused.</p>
                  <p className="text-indigo-300">remote: Triggering global edge deployment...</p>
                  <div className="h-px bg-slate-800 my-4 w-full" />
                  <p className="text-green-400 font-bold">SUCCESS: Deployed to 42 edge locations.</p>
                  <p className="text-slate-500 italic">URL: https://hosting-frontend.ulta.host</p>
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
            </motion.div>

            {/* Floating Elements */}
            <AutoDeployCard />
            <LiveDeployStatsCard />
            <SocialProofCard />
          </div>
        </section>

        {/* Deploy Repo Search Section */}
        <section className="py-24 border-t border-slate-100">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                <GithubIcon size={40} className="inline-block mr-4 text-indigo-600" />
                Ready to Deploy?
              </h2>
              <p className="text-slate-500 font-medium text-lg">Just paste your repo URL. We do the rest.</p>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 p-10 rounded-[40px] shadow-sm relative">
              <form onSubmit={handleDetect} className="relative z-10">
                <div className="flex items-center bg-white p-2 rounded-3xl border-2 border-indigo-100 focus-within:border-indigo-500 transition-all shadow-xl shadow-indigo-100/20">
                  <div className="pl-6 pr-4 text-slate-400">
                    <GithubIcon size={24} />
                  </div>
                  <input 
                    type="text" 
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm text-slate-700 placeholder:text-slate-300 outline-none"
                  />
                  <button 
                    disabled={isDetecting || !repoUrl}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
                  >
                    {isDetecting ? <RefreshCw className="animate-spin" size={20}/> : <Zap size={20}/>}
                    {isDetecting ? 'Detecting...' : 'Quick Deploy'}
                  </button>
                </div>
              </form>

              <AnimatePresence>
                {detectedFramework && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="mt-10 p-6 bg-white border border-indigo-100 rounded-3xl flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        {detectedFramework.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Found Framework</p>
                        <h4 className="text-2xl font-black text-slate-900">{detectedFramework.name}</h4>
                      </div>
                    </div>
                    <button className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-600 transition-all">
                      Confirm & Go Live <ArrowRight size={20}/>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-6 my-12">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">or direct connect</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button className="flex items-center gap-4 mx-auto bg-slate-900 text-white px-10 py-5 rounded-3xl font-black hover:bg-slate-800 transition-all group">
                <GithubIcon size={24} />
                Link GitHub Account
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-3">
                {['Next.js', 'React', 'Node.js', 'Laravel', 'Django', 'Vue', 'Nuxt', 'Docker'].map(fw => (
                  <span key={fw} className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-bold text-slate-500 shadow-sm">{fw}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Simple. Fast. Reliable.</h2>
            <p className="text-slate-500 font-medium">Three steps from localhost to production.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
            
            {[
              { step: 1, title: 'Connect GitHub', desc: 'Link your repo in 1 click. We auto-detect your stack.', icon: <GithubIcon size={32} /> },
              { step: 2, title: 'Push Code', desc: 'Run `git push origin main`. We listen for hooks.', icon: <Terminal size={32} /> },
              { step: 3, title: 'Live!', desc: 'Global edge deployment in under 30 seconds.', icon: <ExternalLink size={32} /> }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white border border-slate-100 p-10 rounded-[40px] text-center space-y-6 shadow-xl shadow-slate-100/50 relative z-10 hover:-translate-y-2 transition-transform"
              >
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto shadow-inner">
                  {item.icon}
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Step 0{item.step}</div>
                  <h3 className="text-2xl font-black text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">
          <p>© 2026 ULTAHOST AUTOMATION. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-indigo-600">Privacy</Link>
            <Link href="#" className="hover:text-indigo-600">Terms</Link>
            <Link href="#" className="hover:text-indigo-600">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
