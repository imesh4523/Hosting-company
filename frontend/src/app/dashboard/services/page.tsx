"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type VPS = {
  id: string;
  name: string;
  hostname: string | null;
  status: string;
  ip: string | null;
  createdAt: string;
  plan: {
    name: string;
    priceMonthly: number;
  } | null;
};

export default function ServicesPage() {
  const [vpsList, setVpsList] = useState<VPS[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/vps/my-vps", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setVpsList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching VPS:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 max-w-[1200px] mx-auto text-slate-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Products & Services</h1>
          <div className="text-sm text-slate-500">
            Portal Home / Client Area / My Products & Services
          </div>
        </div>
        <button className="bg-[#EBF0FF] text-primary hover:bg-[#E0E7FF] transition-colors px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <span>+ Add New</span>
        </button>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left Sidebar inside page */}
        <div className="w-[300px] flex flex-col gap-6 shrink-0">
          {/* Support PIN */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Support PIN</h3>
            <div className="flex gap-2 mb-4 justify-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-xl font-bold text-slate-400">
                  •
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 border border-slate-200 rounded-lg flex justify-center items-center text-slate-500 hover:bg-slate-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
              <button className="py-2 border border-slate-200 rounded-lg flex justify-center items-center text-slate-500 hover:bg-slate-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Actions</h3>
            <div className="flex flex-col gap-3">
              <Link href="/dashboard/order" className="flex items-center gap-3 text-sm text-primary hover:text-blue-700 font-medium">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Place a New Order
              </Link>
              <Link href="/dashboard/addons" className="flex items-center gap-3 text-sm text-primary hover:text-blue-700 font-medium">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                View Available Addons
              </Link>
            </div>
          </div>
        </div>

        {/* Right Content - Table */}
        <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              View 
              <select className="border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none">
                <option>All Entries</option>
              </select>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter search term..." 
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-64 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Product/Service</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">Next Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading your services...</td></tr>
              ) : vpsList.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No active products or services found.</td></tr>
              ) : (
                vpsList.map((vps) => (
                  <tr 
                    key={vps.id} 
                    onClick={() => router.push(`/dashboard/services/${vps.id}`)}
                    className="border-b border-slate-50 hover:bg-[#F8FAFF] cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{vps.plan?.name || "Custom VPS"}</div>
                          <div className="text-xs text-orange-500 font-medium mt-0.5">{vps.hostname || vps.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-medium">€{vps.plan?.priceMonthly?.toFixed(2) || "0.00"} EUR</div>
                      <div className="text-xs text-slate-400">Monthly</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {new Date(new Date(vps.createdAt).setMonth(new Date(vps.createdAt).getMonth() + 1)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Active
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-700">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-white text-sm text-slate-500">
            <div>Show <select className="border border-slate-200 rounded px-1"><option>10</option></select> entries</div>
            <div className="flex gap-1">
              <button className="px-3 py-1 bg-slate-50 border border-slate-200 rounded text-slate-400 cursor-not-allowed">Previous</button>
              <button className="px-3 py-1 bg-primary text-white rounded">1</button>
              <button className="px-3 py-1 bg-slate-50 border border-slate-200 rounded text-slate-400 cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
