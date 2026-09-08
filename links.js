/*
 * LINKS — the single file to edit to add/remove/update a card on this page.
 * Same schema as adhd.tristonyoder.com's projects.js (see that repo's
 * README for the full field list: name, tagline, description, icon,
 * iconRounded, screenshots, tags, fork, links), plus two additions used
 * only on this page:
 *   iconClass  (optional) a Font Awesome class string, e.g. "fa-solid fa-book",
 *                rendered in place of the icon image / initials fallback.
 *   links.portfolio (optional) an extra "Portfolio ↗" button alongside
 *                website/repo/download.
 * Nothing is required except `name` — everything else degrades gracefully
 * when omitted.
 */

const FEATURED_PROJECTS = [];

const PROJECTS = [
  {
    name: "Production Knowledge Base",
    tagline: "wiki",
    iconClass: "fa-solid fa-book-open",
    description:
      "Playbook, gear manuals, and system procedures for TPCC production. If we tried something new and you're asking what it was, it's probably in here.",
    links: {
      website: "https://prodwiki.tpcc.org/s/d966661f-6230-4b9d-920a-d0b8b1a1907d",
    },
    tags: ["wiki"],
  },
  {
    name: "Projects",
    tagline: "adhd.tristonyoder.com",
    iconClass: "fa-solid fa-diagram-project",
    description: "A running list of the tools, apps, and experiments I've been building.",
    links: {
      website: "https://adhd.tristonyoder.com",
    },
    tags: ["web"],
  },
  {
    name: "GitHub",
    tagline: "github.com/TristonYoder",
    iconClass: "fa-brands fa-github",
    description: "Public repos, source code, and configs.",
    links: {
      website: "https://github.com/TristonYoder?tab=repositories",
    },
    tags: ["code"],
  },
  {
    name: "Photography",
    tagline: "elizabethallen.photography",
    icon: "icons/elizabethallen.png",
    iconRounded: true,
    description: "Caroline and I shoot weddings together!",
    links: {
      website: "https://elizabethallen.photography",
      portfolio: "https://gallery.elizabethallen.photography/portfolio",
    },
    tags: ["photography"],
  },
];
