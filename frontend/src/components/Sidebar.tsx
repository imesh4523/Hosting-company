'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useState } from 'react';

const menuItems = [
  { name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: '/dashboard' },
  { name: 'Domains', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', href: '/dashboard/domains' },
  { 
    name: 'Services', 
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 
    href: '/dashboard/services',
    subItems: [
      { name: 'My Services', href: '/dashboard/services' },
      { name: 'Order New Services', href: '/dashboard/order' },
      { name: 'View Available Addons', href: '/dashboard/addons' }
    ]
  },
  { name: 'Billing', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', href: '/dashboard/billing' },
  { name: 'Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', href: '/dashboard/support' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ Services: true });

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 min-h-screen hidden lg:block">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 premium-gradient rounded-lg flex items-center justify-center text-white font-bold">U</div>
          <span className="text-xl font-bold text-slate-900">Ulta<span className="text-primary">host</span></span>
        </Link>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href));
            const isOpen = openMenus[item.name];

            return (
              <div key={item.name}>
                {item.subItems ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive ? 'text-primary' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      {item.name}
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.name}
                  </Link>
                )}

                {/* Submenu */}
                {item.subItems && isOpen && (
                  <div className="mt-1 mb-2 ml-4 pl-4 border-l-2 border-slate-100 flex flex-col gap-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                            isSubActive ? 'text-primary bg-primary/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-primary' : 'bg-slate-300'}`} />
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-8 left-6 right-6">
        <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-xs text-slate-400 font-bold uppercase mb-2">Upgrade to Pro</p>
            <p className="text-sm mb-4">Get 2x performance and priority support.</p>
            <button className="w-full py-2 bg-primary rounded-lg font-bold text-sm">Upgrade Now</button>
          </div>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
        </div>
      </div>
    </aside>
  );
}
