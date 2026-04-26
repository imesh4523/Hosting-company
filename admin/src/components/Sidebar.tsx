'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Key, Server, Users, DollarSign, Settings, LogOut } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'DO Accounts', icon: Key, href: '/accounts' },
  { name: 'Global VPS', icon: Server, href: '/vps' },
  { name: 'Recovery', icon: RefreshCcw, href: '/recovery' },
  { name: 'Customers', icon: Users, href: '/customers' },
  { name: 'Revenue', icon: DollarSign, href: '/revenue' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-[#020617] text-white min-h-screen hidden lg:block border-r border-white/5 relative">
      {/* Sidebar background glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600/5 blur-[80px] -z-10"></div>

      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
            U
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            Ulta<span className="text-blue-500">Core</span>
          </span>
        </Link>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-8 left-8 right-8">
        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 font-black border border-blue-500/20">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate tracking-tight text-white">System Admin</p>
              <p className="text-[10px] text-slate-500 font-bold truncate tracking-widest uppercase">Root Access</p>
            </div>
          </div>
          <button className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
