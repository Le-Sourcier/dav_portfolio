"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/portfolio";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <Link href="/" className="brand" aria-label="Accueil Yao David Logan">
        <span>{site.initials}</span>
      </Link>
      <nav className="nav-links" aria-label="Navigation principale">
        <Link href="/#expertise">Expertise</Link>
        <Link href="/#projets">Projets</Link>
        <Link href="/#parcours">Parcours</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/#contact">Contact</Link>
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <a className="header-cta" href={`mailto:${site.email}`}>
          Discuter
        </a>
      </div>
    </header>
  );
}
