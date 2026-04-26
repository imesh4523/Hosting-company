import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl">U</div>
              <span className="text-2xl font-bold text-slate-900">Ulta<span className="text-primary">host</span></span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="#" className="text-slate-600 hover:text-primary font-medium transition-colors">Domains</Link>
              <Link href="#" className="text-slate-600 hover:text-primary font-medium transition-colors">Hosting</Link>
              <Link href="#" className="text-slate-600 hover:text-primary font-medium transition-colors">Solutions</Link>
              <Link href="#" className="text-slate-600 hover:text-primary font-medium transition-colors">Support</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary/20 text-primary font-semibold hover:bg-primary/5 transition-all">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Chat with UltaAI
            </button>
            <Link href="/login" className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
              Client Area
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
