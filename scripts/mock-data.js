const PIXNARIA_DEFAULT_USER = {
  id: "user_snowoo",
  username: "Snowoo",
  displayName: "Snowoo",
  role: "creator",
  badges: ["Creator", "Admin"],
  joinedAt: "2026-07-13",
  avatarInitial: "S",
  avatarColor: "creator",
  email: "snowoo@example.hidden",
  emailVerified: true
};

const PIXNARIA_USER = JSON.parse(localStorage.getItem("pixnaria_mock_user") || "null") || PIXNARIA_DEFAULT_USER;

const PIXNARIA_PROJECTS = [
  {
    id: "neon-platformer",
    title: "Neon Platformer",
    author: "Snowoo",
    tag: "Game",
    description: "A fast 2D platformer built with nodes and Python movement.",
    likes: 128,
    favorites: 42,
    views: "2.4k",
    color: "violet",
    featured: true
  },
  {
    id: "pixel-forest",
    title: "Pixel Forest",
    author: "LunaDev",
    tag: "Animation",
    description: "A calm animated scene with glowing trees and particles.",
    likes: 96,
    favorites: 31,
    views: "1.8k",
    color: "cyan",
    featured: false
  },
  {
    id: "space-runner",
    title: "Space Runner",
    author: "OrbitKid",
    tag: "Game",
    description: "Dodge asteroids, collect crystals, and test your reflexes.",
    likes: 82,
    favorites: 24,
    views: "1.2k",
    color: "magenta",
    featured: false
  },
  {
    id: "animation-lab",
    title: "Animation Lab",
    author: "NariaMaker",
    tag: "Creative",
    description: "A small animation studio made with sprites and timers.",
    likes: 74,
    favorites: 18,
    views: "980",
    color: "indigo",
    featured: false
  }
];

const PIXNARIA_DEFAULT_NEWS = [
  {
    id: "news_welcome",
    category: "announcement",
    title: {
      en: "Welcome to Pixnaria",
      fr: "Bienvenue sur Pixnaria"
    },
    content: {
      en: "The first community coding platform concept is now taking shape.",
      fr: "Le premier concept de plate-forme communautaire de coding prend forme."
    },
    date: "2026-07-13",
    pinned: true,
    important: false,
    published: true
  },
  {
    id: "news_editor",
    category: "update",
    title: {
      en: "Node manager design started",
      fr: "Design du gestionnaire de nodes commencé"
    },
    content: {
      en: "Pixnaria will use a scene tree, Python scripts, and a custom 2D engine.",
      fr: "Pixnaria utilisera une arborescence de scène, des scripts Python et un moteur 2D personnalisé."
    },
    date: "2026-07-13",
    pinned: false,
    important: true,
    published: true
  },
  {
    id: "news_contest",
    category: "contest",
    title: {
      en: "Contests will arrive later",
      fr: "Les concours arriveront plus tard"
    },
    content: {
      en: "Creator-managed contests are planned for the future community hub.",
      fr: "Des concours gérés par le créateur sont prévus pour le futur hub communautaire."
    },
    date: "2026-07-13",
    pinned: false,
    important: false,
    published: true
  }
];

const PIXNARIA_TEAM = [
  {
    username: "Snowoo",
    role: "Creator / Admin",
    joinedAt: "2026-07-13",
    top: true
  },
  {
    username: "ModeratorSoon",
    role: "Moderator",
    joinedAt: "Soon",
    top: false
  }
];
