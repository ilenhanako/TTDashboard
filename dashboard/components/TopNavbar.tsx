"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useDashboard } from "@/lib/context";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/overview", label: "Overview" },
  { href: "/by-disease", label: "By Disease" },
  { href: "/by-country", label: "By Country" },
  { href: "/time-series", label: "Time Series" },
  { href: "/upload", label: "Upload" },
  { href: "/about", label: "About" },
];

export function TopNavbar() {
  const pathname = usePathname();
  const { selectedYear, setSelectedYear, availableYears } = useDashboard();

  return (
    <header className="top-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/temasek-trust-logo.svg"
              alt="Temasek Trust"
              width={160}
              height={20}
              className="h-5 w-auto"
              priority
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`top-nav-link ${isActive ? "top-nav-link-active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Year Selector */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-secondary font-medium">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-white text-primary focus:outline-none focus:ring-2 focus:ring-trust-blue focus:border-transparent"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  isActive
                    ? "bg-trust-navy text-white"
                    : "bg-trust-light text-secondary hover:bg-trust-blue hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
