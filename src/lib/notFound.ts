import type { NotFoundCheck, NotFoundDestination } from "@/types/notFound";

export const notFoundDestinations: NotFoundDestination[] = [
  {
    href: "/",
    index: "01",
    title: "Accueil",
    description: "La promesse, les preuves et la manière dont je construis des plateformes SaaS.",
    action: "Revenir au point de départ",
  },
  {
    href: "/#expertise",
    index: "02",
    title: "Expertise",
    description: "Architecture SaaS, produit web et mobile, automatisation métier et dashboards.",
    action: "Voir les domaines couverts",
  },
  {
    href: "/#projets",
    index: "03",
    title: "Projets",
    description: "Plateformes livrées, packages open source et résultats mesurés.",
    action: "Parcourir les réalisations",
  },
  {
    href: "/#parcours",
    index: "04",
    title: "Parcours",
    description: "Les étapes, les contextes techniques et les responsabilités assumées.",
    action: "Suivre la trajectoire",
  },
  {
    href: "/blog",
    index: "05",
    title: "Blog",
    description: "Notes techniques sur architecture, scalabilité et qualité d'exécution.",
    action: "Lire les articles",
  },
  {
    href: "/#contact",
    index: "06",
    title: "Contact",
    description: "Un projet à cadrer, une plateforme à reprendre ou une mission à lancer.",
    action: "Démarrer la discussion",
  },
];

export const notFoundChecks: NotFoundCheck[] = [
  {
    label: "Serveur",
    detail: "La requête a été reçue et traitée normalement.",
    state: "ok",
    stateLabel: "Opérationnel",
  },
  {
    label: "Route demandée",
    detail: "Aucune page du site ne correspond à cette URL.",
    state: "failed",
    stateLabel: "Introuvable",
  },
  {
    label: "Reste du site",
    detail: "Toutes les autres sections restent accessibles.",
    state: "ok",
    stateLabel: "Disponible",
  },
];

export const notFoundCauses: string[] = ["Lien expiré", "URL mal copiée", "Contenu déplacé"];

export const LATEST_READS_COUNT = 3;
