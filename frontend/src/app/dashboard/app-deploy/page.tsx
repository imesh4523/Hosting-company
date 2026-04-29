'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  RefreshCw, 
  Plus, 
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  X,
  Check,
  Info,
  ChevronDown,
  Trash2,
  Edit2,
  Globe,
  Settings,
  Cpu,
  Layers,
  Terminal,
  Zap,
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// DigitalOcean Blue: #0069ff
const DO_BLUE = '#0069ff';

// Custom Icons for Git Providers
const GitHubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const GitLabIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#e24329">
    <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.417-.724-.417-.859 0L16.425 9.452H7.575L4.91 1.263c-.135-.417-.724-.417-.859 0L1.387 9.452.045 13.587c-.114.352.016.74.322.962l11.633 8.448 11.633-8.448c.306-.222.436-.61.322-.962z" />
  </svg>
);

const BitbucketIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#0052cc">
    <path d="M1.45 2.002a.78.78 0 00-.77.925l2.677 18.06c.066.452.455.787.913.787H19.73a.78.78 0 00.772-.656l2.772-18.19a.78.78 0 00-.772-.926H1.45zm13.75 14.545H8.8l-1.12-6.545h8.636l-1.116 6.545z" />
  </svg>
);

type Step = 'source' | 'configure';

export default function AppDeployPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('source');
  const [sourceType, setSourceType] = useState('git'); // git, container, template
  const [gitProvider, setGitProvider] = useState('github');
  
  const [repos, setRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('main');
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [isTokenSaved, setIsTokenSaved] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Config state
  const [config, setConfig] = useState({
    name: 'hosting-company',
    framework: 'Node.js',
    buildCommand: 'npm run build',
    runCommand: 'npm start',
    port: 8080,
    region: 'New York (NYC3)',
    size: '1 GB RAM / 1 Shared vCPU',
    autodeploy: true,
    envVars: [] as {key: string, value: string}[]
  });

  useEffect(() => {
    checkToken();
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setIsTokenSaved(true);
      fetchRepos();
    }
  }, []);

  const checkToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/apps/github-repos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setIsTokenSaved(true);
        const data = await res.json();
        setRepos(data);
      }
    } catch (err) {}
  };

  const handleGitHubLogin = async () => {
    setIsConnecting(true);
    console.log('Fetching GitHub Auth URL...');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to connect GitHub');
        setIsConnecting(false);
        return;
      }
      const res = await fetch('/api/apps/github-auth-url', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Auth URL response:', data);
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Could not get authorization URL. Please check if GITHUB_CLIENT_ID is set in .env');
        setIsConnecting(false);
      }
    } catch (err) { 
      console.error('GitHub Login Error:', err);
      alert('Failed to connect to backend service.'); 
      setIsConnecting(false);
    }
  };

  const fetchRepos = async () => {
    setLoadingRepos(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/apps/github-repos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRepos(data);
    } catch (err) {} finally { setLoadingRepos(false); }
  };

  const handleRepoSelect = async (fullName: string) => {
    const repo = repos.find(r => r.fullName === fullName);
    if (!repo) return;
    setSelectedRepo(repo);
    setConfig({ ...config, name: repo.name });
    
    // Fetch branches
    try {
      const [owner, name] = repo.fullName.split('/');
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/apps/github-branches/${owner}/${name}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBranches(data);
        setSelectedBranch(data.includes('main') ? 'main' : data[0]);
      }
    } catch (err) {}
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/apps/deploy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          repoUrl: selectedRepo.url, 
          appName: config.name,
          config: {
            framework: config.framework.toLowerCase(),
            buildCommand: config.buildCommand,
            runCommand: config.runCommand,
            port: config.port,
            envVars: config.envVars
          }
        })
      });
      const data = await res.json();
      if (res.ok) router.push(`/dashboard/apps/status/${data.appId}`);
      else alert(data.message || 'Deployment failed');
    } catch (err) { alert('Error triggering deployment'); }
    finally { setIsDeploying(false); }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f9] font-sans text-[#031b4e]">
      
      {/* Header Stepper */}
      <div className="bg-white border-b border-[#e5e8ed] px-8 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${step === 'source' ? 'border-[#0069ff] text-[#0069ff]' : 'border-green-500 text-green-500'}`}>
                {step === 'configure' ? <Check size={16} /> : '1'}
             </div>
             <span className={`text-sm font-bold ${step === 'source' ? 'text-[#031b4e]' : 'text-[#0069ff]'}`}>Choose source</span>
          </div>
          <div className="w-12 h-px bg-[#e5e8ed]" />
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${step === 'configure' ? 'border-[#0069ff] text-[#0069ff]' : 'border-[#e5e8ed] text-[#818a91]'}`}>
                2
             </div>
             <span className={`text-sm font-bold ${step === 'configure' ? 'text-[#031b4e]' : 'text-[#818a91]'}`}>Configure app</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 py-10 flex gap-8">
        
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          
          <AnimatePresence mode="wait">
            {step === 'source' ? (
              <motion.div key="source" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                <h1 className="text-2xl font-bold">Choose a deployment source</h1>
                <p className="text-[#4e5d78] text-sm leading-relaxed">
                  Add web services, jobs, workers, static sites, functions, and databases using these deployment methods. You can add, edit, and delete resources at any time.
                </p>

                {/* Source Tabs */}
                <div className="flex border-b border-[#e5e8ed]">
                  <button 
                    onClick={() => setSourceType('git')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${sourceType === 'git' ? 'border-[#0069ff] text-[#0069ff]' : 'border-transparent text-[#818a91] hover:text-[#031b4e]'}`}
                  >
                    Git repository
                  </button>
                  <button className="px-6 py-3 text-sm font-bold border-b-2 border-transparent text-[#818a91] opacity-50 cursor-not-allowed">Container image</button>
                  <button className="px-6 py-3 text-sm font-bold border-b-2 border-transparent text-[#818a91] opacity-50 cursor-not-allowed">Templates</button>
                </div>

                <div className="bg-white rounded-lg border border-[#e5e8ed] p-8 space-y-8">
                  <h3 className="font-bold">Connect and select a repository</h3>
                  <p className="text-sm text-[#4e5d78]">We'll automatically detect and import resources from selected repositories.</p>
                  
                  {/* Git Providers */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-[#4e5d78] uppercase">Git provider</label>
                    <div className="flex gap-8">
                       <button onClick={() => setGitProvider('github')} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gitProvider === 'github' ? 'border-[#0069ff]' : 'border-[#e5e8ed]'}`}>
                             {gitProvider === 'github' && <div className="w-2.5 h-2.5 rounded-full bg-[#0069ff]" />}
                          </div>
                          <GitHubIcon />
                          <span className={`text-sm font-bold ${gitProvider === 'github' ? 'text-[#0069ff]' : 'text-[#031b4e]'}`}>GitHub</span>
                       </button>
                       <button className="flex items-center gap-3 opacity-50">
                          <div className="w-5 h-5 rounded-full border-2 border-[#e5e8ed]" />
                          <GitLabIcon />
                          <span className="text-sm font-bold">GitLab</span>
                       </button>
                       <button className="flex items-center gap-3 opacity-50">
                          <div className="w-5 h-5 rounded-full border-2 border-[#e5e8ed]" />
                          <BitbucketIcon />
                          <span className="text-sm font-bold">Bitbucket</span>
                       </button>
                    </div>
                  </div>

                  {/* Repo Selection */}
                  {!isTokenSaved ? (
                    <div className="p-10 border-2 border-dashed border-[#e5e8ed] rounded-xl flex flex-col items-center text-center">
                       <GitHubIcon size={48} />
                       <h4 className="mt-4 font-bold">Connect your GitHub account</h4>
                       <p className="text-sm text-[#4e5d78] mt-2 mb-6">Authorize our app to access your repositories and start deploying.</p>
                       <button 
                        onClick={handleGitHubLogin}
                        disabled={isConnecting}
                        className="bg-[#0069ff] text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-[#0055cc] transition-all flex items-center gap-2"
                       >
                         {isConnecting && <RefreshCw size={16} className="animate-spin" />}
                         {isConnecting ? 'Connecting...' : 'Connect to GitHub'}
                       </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       <div className="space-y-2">
                         <label className="text-xs font-bold text-[#4e5d78] uppercase flex items-center justify-between">
                            Repository
                            <button onClick={handleGitHubLogin} className="text-[#0069ff] normal-case font-bold hover:underline">Edit your GitHub permissions ↗</button>
                         </label>
                         <div className="relative">
                            <select 
                              onChange={(e) => handleRepoSelect(e.target.value)}
                              className="w-full bg-white border border-[#e5e8ed] rounded-md px-4 py-3 text-sm font-medium appearance-none focus:border-[#0069ff] focus:ring-1 focus:ring-[#0069ff] outline-none"
                            >
                              <option value="">Select a Repository</option>
                              {repos.map(r => <option key={r.id} value={r.fullName}>{r.fullName}</option>)}
                            </select>
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#818a91] pointer-events-none" />
                         </div>
                       </div>

                       {selectedRepo && (
                         <div className="space-y-6 pt-4 border-t border-[#e5e8ed] animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-[#4e5d78] uppercase">Branch</label>
                               <div className="relative">
                                  <select 
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="w-full bg-white border border-[#e5e8ed] rounded-md px-4 py-3 text-sm font-medium appearance-none focus:border-[#0069ff] outline-none"
                                  >
                                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                  </select>
                                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#818a91] pointer-events-none" />
                               </div>
                            </div>
                            
                            <div className="p-4 rounded-md border border-[#0069ff] bg-[#f0f7ff] flex items-start gap-3">
                               <div className="mt-0.5"><input type="checkbox" checked readOnly className="rounded border-[#0069ff] text-[#0069ff]" /></div>
                               <div>
                                  <h5 className="text-sm font-bold text-[#0069ff]">Autodeploy</h5>
                                  <p className="text-xs text-[#4e5d78] mt-1">Every time an update is made to this branch, your application will be re-deployed.</p>
                               </div>
                            </div>

                            <div className="flex justify-start pt-4">
                               <button 
                                onClick={() => setStep('configure')}
                                className="bg-[#0069ff] text-white px-10 py-3 rounded-md font-bold text-sm hover:bg-[#0055cc] shadow-sm"
                               >
                                 Next
                               </button>
                            </div>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="flex items-center gap-4">
                   <button onClick={() => setStep('source')} className="text-[#0069ff] hover:underline flex items-center gap-1 text-sm font-bold">
                      <ChevronLeft size={16} /> Choose source
                   </button>
                   <div className="w-1.5 h-1.5 rounded-full bg-[#818a91]" />
                   <span className="text-sm font-bold text-[#031b4e]">Configure app</span>
                </div>

                <h1 className="text-2xl font-bold">Review and configure resource settings</h1>
                
                <div className="space-y-6">
                   <h3 className="text-lg font-bold">Resource settings</h3>
                   
                   {/* App Card */}
                   <div className="relative">
                      <div className="absolute -bottom-2 left-10 w-4 h-4 bg-white border-r border-b border-[#0069ff] rotate-45 z-10" />
                      <div className="inline-flex flex-col p-4 rounded-lg border-2 border-[#0069ff] bg-white min-w-[180px] shadow-sm">
                         <div className="flex items-center gap-2 mb-1">
                            <div className="text-[#0069ff]"><Settings size={18} /></div>
                            <span className="font-bold text-sm">{config.name}</span>
                         </div>
                         <span className="text-xs text-[#818a91] ml-6">Web Service</span>
                      </div>
                   </div>

                   {/* Detailed Settings Card */}
                   <div className="bg-white rounded-lg border border-[#e5e8ed] overflow-hidden shadow-sm">
                      <div className="p-6 flex items-center justify-between border-b border-[#e5e8ed]">
                         <div className="flex items-center gap-3">
                            <Settings size={24} className="text-[#0069ff]" />
                            <div>
                               <h4 className="font-bold">{config.name}</h4>
                               <p className="text-xs text-[#818a91]">Node.js build detected</p>
                            </div>
                         </div>
                         <button className="text-[#818a91] hover:text-red-500"><Trash2 size={20} /></button>
                      </div>

                      {/* Info Sections */}
                      {[
                        { label: 'Info', items: [{ name: 'Name', value: config.name }, { name: 'Resource type', value: 'Web Service', icon: <Settings size={14}/> }] },
                        { label: 'Source', items: [{ name: 'Repository', value: selectedRepo?.fullName }, { name: 'Branch', value: selectedBranch }, { name: 'Auto-deploy on push', value: 'Enabled' }] },
                        { label: 'Size', items: [{ name: 'Instance size', value: config.size }, { name: 'Containers', value: '1' }] },
                        { label: 'Deployment settings', items: [{ name: 'Build strategy', value: 'Buildpack' }, { name: 'Build command', value: config.buildCommand || 'No build command defined' }, { name: 'Run command', value: config.runCommand || 'npm start' }] },
                        { label: 'Network', items: [{ name: 'Public HTTP port', value: config.port }] }
                      ].map((section, idx) => (
                        <div key={idx} className="p-6 border-b border-[#e5e8ed] flex">
                           <div className="w-1/3">
                              <h5 className="font-bold text-sm">{section.label}</h5>
                           </div>
                           <div className="w-full space-y-4">
                              {section.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                   <div>
                                      <span className="text-xs font-bold text-[#818a91] block uppercase">{item.name}</span>
                                      <span className="text-sm font-medium flex items-center gap-2 mt-1">
                                         {(item as any).icon} {item.value}
                                      </span>
                                   </div>
                                   <button className="text-[#0069ff] text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                      <Edit2 size={12} /> Edit
                                   </button>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}

                      <div className="p-6">
                         <h5 className="font-bold text-sm mb-4">Environment variables</h5>
                         <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded">
                            <span className="text-xs text-[#818a91] italic">No environment variables added.</span>
                            <button className="text-[#0069ff] text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                               <Edit2 size={12} /> Edit
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Summary */}
        <div className="w-[340px]">
          <div className="bg-white rounded-lg border border-[#e5e8ed] p-8 space-y-6 shadow-sm sticky top-10">
             <h2 className="text-lg font-bold">Summary</h2>
             
             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-start gap-3">
                   <Settings size={20} className="text-[#0069ff] mt-1" />
                   <div className="flex-1">
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold">{config.name}</span>
                         <span className="text-xs font-bold text-[#818a91]">$24.00/mo</span>
                      </div>
                      <p className="text-xs text-[#818a91] mt-1">vCPU: 1 Shared</p>
                      <p className="text-xs text-[#818a91]">Memory: 1 GB RAM</p>
                      <p className="text-xs text-[#818a91]">Containers: 1</p>
                   </div>
                </div>
             </div>

             <div className="h-px bg-[#e5e8ed]" />

             <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold">Total cost</span>
                <span className="text-lg font-bold">$24.00/month</span>
             </div>

             <button 
                onClick={handleDeploy}
                disabled={isDeploying || !selectedRepo}
                className="w-full bg-[#0069ff] text-white py-4 rounded-md font-bold text-base hover:bg-[#0055cc] disabled:bg-[#818a91] disabled:cursor-not-allowed transition-all shadow-md active:transform active:scale-[0.98]"
             >
                {isDeploying ? <RefreshCw className="animate-spin inline mr-2" size={20} /> : null}
                Create app
             </button>

             {/* Bottom Info Card */}
             <div className="p-4 rounded-md border border-[#e5e8ed] flex gap-4 bg-[#f9fafb]">
                <div className="w-12 h-12 bg-white rounded-full border border-[#e5e8ed] flex items-center justify-center">
                   <Zap size={24} className="text-amber-500" />
                </div>
                <div>
                   <h5 className="text-xs font-bold">Prefer an automated setup?</h5>
                   <p className="text-[11px] text-[#4e5d78] mt-1">Use the API to automate app creation and integrate with your existing workflows.</p>
                   <button className="text-[#0069ff] text-[11px] font-bold mt-2 hover:underline">Create via API</button>
                </div>
             </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #888;
        }
      `}</style>
    </div>
  );
}
