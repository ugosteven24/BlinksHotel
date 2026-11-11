
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Waves,
  Home,
  Hotel,
  MapPin,
  Mail,
  Search,
  Heart,
  Users,
  CalendarCheck,
  Menu as MenuIcon,
  X,
  ArrowUpRight,
} from "lucide-react";

import "./guestmenu.css";

export default function GuestMenu() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Resorts",
      href: "/pages/resorts",
      icon: Hotel,
    },
    {
      name: "Destinations",
      href: "/pages/destinations",
      icon: MapPin,
    },
    {
      name: "Contact",
      href: "/pages/contact",
      icon: Mail,
    },
    {
      name: "About",
      href: "/pages/about",
      icon: Users,
    },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSearch = () => {
    setMobileMenuOpen(false);

    document
      .getElementById("resort-search")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  return (
    <header className="resorts-header">
      <div className="resorts-header-inner">

        {/* Brand */}
        <Link href="/" className="resorts-brand">
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
            aria-label="Search resorts"
            onClick={handleSearch}
          >
            <Search size={19} />
          </button>

          <Link
            href="/dashboard/favorites"
            className="header-favorites-button"
            aria-label="Favorites"
          >
            <Heart size={19} />
          </Link>

          <Link
            href="/login"
            className="header-signin-button"
          >
            <Users size={17} />
            <span>Sign in</span>
          </Link>

          <Link
            href="/dashboard/mybooking"
            className="header-bookings-button"
          >
            <CalendarCheck size={17} />
            <span>My Bookings</span>
            <ArrowUpRight size={15} />
          </Link>

          {/* Mobile Toggle */}
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
            <span>EXPLORE HOTELRESERVE</span>
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
            Search for a stay
          </button>

          <Link
            href="/login"
            className="mobile-signin-button"
          >
            <Users size={18} />
            Sign in / Create account
          </Link>

          <Link
            href="/dashboard/mybooking"
            className="mobile-bookings-button"
          >
            <CalendarCheck size={18} />
            My Bookings
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
