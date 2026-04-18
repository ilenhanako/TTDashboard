"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/lib/context";

const dalyDashboardNavItems = [
  { href: "/people/daly-dashboard", label: "Home" },
  { href: "/people/daly-dashboard/overview", label: "Overview" },
  { href: "/people/daly-dashboard/by-disease", label: "By Disease" },
  { href: "/people/daly-dashboard/by-country", label: "By Country" },
  { href: "/people/daly-dashboard/time-series", label: "Time Series" },
  { href: "/people/daly-dashboard/upload", label: "Upload" },
];

export function TopNavbar() {
  const pathname = usePathname();
  const { selectedYear, setSelectedYear, availableYears } = useDashboard();

  const isLandingPage = pathname === "/";
  const isPeopleSection = pathname.startsWith("/people");
  const isDALYDashboard = pathname.startsWith("/people/daly-dashboard") ||
                          pathname.startsWith("/people/overview") ||
                          pathname.startsWith("/people/by-disease") ||
                          pathname.startsWith("/people/by-country") ||
                          pathname.startsWith("/people/time-series") ||
                          pathname.startsWith("/people/upload");

  return (
    <header className="top-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Back Button */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 text-trust-navy font-heading font-bold">
              Data Dashboard
            </Link>

            {/* Back to People link when in dashboard */}
            {isDALYDashboard && (
              <Link
                href="/people"
                className="hidden md:flex items-center gap-1 text-sm text-secondary hover:text-trust-navy transition-colors border-l border-border pl-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to People
              </Link>
            )}
          </div>

          {/* Navigation Links - Only show when in DALY Dashboard */}
          {isDALYDashboard && (
            <nav className="hidden md:flex items-center">
              {dalyDashboardNavItems.map((item) => {
                // Map old paths to new paths for active state
                const currentPath = pathname
                  .replace("/people/overview", "/people/daly-dashboard/overview")
                  .replace("/people/by-disease", "/people/daly-dashboard/by-disease")
                  .replace("/people/by-country", "/people/daly-dashboard/by-country")
                  .replace("/people/time-series", "/people/daly-dashboard/time-series")
                  .replace("/people/upload", "/people/daly-dashboard/upload");

                const isActive =
                  currentPath === item.href ||
                  (item.href !== "/people/daly-dashboard" && currentPath.startsWith(item.href));

                // Use old paths for now since pages haven't been moved yet
                const actualHref = item.href
                  .replace("/people/daly-dashboard/overview", "/people/overview")
                  .replace("/people/daly-dashboard/by-disease", "/people/by-disease")
                  .replace("/people/daly-dashboard/by-country", "/people/by-country")
                  .replace("/people/daly-dashboard/time-series", "/people/time-series")
                  .replace("/people/daly-dashboard/upload", "/people/upload");

                return (
                  <Link
                    key={item.href}
                    href={actualHref}
                    className={`top-nav-link ${isActive ? "top-nav-link-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Year Selector - Only show when in DALY Dashboard */}
          {isDALYDashboard && availableYears.length > 0 && (
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

        {/* Mobile Navigation - Only show when in DALY Dashboard */}
        {isDALYDashboard && (
          <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
            <Link
              href="/people"
              className="whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-secondary"
            >
              ← Back
            </Link>
            {dalyDashboardNavItems.map((item) => {
              const currentPath = pathname
                .replace("/people/overview", "/people/daly-dashboard/overview")
                .replace("/people/by-disease", "/people/daly-dashboard/by-disease")
                .replace("/people/by-country", "/people/daly-dashboard/by-country")
                .replace("/people/time-series", "/people/daly-dashboard/time-series")
                .replace("/people/upload", "/people/daly-dashboard/upload");

              const isActive =
                currentPath === item.href ||
                (item.href !== "/people/daly-dashboard" && currentPath.startsWith(item.href));

              const actualHref = item.href
                .replace("/people/daly-dashboard/overview", "/people/overview")
                .replace("/people/daly-dashboard/by-disease", "/people/by-disease")
                .replace("/people/daly-dashboard/by-country", "/people/by-country")
                .replace("/people/daly-dashboard/time-series", "/people/time-series")
                .replace("/people/daly-dashboard/upload", "/people/upload");

              return (
                <Link
                  key={item.href}
                  href={actualHref}
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
        )}
      </div>
    </header>
  );
}
