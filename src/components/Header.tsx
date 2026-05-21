"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/LanguageToggle";
import { site } from "@/lib/portfolio";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/#apropos", key: "about" },
  { href: "/#expertise", key: "expertise" },
  { href: "/#projets", key: "projects" },
  { href: "/#parcours", key: "journey" },
  { href: "/blog", key: "blog" },
  { href: "/#contact", key: "contact" },
];

interface HeaderProps {
  showProjects?: boolean;
  showJourney?: boolean;
  showBlog?: boolean;
}

export function Header({ showProjects = true, showJourney = true, showBlog = true }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("Navigation");
  const visibleNavItems = navItems.filter((item) => {
    if (!showProjects && item.href === "/#projets") return false;
    if (!showJourney && item.href === "/#parcours") return false;
    if (!showBlog && item.href === "/blog") return false;
    return true;
  });

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
        {visibleNavItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {t(item.key)}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <LanguageToggle />
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
          {t("discuss")}
        </a>
      </div>
      <nav id="mobile-menu" className="mobile-menu" aria-label="Navigation mobile">
        {visibleNavItems.map((item) => (
          <Link href={item.href} key={item.href} onClick={() => setIsMenuOpen(false)}>
            {t(item.key)}
          </Link>
        ))}
        <a href={`mailto:${site.email}`} onClick={() => setIsMenuOpen(false)}>
          {t("discuss")}
        </a>
      </nav>
    </header>
  );
}
