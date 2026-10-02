/* Enlace UTM — genera enlaces etiquetados en el navegador, sin servidor. */
(function (global) {
  'use strict';

  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const AUTOTAG_KEYS = ['gclid', 'gbraid', 'wbraid', 'dclid', 'gclsrc', 'fbclid', 'ttclid', 'msclkid', 'li_fat_id', 'twclid'];
  const CHAT_HOSTS = ['wa.me', 'whatsapp.com', 't.me', 'telegram.me', 'm.me', 'ig.me'];
  const PAID_MEDIUMS = ['paid_social', 'paid_video', 'cpc', 'display'];
  // Medios que la agrupación de canales por defecto de Google Analytics ya reconoce.
  const KNOWN_MEDIUMS = ['social', 'paid_social', 'video', 'paid_video', 'email', 'sms', 'cpc', 'display', 'referral'];
  const ACCESS_CLASS = { 'Enlace web': 'web', 'Condicionado': 'condicionado', 'Ruta indirecta': 'indirecta' };

  /* ---------- Lógica pura (se prueba en pruebas/logica.test.mjs) ---------- */

  // Minúsculas, sin tildes y guion bajo entre palabras. Solo para valores UTM.
  function normalizeUtm(value) {
    return String(value == null ? '' : value)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function personalDataIn(value) {
    const s = String(value || '');
    if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(s)) return 'un correo electrónico';
    if (/\+\d[\d\s().-]{6,}\d/.test(s) || /\d{3}[\s.-]\d{3}[\s.-]?\d{3,4}/.test(s) || /\d{10,}/.test(s)) return 'un número de teléfono';
    return null;
  }

  function safeDecode(s) {
    try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch (e) { return s; }
  }

  function parseDestination(raw) {
    const s = String(raw == null ? '' : raw).trim();
    if (!s) return { error: 'Escribe la URL de destino.' };
    if (/\s/.test(s)) return { error: 'La URL no puede contener espacios.' };
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(s);
    if (scheme && !/^https?$/i.test(scheme[1])) {
      return { error: 'Esquema no permitido (' + scheme[1].toLowerCase() + ':). Usa una URL que empiece por http:// o https://.' };
    }
    if (!/^https?:\/\//i.test(s)) return { error: 'Añade el protocolo: la URL debe empezar por https:// o http://.' };
    let parsed;
    try { parsed = new URL(s); } catch (e) { return { error: 'La URL no es válida. Revisa que esté completa.' }; }
    if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || !parsed.hostname) {
      return { error: 'La URL no es válida. Revisa que esté completa.' };
    }
    return { url: s, parsed: parsed };
  }

  // Sustituye las UTMs sin tocar el resto: los demás parámetros y el fragmento
  // se copian tal cual del texto original, para no recodificarlos.
  function buildUrl(raw, utms) {
    const dest = parseDestination(raw);
    if (dest.error) return { error: dest.error };
    const s = dest.url;
    const hashAt = s.indexOf('#');
    const beforeHash = hashAt === -1 ? s : s.slice(0, hashAt);
    const hash = hashAt === -1 ? '' : s.slice(hashAt);
    const queryAt = beforeHash.indexOf('?');
    const base = queryAt === -1 ? beforeHash : beforeHash.slice(0, queryAt);
    const query = queryAt === -1 ? '' : beforeHash.slice(queryAt + 1);

    const kept = [];
    const replaced = [];
    query.split('&').forEach(function (segment) {
      if (!segment) return;
      const key = safeDecode(segment.split('=')[0]).trim().toLowerCase();
      if (UTM_KEYS.indexOf(key) !== -1) replaced.push(safeDecode(segment));
      else kept.push(segment);
    });

    const params = new URLSearchParams();
    UTM_KEYS.forEach(function (k) { if (utms[k]) params.set(k, utms[k]); });
    const qs = kept.concat(params.toString() ? [params.toString()] : []).join('&');
    const url = base + (qs ? '?' + qs : '') + hash;

    // Comprobación final con URL + URLSearchParams: una sola aparición de cada UTM.
    const check = new URL(url);
    const searchParams = check.searchParams;
    const autotags = AUTOTAG_KEYS.filter(function (k) { return searchParams.has(k); });
    return { url: url, replaced: replaced, autotags: autotags, hostname: check.hostname.toLowerCase() };
  }

  function isChatHost(hostname) {
    return CHAT_HOSTS.some(function (h) { return hostname === h || hostname.endsWith('.' + h); });
  }

  function contentBase(preset) {
    return String(preset.utm_content || preset.placement || '').replace(/_\d+$/, '');
  }

  function defaultPiece(preset) {
    const m = /_(\d+)$/.exec(preset.utm_content || '');
    return m ? m[1] : '01';
  }

  // Rutas que reutilizan el enlace de la bio o del perfil: su utm_content no es su ubicación.
  function usesSharedLink(preset) {
    return contentBase(preset) !== preset.placement;
  }

  function composeContent(preset, piece, ctaSuffix) {
    return [contentBase(preset), normalizeUtm(piece), normalizeUtm(ctaSuffix)].filter(Boolean).join('_');
  }

  // Bio y perfil son enlaces compartidos: conservan su número, no el de la pieza.
  function keepsOwnNumber(preset) {
    return usesSharedLink(preset) || preset.placement === 'bio' || preset.placement === 'perfil';
  }

  function contentFor(preset, piece, ctaSuffix) {
    return keepsOwnNumber(preset)
      ? composeContent(preset, defaultPiece(preset), '')
      : composeContent(preset, piece, ctaSuffix);
  }

  function buildCatalog(base, custom) {
    const groups = base.groups.map(function (g) { return Object.assign({}, g, { presets: g.presets.slice() }); });
    (custom || []).forEach(function (p) {
      let g = groups.find(function (x) { return x.name === p.group; });
      if (!g) {
        g = { name: p.group, source: p.utm_source, medium: p.utm_medium, note: 'Canal personalizado. Las etiquetas son una convención de tu negocio.', custom: true, presets: [] };
        groups.push(g);
      }
      g.presets.push(p);
    });
    return groups;
  }

  function contextNotes(preset, medium, ctaId) {
    const notes = [];
    if (usesSharedLink(preset)) {
      notes.push('Esta ruta usa el enlace compartido (' + contentBase(preset) + '). No distingue qué pieza previa llevó a la persona hasta allí. Para atribución por pieza necesitas una ruta dedicada, por ejemplo un enlace propio enviado por DM.');
    }
    if (PAID_MEDIUMS.indexOf(medium) !== -1) {
      notes.push('Si la plataforma añade autoetiquetado (gclid, fbclid, ttclid, msclkid…), no lo reemplaces: estas UTMs no lo sustituyen.');
    }
    if (medium && KNOWN_MEDIUMS.indexOf(medium) === -1) {
      notes.push('El medio «' + medium + '» puede requerir una agrupación de canales personalizada en tu analítica.');
    }
    if (ctaId === 'whatsapp' || ctaId === 'grupo') {
      notes.push('Un botón que abre un chat o un grupo no garantiza que la UTM llegue a tu CRM. Lo que se mide es la visita a la URL web etiquetada.');
    }
    return notes;
  }

  function csvCell(value) {
    let s = value == null ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",;\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  const CSV_COLUMNS = [
    ['fecha', 'fecha'], ['negocio', 'negocio'], ['enlace', 'enlace'], ['url_destino', 'destino'],
    ['utm_source', 'utm_source'], ['utm_medium', 'utm_medium'], ['utm_campaign', 'utm_campaign'],
    ['utm_content', 'utm_content'], ['utm_term', 'utm_term'], ['plataforma', 'plataforma'],
    ['ubicacion', 'ubicacion'], ['pieza', 'pieza'], ['accion_cta', 'cta'], ['acceso', 'acceso']
  ];

  function toCsv(entries) {
    const lines = [CSV_COLUMNS.map(function (c) { return c[0]; }).join(',')];
    entries.forEach(function (e) {
      lines.push(CSV_COLUMNS.map(function (c) { return csvCell(e[c[1]]); }).join(','));
    });
    return lines.join('\r\n');
  }

  const logic = {
    UTM_KEYS: UTM_KEYS, normalizeUtm: normalizeUtm, personalDataIn: personalDataIn, parseDestination: parseDestination,
    buildUrl: buildUrl, isChatHost: isChatHost, contentBase: contentBase, defaultPiece: defaultPiece,
    usesSharedLink: usesSharedLink, composeContent: composeContent, buildCatalog: buildCatalog,
    contextNotes: contextNotes, toCsv: toCsv, keepsOwnNumber: keepsOwnNumber, contentFor: contentFor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = logic;
  global.EnlaceUTM = logic;
  if (typeof document === 'undefined') return;

  /* ---------- Almacenamiento local ---------- */

  const KEYS = { historial: 'enlaceUtm.historial.v1', plantillas: 'enlaceUtm.plantillas.v1', negocio: 'enlaceUtm.negocio.v1' };

  const store = (function () {
    let ok = true;
    try { localStorage.setItem('enlaceUtm.prueba', '1'); localStorage.removeItem('enlaceUtm.prueba'); } catch (e) { ok = false; }
    return {
      ok: ok,
      get: function (key, fallback) {
        if (!ok) return fallback;
        try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
      },
      set: function (key, value) {
        if (!ok) return false;
        try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
      }
    };
  })();

  /* ---------- Interfaz ---------- */

  const $ = function (id) { return document.getElementById(id); };

  function el(tag, attrs) {
    const node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (k === 'class') node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    for (let i = 2; i < arguments.length; i++) {
      const child = arguments[i];
      if (child == null || child === false) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  function badge(access, custom) {
    const frag = document.createDocumentFragment();
    frag.appendChild(el('span', { class: 'insignia insignia--' + (ACCESS_CLASS[access] || 'condicionado'), text: access }));
    if (custom) { frag.appendChild(document.createTextNode(' ')); frag.appendChild(el('span', { class: 'insignia insignia--propia', text: 'Plantilla propia' })); }
    return frag;
  }

  const BASE = global.CATALOGO_UTM;
  let customPresets = store.get(KEYS.plantillas, []);
  let groups = buildCatalog(BASE, customPresets);
  let history = store.get(KEYS.historial, []);
  let selected = [];   // ids de las ubicaciones elegidas, en el orden del catálogo
  let rows = {};       // id → { source, medium, content, editable }
  let results = null;  // enlaces generados y vigentes

  function findPreset(id) {
    for (const g of groups) { const p = g.presets.find(function (x) { return x.id === id; }); if (p) return { group: g, preset: p }; }
    return null;
  }
  function presetLabel(f) { return f.group.name + ' · ' + f.preset.label; }
  function ctaById(id) { return BASE.ctas.find(function (c) { return c.id === id; }); }
  function ctaId() {
    const v = $('cta').value;
    return v === 'otro' ? normalizeUtm($('cta-otro').value) : v;
  }
  function ctaLabel() {
    const v = $('cta').value;
    if (!v) return '';
    if (v === 'otro') return $('cta-otro').value.trim() ? 'Otro CTA: ' + $('cta-otro').value.trim() : 'Otro CTA';
    return ctaById(v).label;
  }
  function slug(id) { return id.replace(/[^a-zA-Z0-9_-]/g, '_'); }

  /* --- Selector múltiple --- */

  function catalogOrder(ids) {
    const order = [];
    groups.forEach(function (g) { g.presets.forEach(function (p) { if (ids.indexOf(p.id) !== -1) order.push(p.id); }); });
    return order;
  }

  function setSelection(ids) {
    const next = catalogOrder(ids);
    next.forEach(function (id) {
      if (!rows[id]) {
        const p = findPreset(id).preset;
        rows[id] = { source: p.utm_source, medium: p.utm_medium, content: '', editable: p.placement === 'personalizado' || !!p.custom };
      }
    });
    Object.keys(rows).forEach(function (id) { if (next.indexOf(id) === -1) delete rows[id]; });
    selected = next;
    recomputeContents();
    $('confirmar').checked = false;
    syncSelectionUI();
    renderRows();
    renderConditions();
    refresh();
  }

  function toggle(id, on) {
    const ids = selected.filter(function (x) { return x !== id; });
    if (on) ids.push(id);
    setSelection(ids);
  }

  function renderPicker() {
    const box = $('ubic-grupos');
    const q = normalizeUtm($('ubic-buscar').value).replace(/_/g, ' ');
    box.textContent = '';
    let shown = 0;
    groups.forEach(function (g, gi) {
      const matches = g.presets.filter(function (p) {
        if (!q) return true;
        const hay = normalizeUtm(g.name + ' ' + p.label + ' ' + p.placement).replace(/_/g, ' ');
        return q.split(' ').every(function (w) { return hay.indexOf(w) !== -1; });
      });
      if (!matches.length) return;
      shown += matches.length;
      const chosen = g.presets.filter(function (p) { return selected.indexOf(p.id) !== -1; }).length;
      const details = el('details', { class: 'grupo-ubic', 'data-grupo': g.name });
      if (q || chosen) details.open = true;
      details.appendChild(el('summary', {}, el('span', { text: g.name }),
        el('span', { class: 'cuenta', text: chosen ? chosen + ' de ' + g.presets.length : String(g.presets.length) })));
      const list = el('ul');
      if (!q) {
        const allId = 'todas-' + gi;
        const all = el('input', { type: 'checkbox', id: allId });
        all.checked = chosen === g.presets.length;
        all.indeterminate = chosen > 0 && chosen < g.presets.length;
        all.addEventListener('change', function () {
          const others = selected.filter(function (id) { return !g.presets.some(function (p) { return p.id === id; }); });
          setSelection(all.checked ? others.concat(g.presets.map(function (p) { return p.id; })) : others);
          focusAfterRender(allId);
        });
        list.appendChild(el('li', { class: 'opcion opcion--todas' }, all, el('label', { for: allId, text: 'Todas las de ' + g.name })));
      }
      matches.forEach(function (p) {
        const id = 'op-' + slug(p.id);
        const check = el('input', { type: 'checkbox', id: id, value: p.id });
        check.checked = selected.indexOf(p.id) !== -1;
        check.addEventListener('change', function () { toggle(p.id, check.checked); focusAfterRender(id); });
        const label = el('label', { for: id }, p.label + (p.custom ? ' · propia' : ''));
        label.appendChild(badge(p.access, false));
        list.appendChild(el('li', { class: 'opcion' }, check, label));
      });
      details.appendChild(list);
      box.appendChild(details);
    });
    if (!shown) box.appendChild(el('p', { class: 'sin-resultados', text: 'Ninguna ubicación coincide con la búsqueda.' }));
  }

  // Al volver a pintar el panel se pierde el foco: lo devolvemos a la misma casilla.
  function focusAfterRender(id) {
    const node = $(id);
    if (node) node.focus();
  }

  function syncSelectionUI() {
    const n = selected.length;
    $('ubic-boton-texto').textContent = n === 0 ? 'Elegir plataformas y ubicaciones'
      : n === 1 ? presetLabel(findPreset(selected[0]))
      : n + ' ubicaciones elegidas';
    if (n) { $('ubic-boton').removeAttribute('aria-invalid'); $('ubic-error').hidden = true; }
    if (!$('ubic-panel').hidden) {
      const scroll = $('ubic-grupos').scrollTop;
      renderPicker();
      $('ubic-grupos').scrollTop = scroll;
    }
    const chips = $('ubic-chips');
    chips.textContent = '';
    selected.forEach(function (id) {
      const f = findPreset(id);
      const remove = el('button', { type: 'button', 'aria-label': 'Quitar ' + presetLabel(f), text: '×' });
      remove.addEventListener('click', function () {
        const i = selected.indexOf(id);
        toggle(id, false);
        const left = $('ubic-chips').querySelectorAll('button');
        (left[Math.min(i, left.length - 1)] || $('ubic-boton')).focus();
      });
      chips.appendChild(el('li', {}, el('span', { text: presetLabel(f) }), remove));
    });
  }

  function openPicker(open) {
    $('ubic-panel').hidden = !open;
    $('ubic-boton').setAttribute('aria-expanded', String(open));
    if (open) { renderPicker(); $('ubic-buscar').focus(); }
  }

  /* --- Filas de parámetros, una por ubicación --- */

  function recomputeContents() {
    const suffix = $('cta-sufijo').checked ? ctaId() : '';
    selected.forEach(function (id) { rows[id].content = contentFor(findPreset(id).preset, $('pieza').value, suffix); });
  }

  function renderRows() {
    const box = $('filas');
    box.textContent = '';
    if (!selected.length) {
      box.appendChild(el('p', { class: 'vacio', text: 'Elige al menos una ubicación en el paso 2.' }));
      return;
    }
    selected.forEach(function (id) {
      const f = findPreset(id);
      const r = rows[id];
      const s = slug(id);
      const input = function (key, label, required) {
        const inputId = key + '-' + s;
        const node = el('input', { id: inputId, type: 'text', spellcheck: 'false', 'data-utm': '', 'data-fila': id, 'data-clave': key, 'aria-describedby': inputId + '-error' });
        node.value = r[key];
        if (key !== 'content' && !r.editable) node.readOnly = true;
        node.addEventListener('input', function () { r[key] = node.value; if (key === 'medium') renderConditions(); refresh(); });
        node.addEventListener('blur', function () {
          if (personalDataIn(node.value)) return;
          const v = normalizeUtm(node.value);
          if (v !== node.value) { node.value = v; r[key] = v; renderPreview(); }
        });
        return el('div', { class: 'campo' },
          el('label', { for: inputId }, label, required ? el('span', { class: 'obligatorio', text: 'obligatorio' }) : null),
          node,
          el('p', { class: 'error', id: inputId + '-error', hidden: '' }));
      };
      const edit = el('button', { type: 'button', class: 'boton boton--secundario boton--chico', text: r.editable ? 'Usar plantilla' : 'Editar fuente y medio' });
      edit.addEventListener('click', function () {
        if (r.editable) { r.source = f.preset.utm_source; r.medium = f.preset.utm_medium; }
        r.editable = !r.editable;
        renderRows();
        renderConditions();
        refresh();
        const target = $((r.editable ? 'source-' : 'edit-') + s);
        if (target) target.focus();
      });
      edit.id = 'edit-' + s;
      box.appendChild(el('fieldset', { class: 'fila' },
        el('legend', { text: presetLabel(f) }),
        el('div', { class: 'tres' }, input('source', 'utm_source', true), input('medium', 'utm_medium', true), input('content', 'utm_content', false)),
        el('div', { class: 'fila-acciones' }, edit)));
    });
  }

  function renderConditions() {
    const box = $('condiciones');
    box.textContent = '';
    box.hidden = !selected.length;
    if (!selected.length) { $('confirmar-campo').hidden = true; return; }
    const list = el('ul');
    const notes = [];
    const groupNotes = [];
    selected.forEach(function (id) {
      const f = findPreset(id);
      const p = f.preset;
      const title = el('p', { class: 'condiciones-titulo' });
      title.appendChild(badge(p.access, p.custom));
      title.appendChild(el('strong', { text: presetLabel(f) }));
      list.appendChild(el('li', {}, title, p.detail ? el('p', { text: p.detail }) : null));
      if (f.group.note && groupNotes.indexOf(f.group) === -1) groupNotes.push(f.group);
      contextNotes(p, normalizeUtm(rows[id].medium), $('cta').value).forEach(function (n) {
        const text = usesSharedLink(p) ? presetLabel(f) + ': ' + n : n;
        if (notes.indexOf(text) === -1) notes.push(text);
      });
    });
    if (selected.length > 4) {
      const count = function (a) { return selected.filter(function (id) { return findPreset(id).preset.access === a; }).length; };
      const parts = [['Enlace web', 'con enlace web'], ['Condicionado', 'condicionadas'], ['Ruta indirecta', 'de ruta indirecta']]
        .map(function (a) { const n = count(a[0]); return n ? n + ' ' + a[1] : ''; }).filter(Boolean);
      box.appendChild(el('details', {}, el('summary', { text: 'Condiciones de las ' + selected.length + ' ubicaciones: ' + parts.join(', ') }), list));
    } else {
      box.appendChild(list);
    }
    groupNotes.forEach(function (g) { box.appendChild(el('p', { class: 'grupo-nota', text: g.name + ': ' + g.note })); });
    notes.forEach(function (n) { box.appendChild(el('p', { class: 'alerta', text: n })); });
    $('confirmar-campo').hidden = selected.every(function (id) { return findPreset(id).preset.access === 'Enlace web'; });
  }

  function renderPreview() {
    const body = $('vista-previa');
    body.textContent = '';
    const camp = normalizeUtm($('campana').value);
    const term = normalizeUtm($('term').value);
    const row = function (k, v, cls) { body.appendChild(el('tr', cls ? { class: cls } : {}, el('th', { scope: 'row' }, el('code', { text: k })), v)); };
    row('utm_campaign', camp ? el('td', {}, el('code', { text: camp })) : el('td', { class: 'falta', text: 'Falta (obligatorio)' }));
    row('utm_term', term ? el('td', {}, el('code', { text: term })) : el('td', { class: 'vacio-valor', text: 'Vacío: no se añade' }));
    if (!selected.length) {
      body.appendChild(el('tr', {}, el('th', { scope: 'row', text: 'Ubicaciones' }), el('td', { class: 'falta', text: 'Elige al menos una' })));
    }
    selected.forEach(function (id) {
      const f = findPreset(id);
      const r = rows[id];
      const vals = [normalizeUtm(r.source) || '—', normalizeUtm(r.medium) || '—', normalizeUtm(r.content) || '(sin content)'];
      body.appendChild(el('tr', {},
        el('th', { scope: 'row', text: f.preset.label }),
        el('td', {}, el('code', { text: vals.join(' · ') }))));
    });
    body.appendChild(el('tr', { class: 'meta' },
      el('th', { scope: 'row', text: 'Acción del CTA' }),
      el('td', { text: (ctaLabel() || 'Sin especificar') + ' · metadato, no va en la URL' + ($('cta-sufijo').checked ? ' salvo en utm_content' : '') })));
  }

  function setStatus(node, text, kind) {
    node.textContent = text;
    node.className = 'estado' + (kind ? ' estado--' + kind : '');
  }

  function invalidate() {
    if (!results) return;
    results = null;
    $('copiar').disabled = true;
    $('guardar').disabled = true;
    $('resultados').textContent = '';
    $('resultados-vacio').hidden = false;
    $('resultados-vacio').textContent = 'Cambiaste datos: vuelve a generar los enlaces.';
    $('avisos').textContent = '';
    setStatus($('estado'), '', null);
  }

  function refresh() {
    renderPreview();
    invalidate();
  }

  function showFieldError(id, message) {
    const input = $(id);
    const msg = $(id + '-error');
    if (!input) return;
    if (message) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    if (msg) { msg.textContent = message || ''; msg.hidden = !message; }
  }

  function clearErrors() {
    document.querySelectorAll('#formulario [aria-invalid]').forEach(function (n) { n.removeAttribute('aria-invalid'); });
    document.querySelectorAll('#formulario .error').forEach(function (n) { n.hidden = true; n.textContent = ''; });
    $('errores').hidden = true;
    $('errores').textContent = '';
  }

  function showErrorSummary(container, errors) {
    container.textContent = '';
    container.appendChild(el('p', { text: errors.length === 1 ? 'Falta corregir 1 cosa:' : 'Falta corregir ' + errors.length + ' cosas:' }));
    const list = el('ul');
    errors.forEach(function (e) {
      const link = el('a', { href: '#' + e.id, text: e.message });
      link.addEventListener('click', function (ev) { ev.preventDefault(); $(e.id).focus(); });
      list.appendChild(el('li', {}, link));
    });
    container.appendChild(list);
    container.hidden = false;
    container.focus();
  }

  function validate() {
    clearErrors();
    const errors = [];
    const add = function (id, message) { errors.push({ id: id, message: message }); showFieldError(id, message); };

    const dest = parseDestination($('url').value);
    if (dest.error) add('url', dest.error);

    const kindIn = function (id, what) {
      const kind = personalDataIn($(id).value);
      if (kind) add(id, 'Quita ' + kind + ' de ' + what + ': las UTMs no llevan datos personales.');
      return !!kind;
    };
    if (!kindIn('campana', 'la campaña') && !normalizeUtm($('campana').value)) add('campana', 'Escribe el nombre de la campaña.');
    kindIn('term', 'la palabra clave');
    kindIn('pieza', 'la pieza');
    kindIn('cta-otro', 'el identificador del CTA');

    if (!selected.length) {
      errors.push({ id: 'ubic-boton', message: 'Elige al menos una ubicación.' });
      $('ubic-boton').setAttribute('aria-invalid', 'true');
      $('ubic-error').textContent = 'Elige al menos una ubicación.';
      $('ubic-error').hidden = false;
    }
    selected.forEach(function (id) {
      const s = slug(id);
      const label = findPreset(id).preset.label;
      const r = rows[id];
      [['source', 'la fuente'], ['medium', 'el medio'], ['content', 'el contenido']].forEach(function (pair) {
        const kind = personalDataIn(r[pair[0]]);
        if (kind) add(pair[0] + '-' + s, label + ': quita ' + kind + ' de ' + pair[1] + '.');
        else if (pair[0] !== 'content' && !normalizeUtm(r[pair[0]])) add(pair[0] + '-' + s, label + ': ' + pair[1] + ' es obligatorio.');
      });
      const src = normalizeUtm(r.source);
      if (src && BASE.ctas.some(function (c) { return c.id === src && c.id !== 'whatsapp'; })) {
        add('source-' + s, label + ': «' + src + '» es una acción del CTA, no una fuente. Usa la plataforma.');
      }
    });
    if ($('cta').value === 'otro' && $('cta-sufijo').checked && !normalizeUtm($('cta-otro').value)) {
      add('cta-otro', 'Escribe el identificador del CTA o desmarca «Añadir el CTA».');
    }
    if (!$('confirmar-campo').hidden && !$('confirmar').checked) {
      errors.push({ id: 'confirmar', message: 'Confirma que revisaste las condiciones de las ubicaciones elegidas.' });
    }
    return errors;
  }

  function normalizeAllUtmFields() {
    ['campana', 'pieza', 'term', 'cta-otro'].forEach(function (id) {
      const input = $(id);
      if (!personalDataIn(input.value)) input.value = normalizeUtm(input.value);
    });
    selected.forEach(function (id) {
      ['source', 'medium', 'content'].forEach(function (k) {
        if (!personalDataIn(rows[id][k])) rows[id][k] = normalizeUtm(rows[id][k]);
      });
    });
    renderRows();
  }

  function generate(ev) {
    ev.preventDefault();
    normalizeAllUtmFields();
    const errors = validate();
    if (errors.length) {
      invalidate();
      showErrorSummary($('errores'), errors);
      return;
    }
    const camp = normalizeUtm($('campana').value);
    const term = normalizeUtm($('term').value);
    const built = selected.map(function (id) {
      const f = findPreset(id);
      const r = rows[id];
      const utms = { utm_source: r.source, utm_medium: r.medium, utm_campaign: camp, utm_content: r.content, utm_term: term };
      const b = buildUrl($('url').value, utms);
      return {
        b: b, f: f,
        data: {
          destino: $('url').value.trim(), utm_source: utms.utm_source, utm_medium: utms.utm_medium,
          utm_campaign: camp, utm_content: utms.utm_content, utm_term: term,
          plataforma: f.group.name, ubicacion: f.preset.label, presetId: id, pieza: normalizeUtm($('pieza').value),
          cta: ctaLabel(), ctaValue: $('cta').value, ctaOtro: $('cta-otro').value.trim(),
          ctaSufijo: $('cta-sufijo').checked, acceso: f.preset.access
        }
      };
    });
    results = built.map(function (x) { return { url: x.b.url, label: presetLabel(x.f), data: x.data }; });

    const list = $('resultados');
    list.textContent = '';
    results.forEach(function (r, i) {
      const ta = el('textarea', { readonly: '', rows: '2', spellcheck: 'false', 'aria-label': 'Enlace para ' + r.label });
      ta.value = r.url;
      const status = el('p', { class: 'estado', role: 'status' });
      const copy = el('button', { type: 'button', class: 'boton boton--principal boton--chico', text: 'Copiar', 'aria-label': 'Copiar el enlace de ' + r.label });
      copy.addEventListener('click', async function () {
        if (await copyText(r.url, ta)) setStatus(status, 'Copiado.', 'ok');
        else { selectForManualCopy(ta); setStatus(status, 'No se pudo copiar. El enlace está seleccionado: pulsa Ctrl+C (Cmd+C en Mac).', 'error'); }
      });
      const rot = el('p', { class: 'rotulo' });
      rot.appendChild(el('span', { text: (i + 1) + '. ' + r.label }));
      rot.appendChild(badge(r.data.acceso, false));
      list.appendChild(el('li', {}, rot, ta, el('div', { class: 'acciones' }, copy), status));
    });
    $('resultado').value = results.map(function (r) { return r.label + ': ' + r.url; }).join('\n');
    $('resultados-vacio').hidden = true;
    $('copiar').disabled = false;
    $('guardar').disabled = false;
    $('copiar').textContent = results.length === 1 ? 'Copiar' : 'Copiar todos';
    $('guardar').textContent = results.length === 1 ? 'Guardar' : 'Guardar todos';
    setStatus($('estado'), results.length === 1 ? 'Enlace generado.' : results.length + ' enlaces generados.', null);

    const avisos = $('avisos');
    avisos.textContent = '';
    const first = built[0].b;
    if (first.replaced.length) avisos.appendChild(el('li', { text: 'Se sustituyeron las UTMs que ya traía la URL: ' + first.replaced.join(', ') + '.' }));
    if (first.autotags.length) avisos.appendChild(el('li', { text: 'Se conservó el autoetiquetado publicitario (' + first.autotags.join(', ') + '). No lo borres.' }));
    if (isChatHost(first.hostname)) avisos.appendChild(el('li', { text: 'Este destino abre un chat o una acción nativa: no garantiza que la UTM llegue a tu CRM. Etiqueta, mejor, la URL web que recibe la visita.' }));
    const shared = built.filter(function (x) { return usesSharedLink(x.f.preset); }).map(function (x) { return x.f.preset.label; });
    if (shared.length) avisos.appendChild(el('li', { text: 'Usan el enlace compartido de la bio o del perfil y no distinguen la pieza previa: ' + shared.join('; ') + '.' }));
    const dupes = {};
    results.forEach(function (r) { dupes[r.url] = (dupes[r.url] || 0) + 1; });
    if (Object.keys(dupes).some(function (u) { return dupes[u] > 1; })) {
      avisos.appendChild(el('li', { text: 'Algunas ubicaciones dan el mismo enlace (por ejemplo, rutas que reutilizan la bio). En la analítica no se podrán separar.' }));
    }
  }

  async function copyText(text, textarea) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch (e) { /* se intenta el método clásico */ }
    try {
      const wasHidden = textarea.hidden;
      textarea.hidden = false;
      textarea.focus();
      textarea.select();
      const ok = document.execCommand && document.execCommand('copy');
      textarea.hidden = wasHidden;
      if (ok) return true;
    } catch (e) { /* sin portapapeles */ }
    return false;
  }

  function selectForManualCopy(textarea) {
    textarea.hidden = false;
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
  }

  async function onCopy() {
    if (!results) return;
    const text = $('resultado').value;
    const ok = await copyText(results.length === 1 ? results[0].url : text, $('resultado'));
    if (ok) {
      setStatus($('estado'), results.length === 1 ? 'Copiado al portapapeles.' : 'Copiados los ' + results.length + ' enlaces, uno por línea.', 'ok');
    } else {
      selectForManualCopy($('resultado'));
      setStatus($('estado'), 'No se pudo copiar automáticamente. Los enlaces están seleccionados: pulsa Ctrl+C (Cmd+C en Mac).', 'error');
    }
  }

  function onSave() {
    if (!results) return;
    const negocio = $('negocio').value.trim();
    if (!negocio) {
      setStatus($('estado'), 'Escribe el nombre del negocio para guardar los enlaces.', 'error');
      $('negocio').setAttribute('aria-invalid', 'true');
      $('negocio').focus();
      return;
    }
    $('negocio').removeAttribute('aria-invalid');
    const fecha = new Date().toISOString();
    const entries = results.map(function (r) {
      return Object.assign({ id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), fecha: fecha, negocio: negocio, enlace: r.url }, r.data);
    });
    const next = entries.concat(history);
    if (!store.set(KEYS.historial, next)) {
      setStatus($('estado'), 'No se pudo guardar: este navegador no permite almacenamiento local.', 'error');
      return;
    }
    history = next;
    store.set(KEYS.negocio, negocio);
    renderHistory();
    setStatus($('estado'), entries.length === 1 ? 'Guardado en el historial de este navegador.' : 'Guardados ' + entries.length + ' enlaces en el historial de este navegador.', 'ok');
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString('es', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function renderHistory() {
    const list = $('historial');
    list.textContent = '';
    const q = $('filtro').value.trim().toLowerCase();
    const items = history.filter(function (h) {
      return !q || [h.negocio, h.utm_campaign, h.enlace, h.plataforma, h.ubicacion].join(' ').toLowerCase().indexOf(q) !== -1;
    });
    $('historial-vacio').hidden = items.length > 0;
    $('historial-vacio').textContent = history.length ? 'Ningún enlace coincide con el filtro.' : 'Todavía no has guardado enlaces.';
    $('exportar').disabled = history.length === 0;
    $('borrar-historial').disabled = history.length === 0;

    items.forEach(function (h) {
      const status = el('p', { class: 'estado', role: 'status' });
      const copy = el('button', { type: 'button', class: 'boton boton--principal boton--chico', text: 'Copiar' });
      const reuse = el('button', { type: 'button', class: 'boton boton--secundario boton--chico', text: 'Reutilizar' });
      const remove = el('button', { type: 'button', class: 'boton boton--secundario boton--chico', text: 'Eliminar' });
      const code = el('code', { text: h.enlace });
      const who = h.negocio + ', ' + h.utm_campaign + ', ' + (h.ubicacion || '');
      copy.setAttribute('aria-label', 'Copiar el enlace de ' + who);
      reuse.setAttribute('aria-label', 'Cargar en el formulario el enlace de ' + who);
      remove.setAttribute('aria-label', 'Eliminar del historial el enlace de ' + who);

      copy.addEventListener('click', async function () {
        const ta = el('textarea', { class: 'solo-lectores', readonly: '' });
        ta.value = h.enlace;
        document.body.appendChild(ta);
        const ok = await copyText(h.enlace, ta);
        ta.remove();
        if (ok) { setStatus(status, 'Copiado.', 'ok'); }
        else {
          const range = document.createRange();
          range.selectNodeContents(code);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          setStatus(status, 'No se pudo copiar. El enlace está seleccionado: pulsa Ctrl+C (Cmd+C en Mac).', 'error');
        }
      });
      reuse.addEventListener('click', function () { loadEntry(h); });
      remove.addEventListener('click', function () {
        history = history.filter(function (x) { return x.id !== h.id; });
        store.set(KEYS.historial, history);
        renderHistory();
        $('filtro').focus();
      });

      list.appendChild(el('li', {},
        el('div', { class: 'cabeza' }, el('strong', { text: h.negocio }), el('time', { datetime: h.fecha, text: formatDate(h.fecha) })),
        code,
        el('p', { class: 'meta', text: [h.plataforma, h.ubicacion, h.cta ? 'CTA: ' + h.cta : '', h.acceso].filter(Boolean).join(' · ') }),
        el('div', { class: 'acciones' }, copy, reuse, remove),
        status));
    });
  }

  function loadEntry(h) {
    $('negocio').value = h.negocio || '';
    $('url').value = h.destino || '';
    $('campana').value = h.utm_campaign || '';
    $('cta').value = h.ctaValue || '';
    $('cta-otro').value = h.ctaOtro || '';
    syncCta();
    $('cta-sufijo').checked = !!h.ctaSufijo && !$('cta-sufijo').disabled;
    $('pieza').value = h.pieza || '';
    $('term').value = h.utm_term || '';
    if (h.utm_term) $('avanzado').open = true;
    setSelection(findPreset(h.presetId) ? [h.presetId] : []);
    if (selected.length) {
      const r = rows[h.presetId];
      const p = findPreset(h.presetId).preset;
      r.source = h.utm_source || '';
      r.medium = h.utm_medium || '';
      r.content = h.utm_content || '';
      r.editable = r.source !== p.utm_source || r.medium !== p.utm_medium || r.editable;
      renderRows();
      renderConditions();
    }
    clearErrors();
    refresh();
    setStatus($('estado'), 'Cargado desde el historial. Añade más ubicaciones o cambia lo que necesites y genera de nuevo.', null);
    $('formulario').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('url').focus({ preventScroll: true });
  }

  function exportCsv() {
    if (!history.length) return;
    const csv = '﻿' + toCsv(history);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = el('a', { href: URL.createObjectURL(blob), download: 'enlaces-utm-' + new Date().toISOString().slice(0, 10) + '.csv' });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function clearHistory() {
    if (!history.length) return;
    if (!window.confirm('¿Borrar los ' + history.length + ' enlaces del historial de este navegador? Exporta el CSV antes si los necesitas.')) return;
    history = [];
    store.set(KEYS.historial, history);
    renderHistory();
  }

  function syncCta() {
    const v = $('cta').value;
    $('cta-otro-campo').hidden = v !== 'otro';
    const box = $('cta-sufijo');
    box.disabled = !v;
    if (!v) box.checked = false;
  }

  /* ---------- Plantillas propias ---------- */

  function fillTemplateGroups() {
    const tpl = $('tpl-grupo');
    const prev = tpl.value;
    tpl.textContent = '';
    groups.forEach(function (g) { tpl.appendChild(el('option', { value: g.name, text: g.name })); });
    tpl.appendChild(el('option', { value: '__nuevo', text: '＋ Nuevo canal…' }));
    tpl.value = prev && (prev === '__nuevo' || groups.some(function (g) { return g.name === prev; })) ? prev : groups[0].name;
  }

  function renderTemplates() {
    const list = $('plantillas');
    list.textContent = '';
    customPresets.forEach(function (p) {
      const remove = el('button', { type: 'button', class: 'boton boton--secundario boton--chico', text: 'Eliminar' });
      remove.setAttribute('aria-label', 'Eliminar la plantilla ' + p.group + ', ' + p.label);
      remove.addEventListener('click', function () {
        customPresets = customPresets.filter(function (x) { return x.id !== p.id; });
        store.set(KEYS.plantillas, customPresets);
        rebuildCatalog();
      });
      list.appendChild(el('li', {},
        el('span', {}, el('strong', { text: p.group + ' · ' + p.label }), ' ', el('code', { text: 'source=' + p.utm_source + ' · medium=' + p.utm_medium + ' · content=' + p.utm_content })),
        remove));
    });
  }

  function rebuildCatalog(addId) {
    groups = buildCatalog(BASE, customPresets);
    fillTemplateGroups();
    renderTemplates();
    setSelection(selected.filter(function (id) { return findPreset(id); }).concat(addId ? [addId] : []));
  }

  function templateFromCurrent() {
    if (!selected.length) {
      showErrorSummary($('tpl-errores'), [{ id: 'ubic-boton', message: 'Elige primero una ubicación en el paso 2.' }]);
      return;
    }
    const f = findPreset(selected[0]);
    const r = rows[selected[0]];
    $('tpl-grupo').value = f.group.name;
    $('tpl-nuevo-campo').hidden = true;
    $('tpl-nombre').value = f.preset.label + ' (variante)';
    $('tpl-ubicacion').value = contentBase(f.preset);
    $('tpl-source').value = normalizeUtm(r.source) || f.preset.utm_source;
    $('tpl-medium').value = normalizeUtm(r.medium) || f.preset.utm_medium;
    $('tpl-acceso').value = f.preset.access;
    $('tpl-detalle').value = f.preset.detail || '';
    $('tpl-errores').hidden = true;
    $('tpl-nombre').focus();
  }

  function saveTemplate(ev) {
    ev.preventDefault();
    const errors = [];
    const isNew = $('tpl-grupo').value === '__nuevo';
    const group = isNew ? $('tpl-nuevo').value.trim() : $('tpl-grupo').value;
    const label = $('tpl-nombre').value.trim();
    const placement = normalizeUtm($('tpl-ubicacion').value);
    const source = normalizeUtm($('tpl-source').value);
    const medium = normalizeUtm($('tpl-medium').value);
    if (!group) errors.push({ id: isNew ? 'tpl-nuevo' : 'tpl-grupo', message: 'Escribe el nombre del canal.' });
    if (!label) errors.push({ id: 'tpl-nombre', message: 'Escribe el nombre de la ubicación.' });
    if (!placement) errors.push({ id: 'tpl-ubicacion', message: 'Escribe el identificador de la ubicación.' });
    if (!source) errors.push({ id: 'tpl-source', message: 'Escribe utm_source.' });
    if (!medium) errors.push({ id: 'tpl-medium', message: 'Escribe utm_medium.' });
    ['tpl-ubicacion', 'tpl-source', 'tpl-medium'].forEach(function (id) {
      if (personalDataIn($(id).value)) errors.push({ id: id, message: 'Quita los datos personales: las UTMs no los llevan.' });
    });
    if (errors.length) { showErrorSummary($('tpl-errores'), errors); return; }
    $('tpl-errores').hidden = true;

    const preset = {
      id: 'propia_' + Date.now().toString(36), group: group, label: label, utm_source: source, utm_medium: medium,
      placement: placement, utm_content: placement + '_01', access: $('tpl-acceso').value,
      detail: $('tpl-detalle').value.trim(), custom: true
    };
    const next = customPresets.concat([preset]);
    if (!store.set(KEYS.plantillas, next) && store.ok) { showErrorSummary($('tpl-errores'), [{ id: 'tpl-nombre', message: 'No se pudo guardar la plantilla en este navegador.' }]); return; }
    customPresets = next;
    $('plantilla-form').reset();
    $('tpl-nuevo-campo').hidden = true;
    rebuildCatalog(preset.id);
    setStatus($('estado'), 'Plantilla «' + label + '» guardada y añadida a las ubicaciones elegidas.', 'ok');
    $('ubic-boton').focus();
  }

  /* ---------- Arranque ---------- */

  function init() {
    $('version-catalogo').textContent = BASE.version + ' · ' + BASE.groups.length + ' grupos · ' +
      BASE.groups.reduce(function (n, g) { return n + g.presets.length; }, 0) + ' configuraciones';

    const cta = $('cta');
    cta.appendChild(el('option', { value: '', text: 'Sin especificar' }));
    BASE.ctas.forEach(function (c) { cta.appendChild(el('option', { value: c.id, text: c.label })); });

    BASE.sources.forEach(function (s) {
      $('fuentes').appendChild(el('li', {}, el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.title })));
    });

    fillTemplateGroups();
    $('negocio').value = store.get(KEYS.negocio, '') || '';
    $('pieza').value = '01';
    setSelection([]);
    renderTemplates();
    renderHistory();

    if (!store.ok) {
      $('almacenamiento').textContent = 'Este navegador no permite guardar datos (por ejemplo, en una ventana privada). Puedes generar y copiar enlaces, pero el historial no se conservará al recargar.';
    }

    $('ubic-boton').addEventListener('click', function () { openPicker($('ubic-panel').hidden); });
    $('ubic-listo').addEventListener('click', function () { openPicker(false); $('ubic-boton').focus(); });
    $('ubic-limpiar').addEventListener('click', function () { setSelection([]); $('ubic-buscar').focus(); });
    $('ubic-buscar').addEventListener('input', renderPicker);
    $('ubic-panel').addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); openPicker(false); $('ubic-boton').focus(); }
    });
    document.addEventListener('click', function (ev) {
      if ($('ubic-panel').hidden) return;
      // Una casilla recién repintada ya no está en el documento: ese clic fue dentro del panel.
      if (!document.contains(ev.target)) return;
      if (!$('ubic-panel').contains(ev.target) && !$('ubic-boton').contains(ev.target)) openPicker(false);
    });

    $('pieza').addEventListener('input', function () { recomputeContents(); renderRows(); refresh(); });
    $('cta').addEventListener('change', function () { syncCta(); recomputeContents(); renderRows(); renderConditions(); refresh(); });
    $('cta-otro').addEventListener('input', function () { recomputeContents(); renderRows(); refresh(); });
    $('cta-sufijo').addEventListener('change', function () { recomputeContents(); renderRows(); refresh(); });
    ['url', 'campana', 'term', 'confirmar'].forEach(function (id) {
      $(id).addEventListener('input', refresh);
      $(id).addEventListener('change', refresh);
    });
    ['campana', 'pieza', 'term', 'cta-otro'].forEach(function (id) {
      $(id).addEventListener('blur', function () {
        const input = $(id);
        if (personalDataIn(input.value)) return;
        const n = normalizeUtm(input.value);
        if (n !== input.value) { input.value = n; if (id === 'pieza' || id === 'cta-otro') { recomputeContents(); renderRows(); } renderPreview(); }
      });
    });

    $('formulario').addEventListener('submit', generate);
    $('copiar').addEventListener('click', onCopy);
    $('guardar').addEventListener('click', onSave);
    $('filtro').addEventListener('input', renderHistory);
    $('exportar').addEventListener('click', exportCsv);
    $('borrar-historial').addEventListener('click', clearHistory);
    $('negocio').addEventListener('input', function () { $('negocio').removeAttribute('aria-invalid'); });

    $('ejemplo').addEventListener('click', function () {
      $('url').value = 'https://example.com/webinar?idioma=es#registro';
      $('campana').value = 'webinar_octubre';
      $('pieza').value = '01';
      $('cta').value = 'registrarse';
      syncCta();
      setSelection(['instagram_story']);
      clearErrors();
      $('url').focus();
    });

    $('tpl-grupo').addEventListener('change', function () {
      const isNew = $('tpl-grupo').value === '__nuevo';
      $('tpl-nuevo-campo').hidden = !isNew;
      if (isNew) $('tpl-nuevo').focus();
    });
    $('tpl-desde-actual').addEventListener('click', templateFromCurrent);
    $('plantilla-form').addEventListener('submit', saveTemplate);
  }

  init();
})(typeof window !== 'undefined' ? window : globalThis);
