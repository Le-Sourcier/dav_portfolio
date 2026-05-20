"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/portfolio";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/#apropos", label: "À propos" },
  { href: "/#expertise", label: "Expertise" },
  { href: "/#projets", label: "Projets" },
  { href: "/#parcours", label: "Parcours" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${isMenuOpen ? "is-menu-open" : ""}`}>
      <Link href="/" className="brand" aria-label="Accueil Yao David Logan">
        <Image className="brand-logo-light" src="/brand/logo-horizontal-clean.png" alt="" width={176} height={65} priority />
        <Image className="brand-logo-dark" src="/brand/logo-horizontal-clean-dark.png" alt="" width={176} height={65} priority />
      </Link>
      <nav className="nav-links" aria-label="Navigation principale">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <button
          type="button"
          className="mobile-menu-button"
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span />
          <span />
        </button>
        <a className="header-cta" href={`mailto:${site.email}`}>
          Discuter
        </a>
      </div>
      <nav id="mobile-menu" className="mobile-menu" aria-label="Navigation mobile">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href} onClick={() => setIsMenuOpen(false)}>
            {item.label}
          </Link>
        ))}
        <a href={`mailto:${site.email}`} onClick={() => setIsMenuOpen(false)}>
          Discuter
        </a>
      </nav>
    </header>
  );
}
