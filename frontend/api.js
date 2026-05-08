// ── CONFIG ──────────────────────────────────────────────
const BASE = 'http://127.0.0.1:5000/api';

// ── API HELPER ──────────────────────────────────────────
async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || 'Request failed');
  return json;
}

const GET    = (p)    => api('GET',    p);
const POST   = (p, b) => api('POST',   p, b);
const PATCH  = (p, b) => api('PATCH',  p, b);

// ── SESSION ─────────────────────────────────────────────
const Session = {
  save(role, user) {
    localStorage.setItem('sh_role', role);
    localStorage.setItem('sh_user', JSON.stringify(user));
  },
  get() {
    return {
      role: localStorage.getItem('sh_role'),
      user: JSON.parse(localStorage.getItem('sh_user') || 'null'),
    };
  },
  clear() {
    localStorage.removeItem('sh_role');
    localStorage.removeItem('sh_user');
  },
  require(role) {
    const s = Session.get();
    if (!s.user || (role && s.role !== role)) {
      window.location.href = 'index.html';
    }
    return s;
  },
};

// ── LOGOUT ──────────────────────────────────────────────
function logout() {
  Session.clear();
  window.location.href = 'index.html';
}

// ── ALERT ───────────────────────────────────────────────
function alert_(id, msg, type = 'e') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert a${type}`;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 4500);
}

// ── BADGES ──────────────────────────────────────────────
function sBadge(s) {
  const m = { Pending:'bp', Assigned:'ba', 'In Progress':'bi', Resolved:'br' };
  return `<span class="badge ${m[s]||''}">${s}</span>`;
}
function pBadge(p) {
  const m = { High:'bh', Medium:'bm', Low:'bl' };
  return `<span class="badge ${m[p]||''}">${p}</span>`;
}
function mBadge(s) {
  const m = { Available:'bav', 'In Use':'biu', Maintenance:'bmt' };
  return `<span class="badge ${m[s]||''}">${s}</span>`;
}

// ── DATE ────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}
function fmtTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}

// ── LOADING ─────────────────────────────────────────────
function setLoading(btnId, yes) {
  const b = document.getElementById(btnId);
  if (!b) return;
  b.disabled = yes;
  b.textContent = yes ? '...' : b.dataset.label;
}