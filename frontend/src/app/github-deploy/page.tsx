'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Play, Search, ArrowRight, Server, Zap, RefreshCw, Circle, Shield, Code2, Terminal, Check } from 'lucide-react';

const GithubIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

import Link from 'next/link';

// Component: Live Indicator Banner
const LiveIndicatorBanner = () => {
  return (
    <div className="bg-indigo-600 text-white py-2 overflow-hidden relative flex items-center">
      <motion.div
        className="flex whitespace-nowrap gap-8 text-sm font-medium items-center"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
      >
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-400 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            </span>
            <span className="font-bold">LIVE</span>
            <span className="opacity-80">imesh4523 just deployed →</span>
            <span>main branch</span>
            <span className="opacity-80">·</span>
            <span>2 seconds ago</span>
            <span className="opacity-80">·</span>
            <span className="flex items-center gap-1 text-green-300"><CheckCircle2 size={14} /> Success</span>
            <span className="opacity-50">→ → →</span>
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
      <div className="relative rounded-2xl p-[1.5px] overflow-hidden group shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
        <div 
          className="absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] animate-spin opacity-80 group-hover:opacity-100 transition-opacity" 
          style={{ animationDuration: '3s' }}
        ></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-[15px] p-5 h-full">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <GithubIcon size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Introducing AutoDeploy</h4>
              <p className="text-xs text-gray-500 leading-tight">Your GitHub deployment assistant.</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2 mb-4 text-xs text-gray-500 border border-gray-100">
            <Search size={14} />
            <span>Paste your repo URL...</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-gray-700">
              <span>Detecting:</span>
              <span className="text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-2 mt-3 pt-3 border-t border-gray-100/50">
              <div className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                <CheckCircle2 size={14} className="text-green-500" />
                <span className="text-gray-700">Next.js detected</span>
              </div>
              <div className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                <CheckCircle2 size={14} className="text-green-500" />
                <span className="text-gray-700">Docker ready</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-medium text-indigo-600 transition-opacity duration-300 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                <RefreshCw size={14} className="animate-spin" />
                <span>Deploying...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Component: Live Deploy Stats (Floating Card 2)
const LiveDeployStatsCard = () => {
  const [deploys, setDeploys] = useState([
    { id: 1, name: 'UltaCore', branch: 'main', status: 'success', time: '2s ago', icon: <Zap size={14}/>, color: 'text-yellow-500' },
    { id: 2, name: 'GitHub', branch: 'push detected', status: 'deploying', time: 'starting...', icon: <GithubIcon size={14}/>, color: 'text-gray-900' },
    { id: 3, name: 'Frontend', branch: 'production', status: 'success', time: '45s ago', icon: <Code2 size={14}/>, color: 'text-blue-500' },
    { id: 4, name: 'API Server', branch: 'main', status: 'success', time: '2m ago', icon: <Server size={14}/>, color: 'text-purple-500' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDeploys(current => {
        const newDeploy = {
          id: Date.now(),
          name: ['Auth Service', 'Payment Gateway', 'Dashboard UI', 'Admin Panel'][Math.floor(Math.random() * 4)],
          branch: ['main', 'production', 'staging'][Math.floor(Math.random() * 3)],
          status: 'success',
          time: 'just now',
          icon: [<Shield size={14}/>, <Terminal size={14}/>, <Code2 size={14}/>, <Server size={14}/>][Math.floor(Math.random() * 4)],
          color: ['text-indigo-500', 'text-cyan-500', 'text-pink-500', 'text-green-500'][Math.floor(Math.random() * 4)]
        };
        
        // Push the previous 'deploying' one to 'success' and update times
        const updated = current.map((d, i) => {
          if (i === 1) return { ...d, status: 'success', time: '10s ago' };
          if (i === 0) return { ...d, time: '35s ago' };
          if (i === 2) return { ...d, time: '1m ago' };
          return d;
        });
        
        return [updated[1], { id: Date.now()+1, name: 'GitHub', branch: 'push detected', status: 'deploying', time: 'starting...', icon: <GithubIcon size={14}/>, color: 'text-gray-900' }, ...updated.slice(2, 4)];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute bottom-5 right-0 md:-right-10 bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-2xl p-5 w-80 z-20"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <h4 className="font-bold text-gray-900 text-sm">Latest Deployments</h4>
      </div>

      <div className="space-y-3 overflow-hidden relative">
        <AnimatePresence mode="popLayout">
          {deploys.map((deploy) => (
            <motion.div
              key={deploy.id}
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="flex items-start justify-between text-xs"
            >
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 ${deploy.color}`}>
                  {deploy.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{deploy.name}</p>
                  <p className="text-gray-500">{deploy.branch}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                {deploy.status === 'deploying' ? (
                  <RefreshCw size={14} className="text-indigo-500 animate-spin" />
                ) : (
                  <CheckCircle2 size={14} className="text-green-500" />
                )}
                <span className="text-gray-400 mt-1">{deploy.time}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Component: Social Proof Card
const SocialProofCard = () => (
  <motion.div
    className="absolute top-5 right-10 bg-white/90 backdrop-blur-md border border-gray-100 shadow-xl rounded-xl p-3 flex items-center gap-3 z-10"
    animate={{ y: [5, -5, 5] }}
    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
  >
    <div className="flex -space-x-2">
      {[1,2,3].map(i => (
        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-indigo-${i*200} to-purple-${i*200} flex items-center justify-center text-white text-xs font-bold`}>
          {String.fromCharCode(64+i)}
        </div>
      ))}
    </div>
    <div>
      <div className="flex text-yellow-400 text-[10px]">
        {'★★★★★'}
      </div>
      <p className="text-xs font-bold text-gray-900 leading-tight mt-0.5">Developers Love It</p>
      <p className="text-[10px] text-gray-500">Based on 500+ deploys</p>
    </div>
  </motion.div>
);


// Main Page Component
export default function GitHubDeployPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedFramework, setDetectedFramework] = useState('');

  const handleDetect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    setIsDetecting(true);
    setDetectedFramework('');
    
    // Simulate detection
    setTimeout(() => {
      setIsDetecting(false);
      setDetectedFramework(['Next.js', 'React', 'Vue', 'Node.js'][Math.floor(Math.random() * 4)]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LiveIndicatorBanner />
      
      {/* Navbar Placeholder - Keep it minimal for focus */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
            <GithubIcon size={18} />
          </div>
          HostingCompany
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#" className="hover:text-indigo-600 transition-colors">Products</Link>
          <Link href="#" className="hover:text-indigo-600 transition-colors">Solutions</Link>
          <Link href="#" className="hover:text-indigo-600 transition-colors">Pricing</Link>
          <Link href="#" className="hover:text-indigo-600 transition-colors">Docs</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Log in</Link>
          <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-200">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-16 overflow-hidden lg:overflow-visible">
        
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-300/20 rounded-full blur-3xl -z-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-300/20 rounded-full blur-3xl -z-10" />
        
        {/* Left Content */}
        <motion.div 
          className="flex-1 space-y-8 z-10"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
            Auto-deploy on every GitHub push!
          </motion.div>

          <motion.h1 
            className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Deploy Everything <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Without Limits</span>
          </motion.h1>

          <motion.p 
            className="text-lg text-slate-600 max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Zero downtime. Zero effort. Connect your repository and watch your code go live globally in seconds.
          </motion.p>

          <motion.ul 
            className="grid grid-cols-2 gap-3 text-slate-700 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {['Auto Deploy', 'Zero Downtime', 'Instant Rollback', 'Multi-Cloud'].map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="bg-green-100 p-1 rounded-full text-green-600">
                  <Check size={16} strokeWidth={3} />
                </div>
                {feature}
              </li>
            ))}
          </motion.ul>

          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 font-medium">Starting at</span>
              <span className="text-3xl font-extrabold text-slate-900">FREE</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 shadow-xl shadow-slate-900/20 group w-full sm:w-auto">
                <GithubIcon size={20} className="group-hover:animate-bounce" />
                Connect GitHub
              </button>
              <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-md group w-full sm:w-auto">
                <Play size={20} className="text-indigo-600" />
                See Demo
              </button>
            </div>
          </motion.div>

          <motion.div 
            className="flex items-center gap-2 text-sm text-slate-500 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Shield size={16} className="text-slate-400" />
            No credit card required · Setup in 60 seconds
          </motion.div>

        </motion.div>

        {/* Right Content - Interactive Preview */}
        <motion.div 
          className="flex-1 relative w-full max-w-lg aspect-square"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main central graphic/illustration could go here. We'll use a stylized code block as base */}
          <div className="absolute inset-4 bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col">
            <div className="h-10 border-b border-slate-800 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="p-6 font-mono text-sm text-slate-300 flex-1 overflow-hidden relative">
              <p className="text-indigo-400">~/project $ <span className="text-slate-100">git push origin main</span></p>
              <motion.div 
                className="mt-4 space-y-2 opacity-80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 2 }}
              >
                <p>Enumerating objects: 5, done.</p>
                <p>Counting objects: 100% (5/5), done.</p>
                <p>Writing objects: 100% (3/3), 324 bytes | 324.00 KiB/s, done.</p>
                <p>Total 3 (delta 2), reused 0 (delta 0)</p>
                <p className="text-cyan-400 mt-4">remote: Resolving deltas: 100% (2/2), completed with 2 local objects.</p>
                <p className="text-green-400">remote: Triggering AutoDeploy webhook...</p>
                <p className="text-green-400">remote: Deployment started successfully!</p>
              </motion.div>
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent" />
            </div>
          </div>

          <AutoDeployCard />
          <LiveDeployStatsCard />
          <SocialProofCard />
          
        </motion.div>
      </section>

      {/* Deploy Your Repo Section */}
      <section className="py-24 bg-white relative z-20 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            <GithubIcon className="inline-block text-indigo-600 mb-2 mr-2" size={32} />
            Deploy Your GitHub Repo <br className="hidden md:block"/> in 60 Seconds
          </h2>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
            Paste your repository URL below, and we'll automatically detect your framework, configure the build settings, and deploy it to a high-performance edge network.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
            <form onSubmit={handleDetect} className="relative max-w-2xl mx-auto mb-8">
              <div className="flex items-center bg-white border-2 border-indigo-100 rounded-2xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all shadow-sm">
                <div className="pl-4 text-slate-400">
                  <GithubIcon size={20} />
                </div>
                <input 
                  type="text" 
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full py-4 px-4 outline-none text-slate-700 bg-transparent placeholder-slate-400 font-mono text-sm sm:text-base"
                />
                <button 
                  type="submit"
                  disabled={isDetecting || !repoUrl}
                  className="m-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {isDetecting ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                  <span className="hidden sm:inline">{isDetecting ? 'Detecting...' : 'Detect & Deploy'}</span>
                </button>
              </div>
            </form>

            <AnimatePresence mode="wait">
              {detectedFramework && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Code2 size={24} className="text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Detected: {detectedFramework}</p>
                      <p className="text-xs text-green-600/80">Ready with optimal build settings</p>
                    </div>
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-green-600/20 transition-all hover:scale-105 flex items-center gap-2">
                    Deploy Now <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-slate-400 font-medium text-sm">or connect directly</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <button className="bg-[#24292F] hover:bg-[#24292F]/90 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-3 mx-auto">
              <GithubIcon size={20} />
              Connect GitHub Account
            </button>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wider">Built-in Support For</p>
              <div className="flex flex-wrap justify-center gap-3 text-slate-600">
                {['Next.js', 'React', 'Node.js', 'Laravel', 'Django', 'Vue', 'Nuxt', 'Docker'].map(fw => (
                  <span key={fw} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-default">
                    <Circle size={8} className="fill-current" /> {fw}
                  </span>
                ))}
                <span className="px-4 py-2 text-sm font-medium text-slate-400">+ many more</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Auto detects framework</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Zero config needed</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Deploy to your servers</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-xl mx-auto">From code to production in three simple steps. We handle the complex CI/CD pipelines so you can focus on building.</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 -translate-y-1/2 -z-10">
               <motion.div 
                 className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-full"
                 initial={{ scaleX: 0, transformOrigin: 'left' }}
                 whileInView={{ scaleX: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
               />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, title: 'Connect GitHub', desc: 'Link your repository in 1 click. We instantly detect your tech stack.', icon: <GithubIcon size={32} /> },
                { step: 2, title: 'Push Code', desc: 'Just run `git push origin main`. We listen for webhook events automatically.', icon: <Terminal size={32} /> },
                { step: 3, title: 'Live!', desc: 'Your app is built and deployed globally with zero downtime in <30s.', icon: <Server size={32} /> },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative group hover:-translate-y-2 transition-transform duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold border-4 border-slate-50 shadow-sm z-10">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-center text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-center text-slate-600 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
