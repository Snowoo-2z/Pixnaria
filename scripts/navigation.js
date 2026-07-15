function initNavigation() {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const profileButton = document.querySelector("[data-profile-button]");
  const profileMenu = document.querySelector("[data-profile-menu]");
  const languageButton = document.querySelector("[data-language-toggle]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  if (profileButton && profileMenu) {
    profileButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = profileMenu.classList.toggle("is-open");
      profileButton.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", (event) => {
      if (!profileMenu.contains(event.target) && !profileButton.contains(event.target)) {
        profileMenu.classList.remove("is-open");
        profileButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.querySelectorAll("[data-language-toggle]").forEach((button) => {
    button.addEventListener("click", () => PixnariaI18n.toggle());
    document.addEventListener("pixnaria:lang", () => {
      button.textContent = PixnariaI18n.t("language");
    });
    button.textContent = PixnariaI18n.t("language");
  });
}
