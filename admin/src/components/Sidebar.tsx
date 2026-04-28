"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Nav items with actual frontend icons ─────────────────────────────────────
const navItems = [
  { label: "Dashboard",     href: "/",            icon: "/icons/chat.svg",           isSvg: true  },
  { label: "Analytics",     href: "/analytics",   icon: "/icons/ssl-2x.webp",        isSvg: false },
  { label: "Servers",       href: "/servers",     icon: "/icons/dedicated-2x.webp",  isSvg: false },
  { label: "Global VPS",    href: "/vps",         icon: "/icons/vds-2x.webp",        isSvg: false },
  { label: "Hosting Plans", href: "/plans",       icon: "/icons/vps-2x.webp",        isSvg: false },
  { label: "Cloud Accounts", href: "/cloud-accounts", icon: "/icons/domain-2x.webp",     isSvg: false },
  { label: "Recovery",      href: "/recovery",    icon: "/icons/transfer-2x.webp",   isSvg: false },
  { label: "Migrations",    href: "/migrations",  icon: "/icons/transfer-2x.webp",   isSvg: false },
  { label: "Account Health",href: "/migrations/accounts", icon: "/icons/domain-2x.webp", isSvg: false },
  { label: "Customers",     href: "/customers",   icon: "/icons/shared-2x.webp",     isSvg: false },
  { label: "Billing",       href: "/billing",     icon: "/icons/wordpress-2x.webp",  isSvg: false },
  { label: "Support",       href: "/support",     icon: "/icons/ticket.svg",          isSvg: true  },
  { label: "Affiliates",    href: "/affiliates",  icon: "/icons/reseller.svg",        isSvg: true  },
  { label: "Alerts",        href: "/alerts",      icon: "/icons/email.svg",           isSvg: true  },
  { label: "Fraud Center",  href: "/fraud",       icon: "/icons/domain-ssl.svg",      isSvg: true  },
  { label: "Audit Log",     href: "/audit",       icon: "/icons/knowledge.svg",       isSvg: true  },
  { label: "Auth Settings",  href: "/settings/auth",icon: "/icons/domain-ssl.svg",      isSvg: true  },
  { label: "Settings",      href: "/settings",    icon: "/icons/uptime.svg",          isSvg: true  },
];

// ─── Smart icon renderer ───────────────────────────────────────────────────────
// SVGs from frontend have their own built-in white/light rounded background (40x40)
// WEBPs are artwork-only — need a styled container
function SidebarIcon({ src, alt, isSvg, isActive, label }: { src: string; alt: string; isSvg: boolean; isActive: boolean, label: string }) {
  // User requested Dashboard and Billing to stay "like before" or specifically adjusted
  const isSpecial = label === "Dashboard" || label === "Billing";
  
  if (isSvg) {
    // Increase size for "other" SVGs, keep special ones slightly smaller if needed
    const size = isSpecial ? 34 : 38;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{ display: "block", flexShrink: 0, borderRadius: "8px" }}
      />
    );
  }

  // WEBP — artwork only, needs container
  const iconSize = isSpecial ? 22 : 26;
  return (
    <div style={{
      width: "32px",
      height: "32px",
      borderRadius: "8px",
      background: isActive ? "rgba(69,123,255,0.08)" : "#F3F4F6",
      border: "1px solid rgba(0,0,0,0.04)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
      transition: "background 0.15s ease",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={iconSize} height={iconSize} style={{ objectFit: "contain" }} />
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "220px",
      minHeight: "100vh",
      background: "#fff",
      borderRight: "1px solid #F3F4F6",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: "20px 18px 14px", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{
            width: "34px", height: "34px",
            background: "linear-gradient(135deg, #5145FF 0%, #7C6FFF 100%)",
            borderRadius: "9px",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 800, fontSize: "15px",
            boxShadow: "0 4px 12px rgba(81,69,255,0.30)",
            flexShrink: 0,
          }}>U</div>
          <span style={{ fontSize: "15px", fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>
            Ulta<span style={{ color: "#457BFF" }}>Core</span>
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        {navItems.map(({ label, href, icon, isSvg }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "6px 10px",
                borderRadius: "9px",
                marginBottom: "2px",
                textDecoration: "none",
                background: isActive ? "rgba(69,123,255,0.07)" : "transparent",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "#F9FAFB";
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <SidebarIcon src={icon} alt={label} isSvg={isSvg} isActive={isActive} label={label} />

              <span style={{
                fontSize: "13px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#457BFF" : "#374151",
                transition: "color 0.15s ease",
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Admin user card ── */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid #F3F4F6" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "9px",
          padding: "8px 10px", borderRadius: "9px", background: "#F9FAFB",
        }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "linear-gradient(135deg, #5145FF, #7C6FFF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "11px", fontWeight: 700, flexShrink: 0,
          }}>A</div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Admin</div>
            <div style={{ fontSize: "10.5px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Super Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
