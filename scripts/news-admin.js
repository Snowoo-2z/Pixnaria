const PixnariaNewsAdmin = (() => {
  const STORAGE_KEY = "pixnaria_demo_news";

  function getNews() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(PIXNARIA_DEFAULT_NEWS);
    try {
      return JSON.parse(saved);
    } catch {
      return structuredClone(PIXNARIA_DEFAULT_NEWS);
    }
  }

  function saveNews(news) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(news));
  }

  function resetNews() {
    localStorage.removeItem(STORAGE_KEY);
    document.dispatchEvent(new CustomEvent("pixnaria:news-updated"));
  }

  function addNews(payload) {
    const news = getNews();
    news.unshift({
      id: `news_${Date.now()}`,
      category: payload.category || "announcement",
      title: {
        en: payload.title,
        fr: payload.title
      },
      content: {
        en: payload.content,
        fr: payload.content
      },
      date: new Date().toISOString().slice(0, 10),
      pinned: payload.pinned,
      important: payload.important,
      published: true
    });
    saveNews(news);
    document.dispatchEvent(new CustomEvent("pixnaria:news-updated"));
  }

  function removeNews(id) {
    const news = getNews().filter((item) => item.id !== id);
    saveNews(news);
    document.dispatchEvent(new CustomEvent("pixnaria:news-updated"));
  }

  function init() {
    const openButton = document.querySelector("[data-open-news-admin]");
    const dialog = document.querySelector("[data-news-dialog]");
    const closeButtons = document.querySelectorAll("[data-close-news-admin]");
    const form = document.querySelector("[data-news-form]");
    const resetButton = document.querySelector("[data-reset-news]");

    if (openButton && dialog) {
      openButton.addEventListener("click", () => {
        dialog.showModal();
      });
    }

    closeButtons.forEach((button) => {
      button.addEventListener("click", () => dialog?.close());
    });

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const title = String(formData.get("title") || "").trim();
        const content = String(formData.get("content") || "").trim();
        if (!title || !content) return;
        addNews({
          title,
          content,
          category: String(formData.get("category") || "announcement"),
          pinned: formData.get("pinned") === "on",
          important: formData.get("important") === "on"
        });
        form.reset();
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", resetNews);
    }
  }

  return { getNews, addNews, removeNews, resetNews, init };
})();
