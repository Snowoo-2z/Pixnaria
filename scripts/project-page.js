const PixnariaProjectPage = (() => {
  let repoFullName = null;
  let projectData = null;
  let socialData = { configured: false, likes: 0, favorites: 0, views: 0, comments: [] };
  let running = false;
  let animationFrame = null;
  let pulse = 0;

  const $ = (selector) => document.querySelector(selector);

  function repoFromUrl() {
    return new URLSearchParams(location.search).get('repo');
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
  }

  function markdownSummary(text = '') {
    return text
      .replace(/^# .+$/m, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*_>`]/g, '')
      .trim()
      .slice(0, 900) || 'No description yet.';
  }

  function titleFromRepo(repo) {
    return projectData?.pixnaria?.project?.name
      || repo?.name?.replace(/^pixnaria-/i, '').split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
      || 'Pixnaria Project';
  }

  function setStatus(message, type = '') {
    const node = $('[data-project-status]');
    if (!node) return;
    node.textContent = message;
    node.className = `auth-status ${type}`.trim();
  }

  function sceneNodes() {
    return projectData?.pixnaria?.scene?.nodes || [];
  }

  function nodeGlobal(node, byId) {
    let x = Number(node.props?.x || 0);
    let y = Number(node.props?.y || 0);
    let parent = byId.get(node.parent);
    while (parent) {
      x += Number(parent.props?.x || 0);
      y += Number(parent.props?.y || 0);
      parent = byId.get(parent.parent);
    }
    return { x, y };
  }

  function drawRoundedRect(ctx, x, y, w, h, r = 12) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function drawPreview() {
    const canvas = $('[data-project-canvas]');
    if (!canvas || !projectData) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const settings = projectData.pixnaria.settings || {};
    const background = settings.background || '#090712';
    pulse += running ? 0.035 : 0;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255,255,255,.045)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

    const nodes = sceneNodes();
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const renderables = nodes.filter((node) => node.props?.visible !== false && !node.hidden);

    if (!renderables.length) {
      ctx.fillStyle = 'rgba(168,85,247,.22)';
      drawRoundedRect(ctx, width * 0.28, height * 0.36, width * 0.44, height * 0.22, 28);
      ctx.fill();
      ctx.fillStyle = '#f5f3ff';
      ctx.font = '700 28px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Empty Pixnaria scene', width / 2, height / 2);
      ctx.textAlign = 'start';
      return;
    }

    for (const node of renderables) {
      const type = node.type;
      const p = node.props || {};
      const pos = nodeGlobal(node, byId);
      const x = pos.x || 0;
      const y = pos.y || 0;

      if (type === 'Text' || type === 'Label') {
        ctx.fillStyle = p.color || '#f5f3ff';
        ctx.font = `700 ${Number(p.fontSize || 24)}px system-ui`;
        ctx.fillText(p.text || node.name, x, y);
        continue;
      }

      if (type === 'Collider' || type === 'PythonScript' || type === 'Behavior') continue;

      let w = Number(p.width || (type === 'Platform' ? 420 : 58));
      let h = Number(p.height || (type === 'Platform' ? 24 : 58));
      let color = p.color || (type === 'Player' ? '#a855f7' : type === 'Enemy' ? '#d946ef' : type === 'Platform' || node.name.toLowerCase().includes('ground') ? '#38bdf8' : '#7c3aed');

      if (type === 'Shape' && p.shape === 'Circle') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, Number(p.radius || 28) + Math.sin(pulse) * 3, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      const bob = running && (type === 'Player' || node.name === 'Player') ? Math.sin(pulse * 3) * 8 : 0;
      const gradient = ctx.createLinearGradient(x, y + bob, x + w, y + h + bob);
      gradient.addColorStop(0, type === 'Player' || node.name === 'Player' ? '#ffffff' : color);
      gradient.addColorStop(1, color);
      ctx.fillStyle = gradient;
      drawRoundedRect(ctx, x, y + bob, w, h, Math.min(16, h / 2));
      ctx.fill();
    }

    if (running) animationFrame = requestAnimationFrame(drawPreview);
  }

  async function loadProject() {
    repoFullName = repoFromUrl();
    if (!repoFullName) {
      setStatus('Open a project from Explore or My Projects.', 'error');
      document.querySelectorAll('[data-project-loaded]').forEach((node) => node.hidden = true);
      return;
    }

    setStatus('Loading project…');
    projectData = await api(`/api/github/project?repo=${encodeURIComponent(repoFullName)}`);
    await loadSocial();
    render();
    drawPreview();
    setStatus('Project loaded.', 'success');
  }

  async function loadSocial() {
    try { socialData = await api(`/api/supabase/project-social?repo=${encodeURIComponent(repoFullName)}`); }
    catch (error) { socialData = { configured: false, likes: 0, favorites: 0, views: 0, comments: [], error: error.message }; }
  }

  function render() {
    const repo = projectData.repo;
    const project = projectData.pixnaria.project || {};
    const title = titleFromRepo(repo);
    const description = project.description || repo.description || markdownSummary(projectData.pixnaria.readme);
    const author = project.author || repo.owner;

    document.querySelectorAll('[data-project-title]').forEach((node) => node.textContent = title);
    $('[data-project-author]').textContent = author;
    $('[data-project-author-link]').href = `/user/${encodeURIComponent(author)}`;
    $('[data-project-description]').textContent = description;
    $('[data-project-source]').href = repo.html_url;
    $('[data-inside]').href = `editor.html?repo=${encodeURIComponent(repo.full_name)}`;
    $('[data-project-likes]').textContent = socialData.likes || 0;
    $('[data-project-favorites]').textContent = socialData.favorites || 0;
    $('[data-project-views]').textContent = socialData.views || repo.stargazers_count || 0;

    const instructions = project.instructions || projectData.pixnaria.settings?.instructions || 'Press play to preview this Pixnaria scene. Use Look inside to inspect nodes and scripts.';
    $('[data-project-instructions]').textContent = instructions;

    renderFiles();
    renderCredits();
    renderComments();
  }

  function renderFiles() {
    const files = $('[data-project-files]');
    files.innerHTML = Object.entries(projectData.files).map(([key, exists]) => `
      <li class="clean-row"><span><strong>${key}</strong><small>${exists ? 'Available' : 'Missing'}</small></span><span class="pill ${exists ? 'pill--featured' : ''}">${exists ? 'OK' : '—'}</span></li>
    `).join('');
  }

  function renderCredits() {
    const list = $('[data-credits-list]');
    const credits = projectData.pixnaria.project?.credits || [];
    if (!credits.length) {
      list.innerHTML = `<li class="clean-row"><span><strong>${projectData.repo.owner}</strong><small>Project creator</small></span></li>`;
      return;
    }
    list.innerHTML = credits.map((credit) => `<li class="clean-row"><span><strong>${credit.name || credit}</strong><small>${credit.role || 'Contribution'}</small></span></li>`).join('');
  }

  function renderComments() {
    const list = $('[data-comment-list]');
    const note = $('[data-social-note]');
    if (note) note.textContent = socialData.configured ? 'Community comments' : 'Community features are not configured yet.';
    const comments = socialData.comments || [];
    list.innerHTML = comments.length ? comments.map((comment) => `
      <li class="comment-item"><span><strong>${comment.author || 'Pixnaria user'}</strong><small>${comment.content}</small></span><small>${new Date(comment.created_at).toLocaleDateString()}</small></li>
    `).join('') : `<li class="comment-item"><span><strong>No comments yet</strong><small>Be the first to comment.</small></span></li>`;
  }

  async function socialAction(action, extra = {}) {
    if (!repoFullName || !projectData) return;
    try {
      socialData = await api('/api/supabase/project-social', {
        method: 'POST',
        body: JSON.stringify({
          action,
          repo: repoFullName,
          title: titleFromRepo(projectData.repo),
          description: projectData.repo.description || '',
          ...extra
        })
      });
      render();
      setStatus('Saved.', 'success');
    } catch (error) { setStatus(error.message, 'error'); }
  }

  function bind() {
    $('[data-project-run]')?.addEventListener('click', () => {
      if (running) return;
      running = true;
      $('[data-project-runtime-status]').textContent = 'Running';
      drawPreview();
    });
    $('[data-project-stop]')?.addEventListener('click', () => {
      running = false;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      $('[data-project-runtime-status]').textContent = 'Stopped';
      drawPreview();
    });
    $('[data-like]')?.addEventListener('click', () => socialAction('like'));
    $('[data-favorite]')?.addEventListener('click', () => socialAction('favorite'));
    $('[data-report]')?.addEventListener('click', () => socialAction('report', { reason: 'Reported from project page' }));
    $('[data-comment-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = event.currentTarget.querySelector('input');
      const content = input.value.trim();
      if (!content) return;
      socialAction('comment', { content });
      input.value = '';
    });
  }

  function init() {
    if (!$('[data-project-page]')) return;
    bind();
    loadProject().catch((error) => setStatus(error.message, 'error'));
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', PixnariaProjectPage.init);
