"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useDashboard } from "@/lib/context";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/overview", label: "Overview", icon: "📊" },
  { href: "/by-disease", label: "By Disease", icon: "🦠" },
  { href: "/by-country", label: "By Country", icon: "🌏" },
  { href: "/time-series", label: "Time Series", icon: "📈" },
];

const secondaryNavItems = [
  { href: "/upload", label: "Upload Data", icon: "📤" },
  { href: "/about", label: "About", icon: "ℹ️" },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { selectedYear, setSelectedYear, availableYears, loading, data } = useDashboard();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isOpen ? "w-64" : "lg:w-16"
        )}
      >
        {/* Logo / Title with Toggle */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {isOpen ? (
            <>
              <div>
                <h1 className="text-xl font-bold text-trust-blue">DALY Dashboard</h1>
                <p className="text-sm text-secondary mt-1">Asia Pacific Region</p>
              </div>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-trust-light rounded-md transition-colors"
                title="Close sidebar"
              >
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              className="w-full p-2 hover:bg-trust-light rounded-md transition-colors flex justify-center"
              title="Open sidebar"
            >
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-secondary hover:bg-trust-light hover:text-trust-blue transition-colors",
                      isActive && "bg-trust-light text-trust-blue font-medium",
                      !isOpen && "justify-center"
                    )}
                    title={!isOpen ? item.label : undefined}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Secondary Navigation */}
          {isOpen && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="px-3 text-xs font-medium text-secondary uppercase tracking-wider mb-2">
                Settings
              </p>
              <ul className="space-y-1">
                {secondaryNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={clsx(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-secondary hover:bg-trust-light hover:text-trust-blue transition-colors",
                          isActive && "bg-trust-light text-trust-blue font-medium"
                        )}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {!isOpen && (
            <div className="mt-4 pt-4 border-t border-border">
              <ul className="space-y-1">
                {secondaryNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={clsx(
                          "flex items-center justify-center p-2 rounded-md text-secondary hover:bg-trust-light hover:text-trust-blue transition-colors",
                          isActive && "bg-trust-light text-trust-blue"
                        )}
                        title={item.label}
                      >
                        <span>{item.icon}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </nav>

        {/* Year Selector */}
        {isOpen && (
          <div className="p-4 border-t border-border">
            <label className="block text-sm font-medium text-secondary mb-2">
              Analysis Year
            </label>
            {loading ? (
              <div className="w-full h-10 bg-border/50 rounded-md animate-pulse" />
            ) : (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-trust-accent"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Data Status */}
        {isOpen && (
          <div className="p-4 border-t border-border">
            {loading ? (
              <p className="text-xs text-secondary">Loading data...</p>
            ) : data ? (
              <>
                <p className="text-xs text-success font-medium">Data loaded</p>
                <p className="text-xs text-secondary mt-1">
                  {availableYears.length} years available
                </p>
                <p className="text-xs text-secondary">
                  Source: WHO Global Health Estimates
                </p>
              </>
            ) : (
              <p className="text-xs text-warning">No data loaded</p>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
