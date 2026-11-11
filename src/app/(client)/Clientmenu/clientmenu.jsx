
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProfileImage from "../dashboard/component/profileImage";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";

import {
  Waves,
  LayoutDashboard,
  Compass,
  Heart,
  CalendarCheck,
  Bell,
  UserRound,
  Settings,
  Search,
  LogOut,
  Menu as MenuIcon,
  X,
  ArrowUpRight,
} from "lucide-react";

import "./menu.css";

export default function Menu() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await signOut(auth);
      sessionStorage.clear();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
      setSigningOut(false);
    }
  };

  const navLinks = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Explore",
      href: "/dashboard/explore",
      icon: Compass,
    },
    {
      name: "Favorites",
      href: "/dashboard/favorites",
      icon: Heart,
    },
    {
      name: "My bookings",
      href: "/dashboard/mybooking",
      icon: CalendarCheck,
    },
    {
      name: "Notifications",
      href: "/dashboard/notification",
      icon: Bell,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: UserRound,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSearch = () => {
    setMobileMenuOpen(false);

    document
      .getElementById("resort-search")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <header className="resorts-header">
      <div className="resorts-header-inner">
        {/* Brand */}
        <Link href="/dashboard" className="resorts-brand">
          <span className="brand-mark">
            <Waves size={25} strokeWidth={2.3} />
          </span>

          <span className="brand-copy">
            <strong>HotelReserve</strong>
            <small>Stay better. Travel further.</small>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="resorts-nav" aria-label="Main navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`resorts-nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={17} strokeWidth={active ? 2.3 : 1.9} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          <button
            type="button"
            className="header-search-button"
            aria-label="Find hotels"
            onClick={handleSearch}
          >
            <Search size={19} />
          </button>

          <Link
            href="/dashboard/explore"
            className="header-explore-button"
          >
            <span>Find a stay</span>
            <ArrowUpRight size={17} />
          </Link>

          <div className="header-profile">
            <div className="header-profile-image">
              <ProfileImage />
            </div>

            <button
              type="button"
              className="header-signout-button"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut size={17} />
              <span>{signingOut ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X size={23} /> : <MenuIcon size={23} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-nav-inner">
          <div className="mobile-nav-heading">
            <span>YOUR ACCOUNT</span>
            <span className="mobile-nav-indicator">MENU</span>
          </div>

          <nav aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`mobile-nav-link ${active ? "active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="mobile-nav-icon">
                    <Icon size={19} />
                  </span>

                  <span>{link.name}</span>

                  {active && <span className="mobile-active-dot" />}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="mobile-search-button"
            onClick={handleSearch}
          >
            <Search size={18} />
            Search for hotels
          </button>

          <button
            type="button"
            className="mobile-signout-button"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut size={18} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
