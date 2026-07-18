const PIXNARIA_DEFAULT_USER = {
  id: "guest",
  username: "Guest",
  displayName: "Guest",
  role: "guest",
  badges: [],
  joinedAt: "",
  avatarInitial: "?",
  avatarColor: "default",
  emailVerified: false,
  githubConnected: false
};

const PIXNARIA_USER = JSON.parse(localStorage.getItem("pixnaria_mock_user") || "null") || PIXNARIA_DEFAULT_USER;

const PIXNARIA_PROJECTS = [
  {
    id: "neon-platformer",
    title: "Neon Platformer",
    author: "Snowoo-2z",
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
    title: { en: "Pixnaria is live", fr: "Pixnaria est en ligne" },
    content: { en: "Create, code and publish open projects with GitHub.", fr: "Crée, code et publie des projets ouverts avec GitHub." },
    date: "2026-07-15",
    pinned: true,
    important: false,
    published: true
  },
  {
    id: "news_engine",
    category: "update",
    title: { en: "Canvas engine connected", fr: "Moteur Canvas connecté" },
    content: { en: "The editor can now launch the Pixnaria Canvas runtime.", fr: "L’éditeur peut maintenant lancer le runtime Canvas Pixnaria." },
    date: "2026-07-15",
    pinned: false,
    important: true,
    published: true
  }
];

const PIXNARIA_TEAM = [
  { username: "Snowoo-2z", role: "Creator / Admin", joinedAt: "2026-07-13", top: true },
  { username: "ModeratorSoon", role: "Moderator", joinedAt: "Soon", top: false }
];


window.PIXNARIA_DEFAULT_USER = PIXNARIA_DEFAULT_USER;
window.PIXNARIA_USER = PIXNARIA_USER;
window.PIXNARIA_PROJECTS = PIXNARIA_PROJECTS;
window.PIXNARIA_DEFAULT_NEWS = PIXNARIA_DEFAULT_NEWS;
window.PIXNARIA_TEAM = PIXNARIA_TEAM;
