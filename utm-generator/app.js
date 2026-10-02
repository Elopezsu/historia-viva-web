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
    contextNotes: contextNotes, toCsv: toCsv
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
  let result = null; // { url, data } del último enlace generado y vigente

  const FIELD_IDS = { utm_source: 'source', utm_medium: 'medium', utm_campaign: 'campana', utm_content: 'content', utm_term: 'term' };

  function currentGroup() { return groups.find(function (g) { return g.name === $('plataforma').value; }) || groups[0]; }
  function currentPreset() {
    const g = currentGroup();
    return g.presets.find(function (p) { return p.id === $('ubicacion').value; }) || g.presets[0];
  }
  function findPreset(id) {
    for (const g of groups) { const p = g.presets.find(function (x) { return x.id === id; }); if (p) return { group: g, preset: p }; }
    return null;
  }
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

  function fillGroups(selectName) {
    const sel = $('plataforma');
    sel.textContent = '';
    groups.forEach(function (g) {
      sel.appendChild(el('option', { value: g.name, text: g.name + ' (' + g.presets.length + ')' }));
    });
    sel.value = selectName && groups.some(function (g) { return g.name === selectName; }) ? selectName : groups[0].name;

    const tpl = $('tpl-grupo');
    const prev = tpl.value;
    tpl.textContent = '';
    groups.forEach(function (g) { tpl.appendChild(el('option', { value: g.name, text: g.name })); });
    tpl.appendChild(el('option', { value: '__nuevo', text: '＋ Nuevo canal…' }));
    if (prev) tpl.value = prev;
    if (!tpl.value) tpl.value = groups[0].name;
  }

  function fillPresets(selectId) {
    const g = currentGroup();
    const sel = $('ubicacion');
    sel.textContent = '';
    g.presets.forEach(function (p) {
      sel.appendChild(el('option', { value: p.id, text: p.label + (p.custom ? ' · propia' : '') + ' — ' + p.access }));
    });
    sel.value = selectId && g.presets.some(function (p) { return p.id === selectId; }) ? selectId : g.presets[0].id;
  }

  function setLocked(field, locked) {
    const input = $(field);
    const button = $('editar-' + field);
    input.readOnly = locked;
    button.textContent = locked ? 'Editar' : 'Usar plantilla';
    button.setAttribute('aria-label', locked ? 'Editar ' + (field === 'source' ? 'la fuente' : 'el medio') : 'Volver al valor de la plantilla');
  }

  // Cambio de plantilla: fuente, medio, pieza y contenido vuelven a los valores de la ubicación.
  function applyPreset() {
    const p = currentPreset();
    $('source').value = p.utm_source;
    $('medium').value = p.utm_medium;
    const editable = p.placement === 'personalizado' || p.custom;
    setLocked('source', !editable);
    setLocked('medium', !editable);
    $('pieza').value = defaultPiece(p);
    $('confirmar').checked = false;
    updatePieceLabel(p);
    recomputeContent();
    renderConditions();
  }

  function updatePieceLabel(p) {
    const shared = usesSharedLink(p);
    $('pieza-label').textContent = shared ? 'Pieza · número del enlace compartido' : 'Pieza';
    $('pieza-ayuda').textContent = shared
      ? 'Esta ruta reutiliza ' + contentBase(p) + '_' + defaultPiece(p) + '. Cambia el número solo si tienes varios enlaces de bio o perfil.'
      : 'Número o nombre corto de la pieza: 01, 02, lanzamiento…';
  }

  function recomputeContent() {
    const suffix = $('cta-sufijo').checked ? ctaId() : '';
    $('content').value = composeContent(currentPreset(), $('pieza').value, suffix);
  }

  function renderConditions() {
    const p = currentPreset();
    const g = currentGroup();
    const box = $('condiciones');
    box.textContent = '';
    const title = el('p', { class: 'condiciones-titulo' });
    title.appendChild(badge(p.access, p.custom));
    title.appendChild(el('strong', { text: p.label }));
    box.appendChild(title);
    if (p.detail) box.appendChild(el('p', { text: p.detail }));
    if (g.note) box.appendChild(el('p', { class: 'grupo-nota', text: g.name + ': ' + g.note }));
    contextNotes(p, normalizeUtm($('medium').value), $('cta').value).forEach(function (n) {
      box.appendChild(el('p', { class: 'alerta', text: n }));
    });
    $('confirmar-campo').hidden = p.access === 'Enlace web';
  }

  function utmValues() {
    const out = {};
    UTM_KEYS.forEach(function (k) { out[k] = normalizeUtm($(FIELD_IDS[k]).value); });
    return out;
  }

  function renderPreview() {
    const values = utmValues();
    const body = $('vista-previa');
    body.textContent = '';
    UTM_KEYS.forEach(function (k) {
      const required = k === 'utm_source' || k === 'utm_medium' || k === 'utm_campaign';
      let cell;
      if (values[k]) cell = el('td', {}, el('code', { text: values[k] }));
      else if (required) cell = el('td', { class: 'falta', text: 'Falta (obligatorio)' });
      else cell = el('td', { class: 'vacio-valor', text: 'Vacío: no se añade' });
      body.appendChild(el('tr', {}, el('th', { scope: 'row' }, el('code', { text: k })), cell));
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
    if (!result) return;
    result = null;
    $('copiar').disabled = true;
    $('guardar').disabled = true;
    setStatus($('estado'), 'Cambiaste datos: vuelve a generar el enlace.', null);
  }

  function refresh() {
    renderPreview();
    invalidate();
  }

  function showFieldError(id, message) {
    const input = $(id);
    const msg = $(id + '-error');
    if (message) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    if (msg) { msg.textContent = message || ''; msg.hidden = !message; }
  }

  function clearErrors() {
    ['url', 'campana', 'source', 'medium', 'content', 'term', 'pieza', 'cta-otro'].forEach(function (id) { showFieldError(id, ''); });
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

    const labels = { campana: 'la campaña', source: 'la fuente', medium: 'el medio', content: 'el contenido', term: 'la palabra clave', pieza: 'la pieza', 'cta-otro': 'el identificador del CTA' };
    Object.keys(labels).forEach(function (id) {
      const kind = personalDataIn($(id).value);
      if (kind) add(id, 'Quita ' + kind + ' de ' + labels[id] + ': las UTMs no llevan datos personales.');
    });

    if (!normalizeUtm($('campana').value) && !$('campana').hasAttribute('aria-invalid')) add('campana', 'Escribe el nombre de la campaña.');
    if (!normalizeUtm($('source').value) && !$('source').hasAttribute('aria-invalid')) add('source', 'La fuente (utm_source) es obligatoria.');
    if (!normalizeUtm($('medium').value) && !$('medium').hasAttribute('aria-invalid')) add('medium', 'El medio (utm_medium) es obligatorio.');

    const src = normalizeUtm($('source').value);
    if (src && BASE.ctas.some(function (c) { return c.id === src && c.id !== 'whatsapp'; })) {
      add('source', '«' + src + '» es una acción del CTA, no una fuente. Usa la plataforma.');
    }
    if ($('cta').value === 'otro' && $('cta-sufijo').checked && !normalizeUtm($('cta-otro').value)) {
      add('cta-otro', 'Escribe el identificador del CTA o desmarca «Añadir el CTA».');
    }
    if (!$('confirmar-campo').hidden && !$('confirmar').checked) {
      errors.push({ id: 'confirmar', message: 'Confirma que revisaste la condición de esta ubicación.' });
    }
    return errors;
  }

  function generate(ev) {
    ev.preventDefault();
    normalizeAllUtmFields();
    const errors = validate();
    if (errors.length) {
      result = null;
      $('copiar').disabled = true;
      $('guardar').disabled = true;
      showErrorSummary($('errores'), errors);
      return;
    }
    const utms = utmValues();
    const built = buildUrl($('url').value, utms);
    if (built.error) { showErrorSummary($('errores'), [{ id: 'url', message: built.error }]); return; }

    const g = currentGroup();
    const p = currentPreset();
    result = {
      url: built.url,
      data: {
        destino: $('url').value.trim(), utm_source: utms.utm_source, utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign, utm_content: utms.utm_content, utm_term: utms.utm_term,
        plataforma: g.name, ubicacion: p.label, presetId: p.id, pieza: normalizeUtm($('pieza').value),
        cta: ctaLabel(), ctaValue: $('cta').value, ctaOtro: $('cta-otro').value.trim(),
        ctaSufijo: $('cta-sufijo').checked, acceso: p.access
      }
    };
    $('resultado').value = built.url;
    $('copiar').disabled = false;
    $('guardar').disabled = false;
    setStatus($('estado'), 'Enlace generado.', null);

    const avisos = $('avisos');
    avisos.textContent = '';
    if (built.replaced.length) avisos.appendChild(el('li', { text: 'Se sustituyeron las UTMs que ya traía la URL: ' + built.replaced.join(', ') + '.' }));
    if (built.autotags.length) avisos.appendChild(el('li', { text: 'Se conservó el autoetiquetado publicitario (' + built.autotags.join(', ') + '). No lo borres.' }));
    if (isChatHost(built.hostname)) avisos.appendChild(el('li', { text: 'Este destino abre un chat o una acción nativa: no garantiza que la UTM llegue a tu CRM. Etiqueta, mejor, la URL web que recibe la visita.' }));
    if (usesSharedLink(p)) avisos.appendChild(el('li', { text: 'Es el enlace compartido de la bio o del perfil: no distingue la pieza previa.' }));
  }

  function normalizeAllUtmFields() {
    document.querySelectorAll('#formulario [data-utm]').forEach(function (input) {
      if (!personalDataIn(input.value)) input.value = normalizeUtm(input.value);
    });
  }

  async function copyText(text, textarea) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch (e) { /* se intenta el método clásico */ }
    try {
      textarea.focus();
      textarea.select();
      if (document.execCommand && document.execCommand('copy')) return true;
    } catch (e) { /* sin portapapeles */ }
    return false;
  }

  function selectForManualCopy(textarea) {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
  }

  async function onCopy() {
    if (!result) return;
    const ok = await copyText(result.url, $('resultado'));
    if (ok) {
      setStatus($('estado'), 'Copiado al portapapeles.', 'ok');
    } else {
      selectForManualCopy($('resultado'));
      setStatus($('estado'), 'No se pudo copiar automáticamente. El enlace está seleccionado: pulsa Ctrl+C (Cmd+C en Mac).', 'error');
    }
  }

  function onSave() {
    if (!result) return;
    const negocio = $('negocio').value.trim();
    if (!negocio) {
      setStatus($('estado'), 'Escribe el nombre del negocio para guardar el enlace.', 'error');
      $('negocio').setAttribute('aria-invalid', 'true');
      $('negocio').focus();
      return;
    }
    $('negocio').removeAttribute('aria-invalid');
    const entry = Object.assign({ id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), fecha: new Date().toISOString(), negocio: negocio, enlace: result.url }, result.data);
    const next = [entry].concat(history);
    if (!store.set(KEYS.historial, next)) {
      setStatus($('estado'), 'No se pudo guardar: este navegador no permite almacenamiento local.', 'error');
      return;
    }
    history = next;
    store.set(KEYS.negocio, negocio);
    renderHistory();
    setStatus($('estado'), 'Guardado en el historial de este navegador.', 'ok');
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
      copy.setAttribute('aria-label', 'Copiar el enlace de ' + h.negocio + ', ' + h.utm_campaign);
      reuse.setAttribute('aria-label', 'Cargar en el formulario el enlace de ' + h.negocio + ', ' + h.utm_campaign);
      remove.setAttribute('aria-label', 'Eliminar del historial el enlace de ' + h.negocio + ', ' + h.utm_campaign);

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
    const found = findPreset(h.presetId);
    if (found) {
      $('plataforma').value = found.group.name;
      fillPresets(found.preset.id);
      applyPreset();
    }
    $('cta').value = h.ctaValue || '';
    $('cta-otro').value = h.ctaOtro || '';
    syncCta();
    $('cta-sufijo').checked = !!h.ctaSufijo && !$('cta-sufijo').disabled;
    $('pieza').value = h.pieza || '';
    ['source', 'medium'].forEach(function (f) {
      const v = h['utm_' + f] || '';
      if ($(f).value !== v) { $(f).value = v; setLocked(f, false); }
    });
    $('content').value = h.utm_content || '';
    $('term').value = h.utm_term || '';
    if (h.utm_term) $('avanzado').open = true;
    renderConditions();
    clearErrors();
    refresh();
    setStatus($('estado'), 'Cargado desde el historial. Cambia lo que necesites y genera de nuevo.', null);
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

  function rebuildCatalog(selectGroup, selectPreset) {
    const keepGroup = selectGroup || $('plataforma').value;
    const keepPreset = selectPreset || $('ubicacion').value;
    groups = buildCatalog(BASE, customPresets);
    fillGroups(keepGroup);
    fillPresets(keepPreset);
    applyPreset();
    renderTemplates();
    refresh();
  }

  function templateFromCurrent() {
    const g = currentGroup();
    const p = currentPreset();
    $('tpl-grupo').value = g.name;
    $('tpl-nuevo-campo').hidden = true;
    $('tpl-nombre').value = p.label + ' (variante)';
    $('tpl-ubicacion').value = contentBase(p);
    $('tpl-source').value = normalizeUtm($('source').value) || p.utm_source;
    $('tpl-medium').value = normalizeUtm($('medium').value) || p.utm_medium;
    $('tpl-acceso').value = p.access;
    $('tpl-detalle').value = p.detail || '';
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
    rebuildCatalog(group, preset.id);
    setStatus($('estado'), 'Plantilla «' + label + '» guardada y seleccionada.', 'ok');
    $('plataforma').focus();
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

    fillGroups();
    fillPresets();
    applyPreset();
    $('negocio').value = store.get(KEYS.negocio, '') || '';
    renderTemplates();
    renderHistory();
    renderPreview();

    if (!store.ok) {
      $('almacenamiento').textContent = 'Este navegador no permite guardar datos (por ejemplo, en una ventana privada). Puedes generar y copiar enlaces, pero el historial no se conservará al recargar.';
    }

    $('plataforma').addEventListener('change', function () { fillPresets(); applyPreset(); refresh(); });
    $('ubicacion').addEventListener('change', function () { applyPreset(); refresh(); });
    $('pieza').addEventListener('input', function () { recomputeContent(); refresh(); });
    $('cta').addEventListener('change', function () { syncCta(); recomputeContent(); renderConditions(); refresh(); });
    $('cta-otro').addEventListener('input', function () { recomputeContent(); refresh(); });
    $('cta-sufijo').addEventListener('change', function () { recomputeContent(); refresh(); });
    $('medium').addEventListener('input', renderConditions);
    ['url', 'campana', 'source', 'medium', 'content', 'term', 'confirmar'].forEach(function (id) {
      $(id).addEventListener('input', refresh);
      $(id).addEventListener('change', refresh);
    });
    document.querySelectorAll('#formulario [data-utm]').forEach(function (input) {
      input.addEventListener('blur', function () {
        if (personalDataIn(input.value)) return;
        const n = normalizeUtm(input.value);
        if (n !== input.value) { input.value = n; renderPreview(); }
      });
    });

    ['source', 'medium'].forEach(function (f) {
      $('editar-' + f).addEventListener('click', function () {
        if ($(f).readOnly) { setLocked(f, false); $(f).focus(); $(f).select(); }
        else { $(f).value = currentPreset()['utm_' + f]; setLocked(f, true); renderConditions(); refresh(); }
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
      $('plataforma').value = 'Instagram';
      fillPresets('instagram_story');
      applyPreset();
      $('cta').value = 'registrarse';
      syncCta();
      recomputeContent();
      renderConditions();
      clearErrors();
      refresh();
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
