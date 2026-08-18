/**
 * Pixnaria domain store — shared helpers built on top of the GitHub-backed
 * "GitDB" (see _gitdb.js). Every API route that used to talk to Supabase now
 * goes through here instead.
 */

const { decodeSession, parseCookies } = require('./_utils');
const gitdb = require('./_gitdb');

const ADMIN_LOGINS = ['snowoo-2z', 'snowoo'];

function isAdmin(login) {
  return ADMIN_LOGINS.includes(String(login || '').toLowerCase());
}

function sessionFromReq(req) {
  return decodeSession(parseCookies(req).pixnaria_session);
}

function sameUsername(a, b) {
  return String(a || '').toLowerCase() === String(b || '').toLowerCase();
}

// ---------------------------------------------------------------- profiles

async function findProfileByGithubId(githubId) {
  const { rows } = await gitdb.readTable('profiles');
  return rows.find((row) => String(row.github_id) === String(githubId)) || null;
}

async function findProfileByUsername(username) {
  const { rows } = await gitdb.readTable('profiles');
  return rows.find((row) => sameUsername(row.github_username, username)) || null;
}

async function findProfileById(id) {
  const { rows } = await gitdb.readTable('profiles');
  return rows.find((row) => row.id === id) || null;
}

function newProfileRow(github) {
  const admin = isAdmin(github.login);
  const now = gitdb.nowIso();
  return {
    id: gitdb.generateId('usr'),
    github_id: String(github.id),
    github_username: github.login,
    display_name: github.login,
    bio: admin ? 'Creator of Pixnaria' : '',
    avatar_url: github.avatar_url || null,
    role: admin ? 'creator' : 'user',
    badges: admin ? ['Creator', 'Admin'] : [],
    joined_at: now,
    updated_at: now
  };
}

async function getOrCreateProfile(session) {
  if (!session?.github) throw new Error('GitHub login required');
  const githubId = String(session.github.id);
  const existing = await findProfileByGithubId(githubId);
  if (existing) return existing;

  const row = newProfileRow(session.github);
  return gitdb.updateTable('profiles', (rows) => {
    const already = rows.find((r) => String(r.github_id) === githubId);
    if (already) return { skip: true, result: already };
    rows.push(row);
    return { rows, result: row };
  }, `Create profile for @${session.github.login}`);
}

async function requireProfile(req) {
  const session = sessionFromReq(req);
  return getOrCreateProfile(session);
}

async function requireAdminProfile(req) {
  const session = sessionFromReq(req);
  if (!session?.github || !isAdmin(session.github.login)) throw new Error('Admin access required');
  return getOrCreateProfile(session);
}

function profileDto(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.github_username,
    githubUsername: row.github_username,
    githubId: row.github_id,
    displayName: row.display_name,
    bio: row.bio || '',
    avatarData: row.avatar_url || null,
    avatarInitial: (row.display_name || row.github_username || '?').charAt(0).toUpperCase(),
    avatarColor: ['creator', 'admin'].includes(row.role) ? 'creator' : 'default',
    role: row.role,
    badges: row.badges || [],
    joinedAt: row.joined_at,
    githubConnected: true,
    githubProfileUrl: `https://github.com/${row.github_username}`
  };
}

async function updateProfile(profileId, patch) {
  return gitdb.updateTable('profiles', (rows) => {
    const index = rows.findIndex((row) => row.id === profileId);
    if (index === -1) throw new Error('Profile not found');
    rows[index] = { ...rows[index], ...patch, updated_at: gitdb.nowIso() };
    return { rows, result: rows[index] };
  }, `Update profile ${profileId}`);
}

// ---------------------------------------------------------------- projects

async function findProject(owner, repo) {
  const { rows } = await gitdb.readTable('projects');
  return rows.find((row) => sameUsername(row.github_owner, owner) && sameUsername(row.github_repo, repo)) || null;
}

async function findProjectById(id) {
  const { rows } = await gitdb.readTable('projects');
  return rows.find((row) => row.id === id) || null;
}

async function getOrCreateProject({ owner, repo, ownerId = null, title = null, description = '' }) {
  const existing = await findProject(owner, repo);
  if (existing) return existing;
  const now = gitdb.nowIso();
  const row = {
    id: gitdb.generateId('prj'),
    owner_id: ownerId,
    github_owner: owner,
    github_repo: repo,
    title: title || repo.replace(/^pixnaria-/i, '').replace(/-/g, ' ') || repo,
    description: description || '',
    visibility: 'public',
    featured: false,
    likes_count: 0,
    favorites_count: 0,
    views_count: 0,
    created_at: now,
    updated_at: now
  };
  return gitdb.updateTable('projects', (rows) => {
    const already = rows.find((r) => sameUsername(r.github_owner, owner) && sameUsername(r.github_repo, repo));
    if (already) return { skip: true, result: already };
    rows.push(row);
    return { rows, result: row };
  }, `Index project ${owner}/${repo}`);
}

async function upsertProject({ owner, repo, ownerId = null, title, description }) {
  const now = gitdb.nowIso();
  return gitdb.updateTable('projects', (rows) => {
    const index = rows.findIndex((r) => sameUsername(r.github_owner, owner) && sameUsername(r.github_repo, repo));
    if (index === -1) {
      const row = {
        id: gitdb.generateId('prj'),
        owner_id: ownerId,
        github_owner: owner,
        github_repo: repo,
        title: title || repo,
        description: description || '',
        visibility: 'public',
        featured: false,
        likes_count: 0,
        favorites_count: 0,
        views_count: 0,
        created_at: now,
        updated_at: now
      };
      rows.push(row);
      return { rows, result: row };
    }
    rows[index] = {
      ...rows[index],
      owner_id: ownerId ?? rows[index].owner_id,
      title: title ?? rows[index].title,
      description: description ?? rows[index].description,
      updated_at: now
    };
    return { rows, result: rows[index] };
  }, `Update project ${owner}/${repo}`);
}

async function patchProject(id, patch) {
  return gitdb.updateTable('projects', (rows) => {
    const index = rows.findIndex((row) => row.id === id);
    if (index === -1) throw new Error('Project not found');
    rows[index] = { ...rows[index], ...patch, updated_at: gitdb.nowIso() };
    return { rows, result: rows[index] };
  }, `Update project ${id}`);
}

function projectDto(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    author: row.github_owner,
    tag: row.featured ? 'Featured' : 'Project',
    description: row.description || 'Pixnaria project.',
    likes: row.likes_count || 0,
    favorites: row.favorites_count || 0,
    views: row.views_count || 0,
    color: row.featured ? 'magenta' : 'violet',
    featured: Boolean(row.featured),
    githubRepo: `${row.github_owner}/${row.github_repo}`,
    githubUrl: `https://github.com/${row.github_owner}/${row.github_repo}`,
    updatedAt: row.updated_at,
    createdAt: row.created_at
  };
}

// -------------------------------------------------------------- reactions

async function countReactions(table, projectId) {
  const { rows } = await gitdb.readTable(table);
  return rows.filter((row) => row.project_id === projectId).length;
}

async function toggleReaction(table, projectId, userId) {
  return gitdb.updateTable(table, (rows) => {
    const exists = rows.some((row) => row.project_id === projectId && row.user_id === userId);
    const next = exists
      ? rows.filter((row) => !(row.project_id === projectId && row.user_id === userId))
      : [...rows, { project_id: projectId, user_id: userId, created_at: gitdb.nowIso() }];
    return { rows: next, result: { active: !exists, count: next.filter((r) => r.project_id === projectId).length } };
  }, `Toggle ${table} on ${projectId}`);
}

// -------------------------------------------------------------- comments

async function listComments(projectId, limit = 30) {
  const { rows } = await gitdb.readTable('project_comments');
  return rows
    .filter((row) => row.project_id === projectId && !row.deleted)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

async function addComment({ projectId, userId, content }) {
  const row = {
    id: gitdb.generateId('cmt'),
    project_id: projectId,
    user_id: userId,
    content,
    created_at: gitdb.nowIso(),
    deleted: false
  };
  return gitdb.updateTable('project_comments', (rows) => {
    rows.push(row);
    return { rows, result: row };
  }, `Add comment on project ${projectId}`);
}

async function deleteComment(commentId, actorProfile) {
  return gitdb.updateTable('project_comments', (rows) => {
    const index = rows.findIndex((row) => row.id === commentId);
    if (index === -1) throw new Error('Comment not found');
    const owns = rows[index].user_id === actorProfile.id;
    const admin = isAdmin(actorProfile.github_username);
    if (!owns && !admin) throw new Error('You cannot delete this comment');
    rows[index] = { ...rows[index], deleted: true };
    return { rows, result: { ok: true } };
  }, `Delete comment ${commentId}`);
}

// -------------------------------------------------------------- reports & bans

async function createReport({ reporterId, targetType, targetId, reason }) {
  const row = {
    id: gitdb.generateId('rpt'),
    reporter_id: reporterId,
    target_type: targetType,
    target_id: targetId,
    reason: String(reason || '').slice(0, 240),
    status: 'open',
    created_at: gitdb.nowIso(),
    resolved_at: null,
    resolved_by: null
  };
  return gitdb.updateTable('reports', (rows) => {
    rows.push(row);
    return { rows, result: row };
  }, `New report on ${targetType}:${targetId}`);
}

async function resolveReport(reportId, status, resolvedBy) {
  return gitdb.updateTable('reports', (rows) => {
    const index = rows.findIndex((row) => row.id === reportId);
    if (index === -1) throw new Error('Report not found');
    rows[index] = { ...rows[index], status, resolved_at: gitdb.nowIso(), resolved_by: resolvedBy };
    return { rows, result: rows[index] };
  }, `Resolve report ${reportId}`);
}

async function activeBanFor(userId) {
  const { rows } = await gitdb.readTable('bans');
  const now = Date.now();
  return rows.find((row) => row.user_id === userId && row.active && (row.type === 'permanent' || !row.ends_at || new Date(row.ends_at).getTime() > now)) || null;
}

async function createBan({ userId, type, reason, endsAt, createdBy }) {
  const row = {
    id: gitdb.generateId('ban'),
    user_id: userId,
    type: type === 'permanent' ? 'permanent' : 'temporary',
    reason: String(reason || 'Rule violation').slice(0, 240),
    starts_at: gitdb.nowIso(),
    ends_at: type === 'permanent' ? null : (endsAt || new Date(Date.now() + 7 * 86400000).toISOString()),
    created_by: createdBy,
    active: true
  };
  return gitdb.updateTable('bans', (rows) => {
    rows.push(row);
    return { rows, result: row };
  }, `Ban user ${userId}`);
}

async function liftBan(userId) {
  return gitdb.updateTable('bans', (rows) => {
    const next = rows.map((row) => (row.user_id === userId && row.active ? { ...row, active: false } : row));
    return { rows: next, result: { ok: true } };
  }, `Unban user ${userId}`);
}

// -------------------------------------------------------------- news

async function listNews({ onlyPublished = true, onlyHome = false } = {}) {
  const { rows } = await gitdb.readTable('news');
  return rows
    .filter((row) => (!onlyPublished || row.published) && (!onlyHome || row.show_on_home !== false))
    .sort((a, b) => (Number(b.pinned) - Number(a.pinned)) || (new Date(b.created_at) - new Date(a.created_at)));
}

async function createNews(payload) {
  const row = {
    id: gitdb.generateId('news'),
    title_en: payload.titleEn || payload.title || 'Pixnaria update',
    title_fr: payload.titleFr || payload.title || 'Actualité Pixnaria',
    content_en: payload.contentEn || payload.content || '',
    content_fr: payload.contentFr || payload.content || '',
    category: payload.category || 'announcement',
    published: Boolean(payload.published),
    pinned: Boolean(payload.pinned),
    important: Boolean(payload.important),
    show_on_home: payload.showOnHome !== false,
    created_by: payload.createdBy,
    created_at: gitdb.nowIso()
  };
  return gitdb.updateTable('news', (rows) => {
    rows.push(row);
    return { rows, result: row };
  }, `Create news "${row.title_en}"`);
}

// -------------------------------------------------------------- studios

async function listStudioRows() {
  const { rows } = await gitdb.readTable('studios');
  return rows;
}

async function findStudio(id) {
  const { rows } = await gitdb.readTable('studios');
  return rows.find((row) => row.id === id) || null;
}

async function createStudio({ ownerId, name, description }) {
  const now = gitdb.nowIso();
  const studio = {
    id: gitdb.generateId('std'),
    owner_id: ownerId,
    name,
    description: description || '',
    icon_url: null,
    created_at: now,
    updated_at: now
  };
  await gitdb.updateTable('studios', (rows) => {
    rows.push(studio);
    return { rows, result: studio };
  }, `Create studio "${name}"`);
  await gitdb.updateTable('studio_members', (rows) => {
    rows.push({ studio_id: studio.id, user_id: ownerId, role: 'owner', joined_at: now });
    return { rows, result: null };
  }, `Add owner to studio ${studio.id}`);
  return studio;
}

async function studioMembers(studioId) {
  const { rows } = await gitdb.readTable('studio_members');
  return rows.filter((row) => row.studio_id === studioId).sort((a, b) => new Date(a.joined_at) - new Date(b.joined_at));
}

async function studioProjectLinks(studioId) {
  const { rows } = await gitdb.readTable('studio_projects');
  return rows.filter((row) => row.studio_id === studioId).sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
}

async function joinStudio(studioId, userId) {
  return gitdb.updateTable('studio_members', (rows) => {
    if (rows.some((row) => row.studio_id === studioId && row.user_id === userId)) return { skip: true, result: { ok: true } };
    rows.push({ studio_id: studioId, user_id: userId, role: 'member', joined_at: gitdb.nowIso() });
    return { rows, result: { ok: true } };
  }, `Join studio ${studioId}`);
}

async function leaveStudio(studioId, userId) {
  return gitdb.updateTable('studio_members', (rows) => {
    const next = rows.filter((row) => !(row.studio_id === studioId && row.user_id === userId));
    return { rows: next, result: { ok: true } };
  }, `Leave studio ${studioId}`);
}

async function addProjectToStudio(studioId, projectId) {
  return gitdb.updateTable('studio_projects', (rows) => {
    if (rows.some((row) => row.studio_id === studioId && row.project_id === projectId)) return { skip: true, result: { ok: true } };
    rows.push({ studio_id: studioId, project_id: projectId, added_at: gitdb.nowIso() });
    return { rows, result: { ok: true } };
  }, `Add project ${projectId} to studio ${studioId}`);
}

// -------------------------------------------------------------- wall messages (public profile messages)

async function listWallMessages(profileId, limit = 60) {
  const { rows } = await gitdb.readTable('wall_messages');
  return rows
    .filter((row) => row.profile_id === profileId && !row.deleted)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

async function postWallMessage({ profileId, authorId, content }) {
  const row = {
    id: gitdb.generateId('msg'),
    profile_id: profileId,
    author_id: authorId,
    content,
    created_at: gitdb.nowIso(),
    deleted: false
  };
  return gitdb.updateTable('wall_messages', (rows) => {
    rows.push(row);
    return { rows, result: row };
  }, `New wall message on profile ${profileId}`);
}

async function deleteWallMessage(messageId, actorProfile) {
  return gitdb.updateTable('wall_messages', (rows) => {
    const index = rows.findIndex((row) => row.id === messageId);
    if (index === -1) throw new Error('Message not found');
    const owns = rows[index].author_id === actorProfile.id || rows[index].profile_id === actorProfile.id;
    const admin = isAdmin(actorProfile.github_username);
    if (!owns && !admin) throw new Error('You cannot delete this message');
    rows[index] = { ...rows[index], deleted: true };
    return { rows, result: { ok: true } };
  }, `Delete wall message ${messageId}`);
}

async function listAllProfilesById(ids) {
  const { rows } = await gitdb.readTable('profiles');
  const set = new Set(ids);
  return rows.filter((row) => set.has(row.id));
}

module.exports = {
  isAdmin,
  sessionFromReq,
  sameUsername,
  findProfileByGithubId,
  findProfileByUsername,
  findProfileById,
  getOrCreateProfile,
  requireProfile,
  requireAdminProfile,
  profileDto,
  updateProfile,
  findProject,
  findProjectById,
  getOrCreateProject,
  upsertProject,
  patchProject,
  projectDto,
  countReactions,
  toggleReaction,
  listComments,
  addComment,
  deleteComment,
  createReport,
  resolveReport,
  activeBanFor,
  createBan,
  liftBan,
  listNews,
  createNews,
  listStudioRows,
  findStudio,
  createStudio,
  studioMembers,
  studioProjectLinks,
  joinStudio,
  leaveStudio,
  addProjectToStudio,
  listWallMessages,
  postWallMessage,
  deleteWallMessage,
  listAllProfilesById,
  gitdb
};
