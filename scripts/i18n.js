const PixnariaI18n = (() => {
  const translations = {
    en: {
      explorer: "Explorer",
      messages: "Messages",
      projects: "Projects",
      profile: "Profile",
      settings: "Settings",
      heroBadge: "Open source coding platform",
      heroTitle: "Imagine. Create. Share.",
      heroText: "Create games and animations with Python, nodes, and a custom 2D engine.",
      startCreating: "Start Creating",
      exploreProjects: "Explore Projects",
      sceneTree: "Scene Tree",
      codePreview: "Python Script",
      trending: "Trending Projects",
      featured: "Featured Project",
      news: "News",
      manageNews: "Manage News",
      studios: "Studios & Community",
      studiosText: "Create, publish, discover, favorite, and build a creative open source community.",
      openEditor: "Open Editor",
      viewProject: "View Project",
      likes: "likes",
      favorites: "favorites",
      views: "views",
      footerText: "Coding, nodes, Python and community — built for creators.",
      ourTeam: "Our Team",
      contactUs: "Contact Us",
      privacy: "Privacy",
      terms: "Terms",
      github: "GitHub",
      adminPanel: "News Manager",
      newsTitle: "Title",
      newsContent: "Content",
      newsCategory: "Category",
      newsPinned: "Pinned",
      newsImportant: "Important",
      addNews: "Add news",
      resetNews: "Reset demo news",
      close: "Close",
      language: "FR",
      mobileMenu: "Menu"
    },
    fr: {
      explorer: "Explorer",
      messages: "Messages",
      projects: "Projets",
      profile: "Profil",
      settings: "Paramètres",
      heroBadge: "Plate-forme de coding open source",
      heroTitle: "Imagine. Crée. Partage.",
      heroText: "Crée des jeux et animations avec Python, des nodes et un moteur 2D personnalisé.",
      startCreating: "Commencer à créer",
      exploreProjects: "Explorer les projets",
      sceneTree: "Arborescence",
      codePreview: "Script Python",
      trending: "Projets tendance",
      featured: "Projet mis en avant",
      news: "Actualités",
      manageNews: "Gérer les actualités",
      studios: "Studios & Communauté",
      studiosText: "Crée, publie, découvre, ajoute en favori et construis une communauté open source créative.",
      openEditor: "Ouvrir l’éditeur",
      viewProject: "Voir le projet",
      likes: "likes",
      favorites: "favoris",
      views: "vues",
      footerText: "Coding, nodes, Python et communauté — construit pour les créateurs.",
      ourTeam: "Our Team",
      contactUs: "Contact Us",
      privacy: "Confidentialité",
      terms: "Conditions",
      github: "GitHub",
      adminPanel: "Gestion des actualités",
      newsTitle: "Titre",
      newsContent: "Contenu",
      newsCategory: "Catégorie",
      newsPinned: "Épinglé",
      newsImportant: "Important",
      addNews: "Ajouter l’actualité",
      resetNews: "Réinitialiser les actus démo",
      close: "Fermer",
      language: "EN",
      mobileMenu: "Menu"
    }
  };

  let lang = localStorage.getItem("pixnaria_lang") || "en";

  function t(key) {
    return translations[lang]?.[key] || translations.en[key] || key;
  }

  function current() {
    return lang;
  }

  function setLang(next) {
    lang = next;
    localStorage.setItem("pixnaria_lang", lang);
    apply();
    document.dispatchEvent(new CustomEvent("pixnaria:lang", { detail: { lang } }));
  }

  function toggle() {
    setLang(lang === "en" ? "fr" : "en");
  }

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      node.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
      const key = node.dataset.i18nAria;
      node.setAttribute("aria-label", t(key));
    });
  }

  return { t, current, toggle, setLang, apply };
})();
