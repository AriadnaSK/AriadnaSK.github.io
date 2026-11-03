/* sk-directions.js — «Направления» (ADR 0160).
 *
 * The LATE script of the home block, the /napravleniya · /podborka · /klub
 * pages and the landing block. It is fetched only when a [data-skd] block
 * comes near the screen (directions/partials/assets.blade.php): the page
 * never waits for it. Everything it shows first was already rendered on the
 * server; it adds what reacts to the visitor — search suggestions, the city
 * switch, «Рядом со мной», the filters, the gallery, the club over a landing.
 *
 * The markup it draws on a city or tier switch mirrors the Blade partials in
 * resources/views/directions — change both together.
 *
 * Plain ES2017, no build step, no dependency. */
(function () {
  "use strict";
  if (window.__skdRun) return;
  window.__skdRun = 1;

  var INSTALL = "https://client.sportskey.ru/?install=1";
  var TILES = 9;
  var FEW = 10;
  // The children's root (Directions::KIDS, ADR 0194).
  var KIDS = "detyam";
  var POPULAR = ["basseyn", "trenazhernyy-zal", "yoga", "pilates", "krossfit", "boks", "stretching", "tancy", "saykl", "aeroyoga"];
  var COLL = {
    "do-raboty": "С 7 утра — до работы", "bassejn-i-sauna": "Бассейн и сауна", "sauna-i-hamam": "Сауна или хамам",
    "s-parkovkoj": "С парковкой", "s-polotencami": "Полотенца на месте", "dlya-zhenschin": "Только для женщин",
    "dostupnaya-sreda": "Доступная среда", "tolko-premium": "Только Премиум"
  };
  var AMEN = {
    shower: "Душ", lockers: "Шкафчики", wifi: "Wi‑Fi", parking: "Парковка", yoga: "Коврики для йоги", towel: "Полотенца",
    water: "Питьевая вода", accessibility: "Доступная среда", finnish_sauna: "Финская сауна", hammam: "Хамам",
    women_only: "Только для женщин", cafe: "Кафе", salt_room: "Соляная комната", sauna: "Сауна", solarium: "Солярий", banya: "Баня",
    kids_room: "Детская комната"
  };
  var PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7.5"/></svg>';

  // ── words ─────────────────────────────────────────────────────────────
  function plural(n, a, b, c) { return n % 10 === 1 && n % 100 !== 11 ? a : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? b : c; }
  function clubs(n) { return n + " " + plural(n, "клуб", "клуба", "клубов"); }
  // the whole network's headline figure, as Directions::networkClubs(): «230+ клубов» (owner, 22.10)
  function netClubs(n) { if (n < 20) return clubs(n); var r = Math.round(n / 10) * 10; return r + "+ " + plural(r, "клуб", "клуба", "клубов"); }
  function ofClubs(n) { return n + " " + (n % 10 === 1 && n % 100 !== 11 ? "клуба" : "клубов"); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]; }); }
  function norm(t) { return String(t || "").toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9]+/g, " ").trim(); }
  function narrow() { return window.matchMedia("(max-width: 700px)").matches; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ── time: club hours are Moscow hours ─────────────────────────────────
  function mskNow() { return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" })); }
  function toMin(s) { var m = typeof s === "string" && s.match(/(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; }
  function hhmm(m) { return String(Math.floor(m / 60) % 24).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
  // h = [time, timeclose, sat open, sat close, sun open, sun close, has weekend fields]
  function hoursOf(h, day) {
    if (day === 6 && h[6]) return [h[2], h[3]];
    if (day === 0 && h[6]) return [h[4], h[5]];
    return [h[0], h[1]];
  }
  function openStatus(h, now) {
    var d = now.getDay(), oc = hoursOf(h, d), o = toMin(oc[0]), cl = toMin(oc[1]);
    if (o == null || cl == null) return null;
    if ((cl - o) % 1440 === 0) return { open: true, text: "Круглосуточно", late: true };
    var n = now.getHours() * 60 + now.getMinutes();
    var isOpen = cl > o ? n >= o && n < cl : n >= o || n < cl;
    var late = cl <= o || cl >= 23 * 60;
    if (isOpen) return (cl - n + 1440) % 1440 <= 60 ? { open: true, soon: true, text: "Закроется в " + hhmm(cl), late: late } : { open: true, text: "Открыто до " + hhmm(cl), late: late };
    if (n < o) return { open: false, text: "Откроется в " + hhmm(o), late: late };
    var o2 = toMin(hoursOf(h, (d + 1) % 7)[0]);
    return { open: false, text: o2 != null ? "Откроется в " + hhmm(o2) : "Закрыто", late: late };
  }
  function todayHours(h, now) {
    var oc = hoursOf(h, now.getDay()), a = toMin(oc[0]), b = toMin(oc[1]);
    if (a == null || b == null) return "";
    return (b - a) % 1440 === 0 ? "Круглосуточно" : "Сегодня " + hhmm(a) + "–" + hhmm(b);
  }

  // ── distance ──────────────────────────────────────────────────────────
  function metersBetween(a, b) {
    var R = 6371000, r = Math.PI / 180, dp = (b[1] - a[1]) * r, dl = (b[0] - a[0]) * r;
    var x = Math.pow(Math.sin(dp / 2), 2) + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.pow(Math.sin(dl / 2), 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function walkMin(m) { var x = Math.max(1, Math.round(m / 80)); return x <= 25 ? x : null; }
  function fmtDist(m) { return m < 1000 ? Math.max(10, Math.round(m / 10) * 10) + " м" : (m / 1000).toFixed(m < 10000 ? 1 : 0).replace(".", ",") + " км"; }
  function farText(m) { return walkMin(m) ? walkMin(m) + " мин пешком" : fmtDist(m); }

  // ── data ──────────────────────────────────────────────────────────────
  function getJSON(u) { return fetch(u, { credentials: "same-origin" }).then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); }); }
  var _data = {};
  function load(slug) {
    if (!_data[slug]) {
      _data[slug] = getJSON("/api/directions/" + encodeURIComponent(slug)).then(function (d) {
        d.slug = slug;
        d.tree.forEach(function (x) {
          var set = [x.s];
          x.k.forEach(function (k) { set.push(k.s); k.g.forEach(function (g) { set.push(g); }); });
          x.set = new Set(set);
        });
        d.byVid = {};
        d.clubs.forEach(function (c) { d.byVid[c.v] = c; });
        return d;
      });
      _data[slug].catch(function () { delete _data[slug]; });
    }
    return _data[slug];
  }
  // ADR 0194 — the children's direction is the children's card's network (Directions::inDir).
  function inDir(c, d) { if (d.s === KIDS) return c.ch === 1; for (var i = 0; i < c.c.length; i++) if (d.set.has(c.c[i])) return true; return false; }
  function inTier(c, tier) { return !tier || tier === "premium" || c.t === "gold"; }
  function has(c, a) { return c.am.indexOf(a) >= 0; }
  function inColl(key, c, now) {
    switch (key) {
      case "otkryto-seychas": var s = openStatus(c.h, now); return !!(s && s.open);
      case "dopozdna": var s2 = openStatus(c.h, now); return !!(s2 && s2.late);
      case "do-raboty": var o = toMin(c.h[0]); return o != null && o <= 7 * 60;
      case "bassejn-i-sauna": return c.c.indexOf("basseyn") >= 0 && (c.c.some(function (x) { return /sauna|banya|hamam/.test(x); }) || has(c, "finnish_sauna") || has(c, "hammam"));
      case "sauna-i-hamam": return has(c, "finnish_sauna") || has(c, "hammam") || has(c, "sauna") || has(c, "banya") || c.c.indexOf("sauna-banya-i-hamam") >= 0;
      case "s-parkovkoj": return has(c, "parking");
      case "s-polotencami": return has(c, "towel");
      case "dlya-zhenschin": return has(c, "women_only");
      case "dostupnaya-sreda": return has(c, "accessibility");
      case "tolko-premium": return c.t === "premium";
    }
    return false;
  }
  function stats(d, list, tier) {
    return d.tree.map(function (x) {
      var n = 0;
      list.forEach(function (c) { if (inTier(c, tier) && inDir(c, x)) n++; });
      return { d: x, n: n };
    }).filter(function (x) { return x.n > 0; }).sort(function (a, b) { return b.n - a.n; });
  }
  // The children's tile always among the visible ones (Directions::homeTiles, ADR 0194).
  function homeTiles(s) {
    for (var i = 0; i < s.length; i++) {
      if (s[i].d.s !== KIDS) continue;
      if (i < TILES) return s;
      var out = s.slice(), x = out.splice(i, 1)[0];
      out.splice(TILES - 1, 0, x);
      return out;
    }
    return s;
  }
  function findSlug(d, slug) {
    for (var i = 0; i < d.tree.length; i++) {
      var x = d.tree[i];
      if (x.s === slug) return { top: x, title: x.n, kid: "" };
      for (var j = 0; j < x.k.length; j++) {
        var k = x.k[j];
        if (k.s === slug) return { top: x, title: k.t, kid: slug };
        if (k.g.indexOf(slug) >= 0) return { top: x, title: k.t, kid: slug };
      }
    }
    return null;
  }
  function cityOf(d, slug) { for (var i = 0; i < d.cities.length; i++) if (d.cities[i].slug === slug) return d.cities[i]; return null; }
  function cityIn(d, name) { for (var i = 0; i < d.cities.length; i++) if (d.cities[i].name === name) return d.cities[i]["in"]; return "в городе " + name; }
  function dirUrl(slug, d, kid) {
    var url = "/napravleniya/" + slug + (d.city !== "Москва" ? "/" + d.slug : "");
    return kid ? url + "?kid=" + encodeURIComponent(kid) : url;
  }
  function collUrl(key, d) { return "/podborka/" + key + (d.city !== "Москва" ? "/" + d.slug : ""); }
  // Where the nearest club is — the city «Рядом со мной» really means.
  function nearestCity(d, p) {
    var best = null, bm = Infinity;
    d.cities.forEach(function (x) { (x.pts || []).forEach(function (q) { var m = metersBetween(p, q); if (m < bm) { bm = m; best = x.slug; } }); });
    return best;
  }
  function locate() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) { reject(new Error("no geolocation")); return; }
      navigator.geolocation.getCurrentPosition(function (p) { resolve([p.coords.longitude, p.coords.latitude]); }, reject, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
    });
  }
  function geocode(q, cityName) {
    return fetch("/api/directions/geocode?q=" + encodeURIComponent(q) + "&city=" + encodeURIComponent(cityName), { credentials: "same-origin" })
      .then(function (r) { return r.status === 404 ? { found: false } : r.ok ? r.json() : Promise.reject(new Error(String(r.status))); })
      .then(function (j) { return j && j.found ? [j.lng, j.lat] : null; });
  }
  var ME = "me";
  function nearTo(label) { return label === ME ? "к вам" : "к «" + label + "»"; }

  // ── shared markup (mirrors the Blade partials) ────────────────────────
  function tierText(c) { return c.t === "gold" ? "Золото и Премиум" : "Только Премиум"; }
  function card(c, now, o) {
    o = o || {};
    var s = openStatus(c.h, now);
    var dist = o.from ? metersBetween(o.from, c.ll) : null;
    var open = o.sheet ? 'button type="button" data-sheet="' + esc(c.v) + '"' : 'a href="' + esc(c.u) + '"';
    var st = o.hours ? '<span class="skd-card__s is-open">' + esc(todayHours(c.h, now)) + "</span>"
      : s ? '<span class="skd-card__s ' + (s.open ? (s.soon ? "is-soon" : "is-open") : "is-closed") + '">' + esc(s.text) + "</span>" : "";
    return "<" + open + ' class="skd-card">' +
      '<span class="skd-card__ph' + (c.i ? "" : " is-empty") + '">' +
      (c.i ? '<img src="' + esc(c.i) + '" alt="" loading="lazy" decoding="async" width="320" height="170">' : "") +
      (c.l ? '<img class="skd-card__logo" src="' + esc(c.l) + '" alt="" loading="lazy" decoding="async" width="48" height="48">' : "") +
      // ADR 0194 — a children's list names no tariff: the children's card is a network of its own (owner, 20.10).
      (o.kids ? "" : '<span class="skd-card__tier skd-card__tier--' + c.t + '">' + tierText(c) + "</span>") + "</span>" +
      '<span class="skd-card__b"><b class="skd-card__n">' + esc(c.n) + "</b>" +
      (o.kids && c.kd ? '<span class="skd-card__k">' + esc(c.kd) + "</span>" : "") +
      '<span class="skd-card__m">' + (c.m ? "м. " + esc(c.m) : esc(c.a)) + (dist != null ? " · " + farText(dist) : "") + "</span>" + st + "</span>" +
      "</" + (o.sheet ? "button" : "a") + ">";
  }
  // The 40 px square copy of a card photo (Directions::thumb on the server).
  function thumb(u) { return String(u || "").replace(/^\/venue-photos\/card\//, "/venue-photos/thumb/"); }
  function row(c, sub, o) {
    var open = o && o.sheet ? 'button type="button" data-sheet="' + esc(c.v) + '"' : 'a href="' + esc(c.u) + '"';
    return "<" + open + ' class="skd-row">' + (c.i ? '<img class="skd-row__ph" src="' + esc(thumb(c.i)) + '" alt="" loading="lazy" decoding="async" width="40" height="40">' : '<span class="skd-row__ph"></span>') +
      "<b>" + esc(c.n) + "</b><small>" + sub + "</small></" + (o && o.sheet ? "button" : "a") + ">";
  }
  function tile(href, cover, title, n, hidden) {
    return '<a class="skd-tile" href="' + esc(href) + '"' + (hidden ? " hidden data-skd-more" : "") + ">" +
      (cover ? '<img class="skd-tile__ph" src="' + esc(cover) + '" alt="" loading="lazy" decoding="async" width="320" height="170">' : "") +
      '<span class="skd-tile__t">' + esc(title) + '</span><span class="skd-tile__n">' + clubs(n) + "</span></a>";
  }
  function pickerHtml(d, countKey) {
    var cs = d.cities.filter(function (c) { return c[countKey] > 0; }).sort(function (a, b) { return b[countKey] - a[countKey] || a.name.localeCompare(b.name, "ru"); });
    return '<span class="skd-cp"><button type="button" class="skd-cp__btn" aria-haspopup="listbox" aria-expanded="false">' + esc(cityIn(d, d.city)) +
      '<svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5"/></svg></button><span class="skd-cp__menu" role="listbox" hidden>' +
      cs.map(function (c) { return '<button type="button" role="option" data-city="' + esc(c.slug) + '"' + (c.name === d.city ? ' class="is-on"' : "") + "><span>" + esc(c.name) + "</span><b>" + c[countKey] + "</b></button>"; }).join("") +
      "</span></span>";
  }
  function networkHtml(d, countKey, what) {
    var live = d.cities.filter(function (c) { return c[countKey] > 0; }).sort(function (a, b) { return b[countKey] - a[countKey]; });
    if (live.length < 2) return "";
    var total = live.reduce(function (a, c) { return a + c[countKey]; }, 0);
    var top = live.filter(function (c) { return c.name !== d.city; }).slice(0, 3);
    var rest = live.length - 1 - top.length;
    return '<p class="skd-net">' + esc(what) + " " + (countKey === "n" ? netClubs(total) : clubs(total)) + " в " + live.length + " " + plural(live.length, "городе", "городах", "городах") + ": " +
      top.map(function (c) { return '<button type="button" data-city="' + esc(c.slug) + '">' + esc(c.name) + " " + c[countKey] + "</button>"; }).join(" · ") +
      (rest > 0 ? " и ещё " + rest + " " + plural(rest, "город", "города", "городов") : "") + " — выберите в заголовке.</p>";
  }
  // «Рядом со мной» + «Открыто сейчас» (mirrors partials/boxes.blade.php).
  function boxesHtml(st, list, now, o) {
    var openNow = list.filter(function (c) { return inColl("otkryto-seychas", c, now); });
    var late = list.filter(function (c) { return inColl("dopozdna", c, now); });
    var nightly = openNow.length < Math.min(20, Math.ceil(list.length / 3));
    var firstOpen = nightly && !late.length;
    var timeList = !nightly ? openNow : late.length ? late
      : list.map(function (c) { return { c: c, s: openStatus(c.h, now) }; }).filter(function (x) { return x.s && !x.s.open; })
        .sort(function (a, b) { return (toMin(a.s.text) == null ? 1e9 : toMin(a.s.text)) - (toMin(b.s.text) == null ? 1e9 : toMin(b.s.text)); }).map(function (x) { return x.c; });
    var near = st.from ? list.map(function (c) { return { c: c, m: metersBetween(st.from, c.ll) }; }).sort(function (a, b) { return a.m - b.m; }).slice(0, 6) : [];
    var ro = { sheet: o.sheet };
    return '<div class="skd-nb-row"><div class="skd-nb"><div class="skd-nb__h">Рядом со мной</div>' +
      '<form class="skd-nb__form" action="#"><button type="button" class="skd-nb__me" title="Определить, где я" aria-label="Определить, где я">' + PIN + "</button>" +
      '<input type="search" placeholder="' + (narrow() ? "Адрес, метро" : "Адрес: дом, работа или метро") + '" value="' + esc(st.label === ME ? "" : st.label || "") + '" aria-label="Адрес"><button type="submit">Найти</button></form>' +
      (st.from
        ? near.map(function (x) { return row(x.c, esc((walkMin(x.m) ? walkMin(x.m) + " мин пешком" : fmtDist(x.m)) + (x.c.m ? " · м. " + x.c.m : "")), ro); }).join("") +
          '<a class="skd-nb__all" href="' + o.mapHref + '">Это ' + near.length + " ближайших из " + ofClubs(list.length) + (o.tierNote || "") + " — все на карте ниже ›</a>"
        : '<p class="skd-nb__hint">' + esc(st.note || "Введите адрес или определите место кнопкой слева — покажем ближайшие клубы" + (o.tierNote ? " вашего тарифа" : "") + " и сколько до них идти.") + "</p>") +
      '</div><div class="skd-nb"><div class="skd-nb__h">' + (firstOpen ? "Откроются первыми" : nightly ? "Работают допоздна" : "Открыто сейчас") + (firstOpen ? "" : " <span>" + timeList.length + "</span>") + "</div>" +
      '<div class="skd-nb__open">' + timeList.slice(0, 8).map(function (c) {
        var s = openStatus(c.h, now);
        return row(c, esc((nightly && !firstOpen ? todayHours(c.h, now) : s ? s.text : "") + (c.m ? " · м. " + c.m : "")), ro);
      }).join("") + "</div>" +
      (o.openLinks && !firstOpen && timeList.length > 8 ? '<a class="skd-nb__all" href="' + esc(o.collHref(nightly ? "dopozdna" : "otkryto-seychas")) + '">Все ' + timeList.length + " " + (nightly ? "работающих допоздна" : "открытых сейчас") + " ›</a>" : "") +
      "</div></div>";
  }
  // The near box's two ways in: the phone's place, or an address.
  function wireBoxes(host, st, cityName, redraw) {
    var form = host.querySelector(".skd-nb__form");
    if (!form) return;
    var me = form.querySelector(".skd-nb__me");
    me.addEventListener("click", function () {
      me.classList.add("is-busy");
      locate().then(function (p) { st.from = p; st.label = ME; st.note = ""; redraw(); })
        .catch(function () { st.note = "Не получилось определить, где вы — введите адрес."; redraw(); var i = host.querySelector(".skd-nb__form input"); if (i) i.focus(); })
        .then(function () { me.classList.remove("is-busy"); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = form.querySelector("input").value.trim();
      if (!q) return;
      form.querySelector('button[type="submit"]').textContent = "Ищем…";
      geocode(q, cityName).then(function (p) {
        if (p) { st.from = p; st.label = q; st.note = ""; }
        else { st.from = null; st.label = q; st.note = "Не нашли такой адрес — попробуйте улицу и дом или станцию метро."; }
      }).catch(function () { st.note = "Поиск адреса сейчас недоступен."; }).then(redraw);
    });
  }
  function wirePicker(root, onPick) {
    root.querySelectorAll(".skd-cp").forEach(function (cp) {
      var btn = cp.querySelector(".skd-cp__btn"), menu = cp.querySelector(".skd-cp__menu");
      btn.addEventListener("click", function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute("aria-expanded", String(!menu.hidden)); });
      menu.addEventListener("click", function (e) { var b = e.target.closest("[data-city]"); if (b) { menu.hidden = true; onPick(b.getAttribute("data-city")); } });
    });
    root.querySelectorAll(".skd-net [data-city]").forEach(function (b) { b.addEventListener("click", function () { onPick(b.getAttribute("data-city")); }); });
  }
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".skd-cp__menu:not([hidden])").forEach(function (m) {
      if (!m.parentNode.contains(e.target)) { m.hidden = true; m.parentNode.querySelector(".skd-cp__btn").setAttribute("aria-expanded", "false"); }
    });
  });

  // ── the gallery: swipe, arrows, full screen (the originals) ──────────
  function slideAt(track) { return Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); }
  function wireGallery(root) {
    root.querySelectorAll("[data-gal]").forEach(function (g) {
      var track = g.querySelector(".skd-gal__track");
      var slides = Array.prototype.slice.call(track.querySelectorAll(".skd-gal__slide[data-full]"));
      var full = slides.map(function (s) { return s.getAttribute("data-full"); });
      var count = g.querySelector(".skd-gal__count b");
      track.addEventListener("scroll", function () { if (count) count.textContent = String(slideAt(track) + 1); }, { passive: true });
      function go(dx) { track.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, slideAt(track) + dx)) * track.clientWidth, behavior: "smooth" }); }
      var prev = g.querySelector(".skd-gal__nav--prev"), next = g.querySelector(".skd-gal__nav--next");
      if (prev) prev.addEventListener("click", function () { go(-1); });
      if (next) next.addEventListener("click", function () { go(1); });
      track.addEventListener("click", function (e) { var s = e.target.closest(".skd-gal__slide[data-full]"); if (s) lightbox(full, slides.indexOf(s)); });
    });
  }
  function lightbox(urls, start) {
    var n = urls.length;
    var box = document.createElement("div");
    box.className = "skd-lb";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML = '<div class="skd-lb__track">' + urls.map(function (u) { return '<div class="skd-lb__slide"><img src="' + esc(u) + '" alt="" loading="lazy" draggable="false"></div>'; }).join("") + "</div>" +
      '<button type="button" class="skd-lb__x" aria-label="Закрыть">×</button>' +
      (n > 1 ? '<button type="button" class="skd-lb__nav skd-lb__nav--prev" aria-label="Предыдущее фото">‹</button><button type="button" class="skd-lb__nav skd-lb__nav--next" aria-label="Следующее фото">›</button><span class="skd-lb__count"><b>' + (start + 1) + "</b> / " + n + "</span>" : "");
    document.body.appendChild(box);
    var track = box.querySelector(".skd-lb__track");
    track.scrollLeft = start * track.clientWidth;
    var count = box.querySelector(".skd-lb__count b");
    track.addEventListener("scroll", function () { if (count) count.textContent = String(slideAt(track) + 1); }, { passive: true });
    function go(dx) { track.scrollTo({ left: Math.max(0, Math.min(n - 1, slideAt(track) + dx)) * track.clientWidth, behavior: "smooth" }); }
    // Capture + stop: Esc closes the photos, not the club sheet beneath them.
    function onKey(e) { if (e.key === "Escape") { e.stopPropagation(); close(); } else if (e.key === "ArrowLeft") go(-1); else if (e.key === "ArrowRight") go(1); }
    function close() { box.remove(); document.removeEventListener("keydown", onKey, true); }
    document.addEventListener("keydown", onKey, true);
    box.querySelector(".skd-lb__x").addEventListener("click", close);
    var p = box.querySelector(".skd-lb__nav--prev"), q = box.querySelector(".skd-lb__nav--next");
    if (p) p.addEventListener("click", function () { go(-1); });
    if (q) q.addEventListener("click", function () { go(1); });
    box.addEventListener("click", function (e) { if (e.target === box || e.target.classList.contains("skd-lb__slide")) close(); });
  }

  // ── the home block ────────────────────────────────────────────────────
  // (mirrors directions/partials/home.blade.php)
  function drawHome(el, d, st) {
    var now = mskNow();
    var list = d.clubs;
    var s = stats(d, list, null);
    var few = list.length < FEW;
    var popular = POPULAR.map(function (slug) {
      var f = findSlug(d, slug);
      if (!f) return null;
      var all = list.filter(function (c) { return inDir(c, f.top); }).length;
      var n = f.kid ? list.filter(function (c) { return c.c.indexOf(slug) >= 0; }).length : all;
      if (!n) return null;
      var kid = f.kid && n < all ? f.kid : "";
      return { t: f.title.replace(/\s*\(.*?\)/g, "").trim(), u: dirUrl(f.top.s, d, kid) };
    }).filter(Boolean);
    var chips = Object.keys(COLL).map(function (k) { return { t: COLL[k], u: collUrl(k, d), n: list.filter(function (c) { return inColl(k, c, now); }).length }; });
    var kids = d.tree.filter(function (x) { return x.s === KIDS; })[0];
    if (kids) chips.splice(2, 0, { t: "Для детей", u: dirUrl(KIDS, d), n: list.filter(function (c) { return inDir(c, kids); }).length });
    s = homeTiles(s);
    var heading = el.getAttribute("data-heading") || "h2";
    // /napravleniya (data-all) shows every tile; the home block the first ones and «Все N направлений»
    var lim = el.getAttribute("data-all") === "1" ? Infinity : TILES;
    el.innerHTML =
      '<div class="skd-head"><div><' + heading + ' class="h2 skd-title">Направления ' + pickerHtml(d, "n") + "</" + heading + ">" +
      '<p class="skd-lead">' + clubs(list.length) + " · " + s.length + " " + plural(s.length, "направление", "направления", "направлений") + " · один QR-код для входа в любой</p></div></div>" +
      '<div class="skd-panel"><div class="skd-searchrow"><div class="skd-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>' +
      '<input type="search" placeholder="Бассейн, йога, метро или клуб" aria-label="Поиск по направлениям, клубам и метро" autocomplete="off"><div class="skd-suggest" hidden></div></div></div>' +
      (few
        ? '<div class="skd-cards skd-cards--mini">' + list.map(function (c) { return card(c, now); }).join("") + "</div>"
        : (popular.length ? '<div class="skd-pop"><span class="skd-colls__l">Часто ищут</span>' + popular.map(function (p) { return '<a class="skd-pop__a" href="' + esc(p.u) + '">' + esc(p.t) + "</a>"; }).join("") + "</div>" : "") +
          '<div class="skd-grid">' + s.map(function (x, i) { return tile(dirUrl(x.d.s, d), d.covers[x.d.s], x.d.n, x.n, i >= lim); }).join("") + "</div>" +
          (s.length > lim ? '<button type="button" class="skd-more" data-skd-all="' + s.length + '">Все ' + s.length + " " + plural(s.length, "направление", "направления", "направлений") + "</button>" : "")) +
      '<div class="skd-nb-host"></div>' +
      (chips.some(function (c) { return c.n; }) ? '<div class="skd-colls"><span class="skd-colls__l">Подборки</span>' + chips.filter(function (c) { return c.n; }).map(function (c) { return '<a class="skd-chip" href="' + esc(c.u) + '">' + esc(c.t) + " <b>" + c.n + "</b></a>"; }).join("") + "</div>" : "") +
      networkHtml(d, "n", "СпортКлюч —") + "</div>";
  }
  function initHome(el) {
    var st = { from: null, label: "", note: "" };
    var cur = el.getAttribute("data-city") || "moskva";
    function bind(d) {
      wireSearch(el.querySelector(".skd-search"), d);
      var more = el.querySelector(".skd-more");
      if (more) more.addEventListener("click", function () {
        var grid = el.querySelector(".skd-grid");
        var open = !grid.classList.contains("is-all");
        grid.classList.toggle("is-all", open);
        grid.querySelectorAll("[data-skd-more]").forEach(function (t) { t.hidden = !open; });
        more.textContent = open ? "Свернуть" : "Все " + more.getAttribute("data-skd-all") + " " + plural(+more.getAttribute("data-skd-all"), "направление", "направления", "направлений");
      });
      var host = el.querySelector(".skd-nb-host");
      function drawBoxes() {
        host.innerHTML = boxesHtml(st, d.clubs, mskNow(), { mapHref: document.getElementById("geography-presence") ? "#geography-presence" : "/#geography-presence", openLinks: true, collHref: function (k) { return collUrl(k, d); } });
        wireBoxes(host, st, d.city, function () {
          var nc = st.from && nearestCity(d, st.from);
          if (nc && nc !== cur) switchTo(nc); else drawBoxes();
        });
      }
      drawBoxes();
      wirePicker(el, function (slug) { st.from = null; st.label = ""; st.note = ""; switchTo(slug); });
    }
    function switchTo(slug) {
      load(slug).then(function (d) { cur = slug; drawHome(el, d, st); bind(d); }).catch(function () {});
    }
    load(cur).then(bind).catch(function () {});
  }
  // Suggestions: directions and activities first, then clubs by name or metro.
  function wireSearch(box, d) {
    if (!box) return;
    var input = box.querySelector("input"), out = box.querySelector(".skd-suggest");
    function render() {
      var n = norm(input.value);
      if (n.length < 2) { out.hidden = true; return; }
      var count = function (set) { return d.clubs.filter(function (c) { return c.c.some(function (x) { return set.has(x); }); }).length; };
      var dirs = [];
      d.tree.forEach(function (x) {
        if (norm(x.n).indexOf(n) >= 0) dirs.push({ u: dirUrl(x.s, d), t: x.n, sub: "", n: count(x.set) });
        x.k.forEach(function (k) {
          if (norm(k.t).indexOf(n) >= 0) dirs.push({ u: dirUrl(x.s, d, k.s), t: k.t, sub: x.n, n: count(new Set([k.s].concat(k.g))) });
        });
      });
      var top = dirs.filter(function (x) { return x.n; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 3);
      var cl = d.clubs.filter(function (c) { return norm(c.n).indexOf(n) >= 0 || norm(c.m).indexOf(n) >= 0; }).slice(0, 5);
      out.innerHTML = top.map(function (x) { return '<a class="is-plain" href="' + esc(x.u) + '"><b>' + esc(x.t) + "</b><small>" + (x.sub ? esc(x.sub) + " · " : "") + clubs(x.n) + "</small></a>"; }).join("") +
        cl.map(function (c) { return '<a href="' + esc(c.u) + '">' + (c.i ? '<img class="skd-suggest__ph" src="' + esc(thumb(c.i)) + '" alt="" width="40" height="40">' : '<span class="skd-suggest__ph"></span>') + "<b>" + esc(c.n) + "</b><small>" + (c.m ? "м. " + esc(c.m) : esc(c.a)) + "</small></a>"; }).join("") ||
        '<div class="skd-suggest__none">Ничего не нашли — попробуйте метро или вид спорта</div>';
      out.hidden = false;
    }
    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    input.addEventListener("blur", function () { setTimeout(function () { out.hidden = true; }, 200); });
    out.addEventListener("mousedown", function (e) { e.preventDefault(); });
  }

  // ── the landing block ─────────────────────────────────────────────────
  // (mirrors directions/landing.blade.php) Lists and clubs open over the page:
  // a landing visitor never leaves the tariffs.
  var QUICK = ["do-raboty", "k:" + KIDS, "s-parkovkoj", "sauna-i-hamam", "bassejn-i-sauna", "s-polotencami"];
  function drawLanding(el, d, S) {
    var now = mskNow();
    var tier = S.tier, tierName = tier === "gold" ? "Золото" : "Премиум";
    var inT = d.clubs.filter(function (c) { return inTier(c, tier); });
    var few = inT.length < FEW;
    var kidsDir = d.tree.filter(function (x) { return x.s === KIDS; })[0];
    // ADR 0194 — «Для детей» speaks only for the children's card (directions/landing.blade.php): the clubs it
    // opens on a landing that sells one; nothing at all on a landing that does not.
    var kidsList = S.kidsCard && kidsDir ? d.clubs.filter(function (c) { return inDir(c, kidsDir); }) : [];
    var s = stats(d, d.clubs, tier).map(function (x) { return x.d.s === KIDS ? { d: x.d, n: kidsList.length } : x; })
      .filter(function (x) { return x.n > 0; }).sort(function (a, b) { return b.n - a.n; });
    var quick = QUICK.map(function (k) {
      if (k === "k:" + KIDS) return { key: k, t: "Для детей", list: kidsList, kids: true };
      return { key: "c:" + k, t: COLL[k], list: inT.filter(function (c) { return inColl(k, c, now); }), hours: k === "do-raboty" };
    });
    var pList = [], pTitle = "", pHours = false, pKids = false;
    if (S.panel && S.panel.indexOf("d:") === 0) {
      var dd = d.tree.filter(function (x) { return x.s === S.panel.slice(2); })[0];
      if (dd && dd.s === KIDS) { pList = kidsList.slice(); pTitle = dd.n; pKids = true; }
      else if (dd) { pList = inT.filter(function (c) { return inDir(c, dd); }); pTitle = dd.n; }
    } else if (S.panel) {
      var q = quick.filter(function (x) { return x.key === S.panel; })[0];
      if (q) { pList = q.list.slice(); pTitle = q.t; pHours = !!q.hours; pKids = !!q.kids; }
    }
    if (S.st.from) pList.sort(function (a, b) { return metersBetween(S.st.from, a.ll) - metersBetween(S.st.from, b.ll); });
    else pList.sort(function (a, b) { var sa = openStatus(a.h, now), sb = openStatus(b.h, now); return ((sb && sb.open) ? 1 : 0) - ((sa && sa.open) ? 1 : 0); });
    // A chip's list opens right under the chips; a tile's — under the tiles.
    var max = S.at === "chips" ? 8 : 12;
    var panelHtml = S.panel ? '<div class="skdl-panel"><div class="skdl-panel__h"><b>' + esc(pTitle) + "</b> · " + clubs(pList.length) + (pKids ? " по детской карте" : " в тарифе «" + tierName + "»") +
      (S.st.from ? " · сначала ближайшие " + esc(nearTo(S.st.label)) : "") + '<a href="#vmap"' + (pKids ? ' data-map-card="children"' : "") + '>Показать на карте ›</a><button type="button" class="skdl-panel__x" aria-label="Закрыть">×</button></div>' +
      '<div class="skd-cards skd-cards--mini">' + pList.slice(0, max).map(function (c) { return card(c, now, { from: S.st.from, sheet: true, hours: pHours, kids: pKids }); }).join("") + "</div>" +
      (pList.length > max ? '<p class="skdl-more">И ещё ' + clubs(pList.length - max) + " — все на карте ниже.</p>" : "") + "</div>" : "";
    var fewList = S.st.from ? inT.slice().sort(function (a, b) { return metersBetween(S.st.from, a.ll) - metersBetween(S.st.from, b.ll); }) : inT;
    el.innerHTML =
      '<div class="skdl-top"><div class="skdl-q">Что открывает ваша подписка ' + pickerHtml(d, tier === "gold" ? "gold" : "n") + "</div>" +
      (S.tiers.length > 1 ? '<div class="skdl-tabs" role="tablist">' + S.tiers.map(function (t) {
        return '<button type="button" data-tier="' + t + '"' + (t === tier ? ' class="is-on"' : "") + "><b>" + (t === "gold" ? "Золото" : "Премиум") + "</b><span>" + clubs(d.clubs.filter(function (c) { return inTier(c, t); }).length) + "</span></button>";
      }).join("") + "</div>" : "") + "</div>" +
      (few
        ? '<p class="skdl-fewh">' + esc(cap(cityIn(d, d.city))) + " — " + clubs(inT.length) + " в тарифе «" + tierName + "»</p>" +
          '<div class="skd-cards skd-cards--mini">' + fewList.map(function (c) { return card(c, now, { from: S.st.from, sheet: true }); }).join("") + "</div>"
        : '<div class="skdl-quick">' + quick.filter(function (x) { return x.list.length; }).map(function (x) { return '<button type="button" class="skd-chip' + (S.panel === x.key ? " is-on" : "") + '" data-panel="' + x.key + '">' + esc(x.t) + " <b>" + x.list.length + "</b></button>"; }).join("") + "</div>" +
          (S.at === "chips" ? panelHtml : "") +
          '<div class="skdl-grid">' + s.map(function (x) {
            return '<button type="button" class="skd-tile skdl-tile' + (S.panel === "d:" + x.d.s ? " is-open" : "") + '" data-panel="d:' + x.d.s + '">' +
              (d.covers[x.d.s] ? '<img class="skd-tile__ph" src="' + esc(d.covers[x.d.s]) + '" alt="" loading="lazy" decoding="async" width="320" height="170">' : "") +
              '<span class="skd-tile__t">' + esc(x.d.n) + '</span><span class="skd-tile__n">' + clubs(x.n) + "</span></button>";
          }).join("") +
          '<a class="skd-tile skdl-tile skdl-tile--map" href="#vmap"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z"/><path d="M9 4v13M15 6.5v13"/></svg><span class="skd-tile__t">Все на карте</span><span class="skd-tile__n">' + clubs(inT.length) + " ›</span></a></div>" +
          (S.at === "tiles" ? panelHtml : "")) +
      boxesHtml(S.st, inT, now, { sheet: true, mapHref: "#vmap", tierNote: " тарифа «" + tierName + "»" }) +
      networkHtml(d, tier === "gold" ? "gold" : "n", "Подписка «" + tierName + "» —");
  }
  function initLanding(el) {
    var S = {
      tier: el.getAttribute("data-tier") || "gold",
      tiers: (el.getAttribute("data-tiers") || "gold,premium").split(","),
      kidsCard: el.getAttribute("data-kids-card") === "1",
      panel: null, at: "tiles", st: { from: null, label: "", note: "" }
    };
    var cur = el.getAttribute("data-city") || "moskva";
    var d = null;
    function redraw() { drawLanding(el, d, S); bind(); }
    function toCity(slug) {
      if (slug === cur) return;
      load(slug).then(function (nd) { cur = slug; d = nd; S.panel = null; redraw(); }).catch(function () {});
    }
    function bind() {
      el.querySelectorAll(".skdl-tabs [data-tier]").forEach(function (b) { b.addEventListener("click", function () { S.tier = b.getAttribute("data-tier"); S.panel = null; redraw(); }); });
      el.querySelectorAll("[data-panel]").forEach(function (b) {
        b.addEventListener("click", function () {
          var key = b.getAttribute("data-panel");
          S.at = b.closest(".skdl-quick") ? "chips" : "tiles";
          S.panel = S.panel === key ? null : key;
          redraw();
          var p = el.querySelector(".skdl-panel");
          if (p) p.scrollIntoView({ block: "nearest", behavior: "smooth" });
        });
      });
      var x = el.querySelector(".skdl-panel__x");
      if (x) x.addEventListener("click", function () { S.panel = null; redraw(); });
      el.querySelectorAll("[data-sheet]").forEach(function (b) { b.addEventListener("click", function () { openSheet(d.byVid[b.getAttribute("data-sheet")], d); }); });
      wirePicker(el, toCity);
      // A new place re-sorts the lists; a place in another city moves the block there.
      wireBoxes(el, S.st, d.city, function () { var nc = S.st.from && nearestCity(d, S.st.from); if (nc && nc !== cur) toCity(nc); else redraw(); });
    }
    load(cur).then(function (nd) { d = nd; bind(); }).catch(function () {});
  }
  // A club over the landing — its photos come when it is opened.
  function openSheet(c, d) {
    if (!c) return;
    var now = mskNow(), s = openStatus(c.h, now);
    var hours = [["Пн–Пт", c.h[0], c.h[1]], ["Суббота"].concat(hoursOf(c.h, 6)), ["Воскресенье"].concat(hoursOf(c.h, 0))]
      .filter(function (h) { return toMin(h[1]) != null && toMin(h[2]) != null; })
      .map(function (h) { return "<li><span>" + h[0] + "</span><b>" + ((toMin(h[2]) - toMin(h[1])) % 1440 === 0 ? "круглосуточно" : esc(h[1]) + "–" + esc(h[2])) + "</b></li>"; }).join("");
    var dirs = d.tree.filter(function (x) { return inDir(c, x); }).map(function (x) { return "<span>" + esc(x.n) + "</span>"; }).join("");
    var amen = c.am.map(function (a) { return AMEN[a]; }).filter(Boolean).map(function (a) { return "<span>" + esc(a) + "</span>"; }).join("");
    var route = "https://yandex.ru/maps/?rtext=~" + c.ll[1] + "," + c.ll[0] + "&rtt=auto";
    var wrap = document.createElement("div");
    wrap.className = "skd-sheet";
    wrap.innerHTML = '<div class="skd-sheet__box" role="dialog" aria-modal="true" aria-label="' + esc(c.n) + '"><button type="button" class="skd-sheet__x" aria-label="Закрыть">×</button>' +
      '<div class="skd-club__hero skd-sheet__hero"><div class="skd-gal" data-gal><div class="skd-gal__track">' +
      (c.i ? '<span class="skd-gal__slide"><img src="' + esc(c.i) + '" alt="" draggable="false"></span>' : '<span class="skd-gal__slide"></span>') + "</div></div>" +
      '<div class="skd-club__in">' + (c.l ? '<img class="skd-club__logo" src="' + esc(c.l) + '" alt="" width="76" height="76">' : "") +
      '<div><h3 class="skd-club__n">' + esc(c.n) + '</h3><div class="skd-club__m">' + (c.m ? "м. " + esc(c.m) + " · " : "") + esc(c.a) + "</div>" +
      '<div class="skd-club__pills">' + (s ? '<span class="skd-pill' + (s.open ? " is-open" : "") + '">' + esc(s.text) + "</span>" : "") + '<span class="skd-pill skd-pill--' + c.t + '">' + tierText(c) + "</span></div></div></div></div>" +
      '<div class="skd-sheet__body"><div class="skd-club__grid">' +
      '<div class="skd-box"><h4 class="skd-box__h">Часы работы</h4><ul class="skd-hours">' + (hours || "<li>Уточняйте в клубе</li>") + "</ul></div>" +
      '<div class="skd-box"><h4 class="skd-box__h">Направления</h4><div class="skd-tags">' + dirs + "</div></div>" +
      '<div class="skd-box"><h4 class="skd-box__h">Удобства</h4>' + (amen ? '<div class="skd-tags skd-tags--plain">' + amen + "</div>" : "<p>Уточняйте в клубе</p>") + "</div></div>" +
      '<div class="skd-club__acts"><a class="skd-btn skd-btn--gold" href="#cards" data-close>Выбрать тариф</a><a class="skd-btn skd-btn--ghost" href="' + route + '" target="_blank" rel="noopener">Маршрут</a></div></div></div>';
    function onKey(e) { if (e.key === "Escape") close(); }
    function close() { wrap.classList.remove("is-shown"); setTimeout(function () { wrap.remove(); }, 220); document.removeEventListener("keydown", onKey); }
    wrap.addEventListener("click", function (e) { if (e.target === wrap || e.target.closest(".skd-sheet__x") || e.target.closest("[data-close]")) close(); });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(wrap);
    void wrap.offsetWidth; // the slide-in from the first frame (rAF sleeps in a background tab)
    wrap.classList.add("is-shown");
    if (c.gn > 0) {
      getJSON("/api/directions/gallery/" + encodeURIComponent(c.v)).then(function (j) {
        var photos = (j && j.photos) || [];
        if (!photos.length || !document.body.contains(wrap)) return;
        var g = wrap.querySelector("[data-gal]");
        g.innerHTML = '<div class="skd-gal__track">' + photos.map(function (p, i) {
          return '<button type="button" class="skd-gal__slide" data-full="' + esc(p.f) + '" aria-label="' + esc(c.n) + ": фото " + (i + 1) + " из " + photos.length + '"><img src="' + esc(p.s) + '" alt=""' + (i ? ' loading="lazy"' : "") + ' decoding="async" draggable="false"></button>';
        }).join("") + "</div>" + (photos.length > 1 ? '<button type="button" class="skd-gal__nav skd-gal__nav--prev" aria-label="Предыдущее фото">‹</button><button type="button" class="skd-gal__nav skd-gal__nav--next" aria-label="Следующее фото">›</button><span class="skd-gal__count"><b>1</b> / ' + photos.length + "</span>" : "");
        wireGallery(wrap);
      }).catch(function () {});
    }
  }

  // ── a list page: filters over the server-rendered cards ───────────────
  function initList(el) {
    var cards = Array.prototype.slice.call(el.querySelectorAll(".skd-cards > .skd-card"));
    if (!cards.length) return;
    var order = cards.slice();
    var S = { kid: "", tier: "", open: false, age: "", from: null, label: "" };
    var on = el.querySelector(".skd-kids .is-on");
    if (on) S.kid = on.getAttribute("data-kid") || "";
    // ADR 0194 — a branch the link chose stays in sight on the swipeable line.
    var kidRow = el.querySelector(".skd-kids--swipe");
    if (kidRow && on && S.kid) kidRow.scrollLeft = Math.max(0, on.getBoundingClientRect().left - kidRow.getBoundingClientRect().left + kidRow.scrollLeft - 20);
    var now = mskNow();
    var info = cards.map(function (c) {
      var ll = (c.getAttribute("data-ll") || "").split(",").map(Number);
      var h = [];
      try { h = JSON.parse(c.getAttribute("data-h") || "[]"); } catch (e) { h = []; }
      var st = h.length ? openStatus(h, now) : null;
      // ADR 0194 — the children's page: the ages its classes cover.
      var ages = (c.getAttribute("data-ages") || "").split(";").filter(Boolean).map(function (r) { var p = r.split("-"); return [+p[0], +p[1]]; });
      return { el: c, cats: (c.getAttribute("data-cats") || "").split(" "), tier: c.getAttribute("data-tier"), ages: ages, ll: ll.length === 2 && !isNaN(ll[0]) ? ll : null, open: !!(st && st.open), m: c.querySelector(".skd-card__m") };
    });
    // «7–10 лет»: a club is in the group when one of its classes overlaps it (Directions::inAge).
    function inAge(x, key) {
      if (!key) return true;
      var b = key.split("-"), lo = +b[0], hi = +b[1];
      return x.ages.some(function (r) { return r[0] <= hi && r[1] >= lo; });
    }
    function inTierX(x) { return !S.tier || S.tier === "premium" || x.tier === "gold"; }
    info.forEach(function (x) { x.m0 = x.m ? x.m.textContent : ""; });
    var seg = el.querySelector(".skd-seg");
    var addr = el.querySelector(".skd-seg__addr");
    function apply() {
      info.forEach(function (x) {
        x.el.hidden = !((!S.kid || x.cats.indexOf(S.kid) >= 0) && inTierX(x) && inAge(x, S.age) && (!S.open || x.open));
        if (x.m) x.m.textContent = x.m0 + (S.from && x.ll ? " · " + farText(metersBetween(S.from, x.ll)) : "");
      });
      var grid = el.querySelector(".skd-cards");
      var sorted = S.from ? info.slice().sort(function (a, b) { return (a.ll ? metersBetween(S.from, a.ll) : 1e12) - (b.ll ? metersBetween(S.from, b.ll) : 1e12); }).map(function (x) { return x.el; }) : order;
      sorted.forEach(function (c) { grid.appendChild(c); });
      if (seg) {
        var near = seg.querySelector(".skd-seg__near"), from = seg.querySelector(".skd-from");
        if (S.from) {
          if (near) near.hidden = true;
          if (!from) { from = document.createElement("span"); from.className = "skd-from"; seg.appendChild(from); }
          from.innerHTML = "Сначала ближайшие <b>" + esc(nearTo(S.label)) + '</b><button type="button" aria-label="Сбросить">×</button>';
          from.querySelector("button").addEventListener("click", function () { S.from = null; S.label = ""; apply(); });
        } else {
          if (near) near.hidden = false;
          if (from) from.remove();
        }
      }
    }
    el.querySelectorAll(".skd-kids [data-kid]").forEach(function (b) {
      b.addEventListener("click", function () {
        S.kid = b.getAttribute("data-kid") || "";
        el.querySelectorAll(".skd-kids [data-kid]").forEach(function (x) { x.classList.toggle("is-on", x === b); });
        apply();
      });
    });
    // ADR 0194 — «Возраст»: one button whose menu holds the age groups (owner, 20.10: the
    // chips took three rows on a phone). The picked group names the button.
    var agem = el.querySelector("[data-agem]");
    if (agem) {
      var ageBtn = agem.querySelector("[data-agem-btn]"), ageMenu = agem.querySelector("[data-agem-menu]"), ageLab = agem.querySelector("[data-agem-label]");
      var ageOpen = function (o) { ageMenu.hidden = !o; ageBtn.setAttribute("aria-expanded", o ? "true" : "false"); };
      ageBtn.addEventListener("click", function (e) { e.stopPropagation(); ageOpen(ageMenu.hidden); });
      document.addEventListener("click", function (e) { if (!agem.contains(e.target)) ageOpen(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") ageOpen(false); });
      ageMenu.querySelectorAll("[data-age]").forEach(function (b) {
        b.addEventListener("click", function () {
          S.age = b.getAttribute("data-age") || "";
          ageMenu.querySelectorAll("[data-age]").forEach(function (x) { x.classList.toggle("is-on", x === b); });
          ageLab.textContent = S.age ? b.firstChild.textContent.trim() : ageLab.getAttribute("data-agem-label");
          ageBtn.classList.toggle("is-on", !!S.age);
          ageOpen(false);
          apply();
        });
      });
    }
    if (seg) {
      seg.querySelectorAll("[data-tier]").forEach(function (b) {
        b.addEventListener("click", function () {
          S.tier = b.getAttribute("data-tier") || "";
          seg.querySelectorAll("[data-tier]").forEach(function (x) { x.classList.toggle("is-on", x === b); });
          apply();
        });
      });
      var chk = seg.querySelector("[data-open]");
      if (chk) chk.addEventListener("change", function () { S.open = chk.checked; apply(); });
      var me = seg.querySelector(".skd-seg__near");
      if (me) me.addEventListener("click", function () {
        me.classList.add("is-busy");
        locate().then(function (p) { S.from = p; S.label = ME; if (addr) addr.hidden = true; apply(); })
          .catch(function () { if (addr) { addr.hidden = false; addr.querySelector("input").focus(); } })
          .then(function () { me.classList.remove("is-busy"); });
      });
    }
    if (addr) addr.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = addr.querySelector("input").value.trim();
      if (!q) return;
      geocode(q, el.getAttribute("data-city-name") || "Москва").then(function (p) {
        if (p) { S.from = p; S.label = q; addr.hidden = true; apply(); }
        else addr.querySelector("span").textContent = "Не нашли такой адрес — попробуйте улицу и дом или станцию метро:";
      }).catch(function () { addr.querySelector("span").textContent = "Поиск адреса сейчас недоступен."; });
    });
  }
  // ── the club page ─────────────────────────────────────────────────────
  function initClub(el) {
    wireGallery(el);
    var share = el.querySelector(".skd-share");
    if (share) share.addEventListener("click", function () {
      var title = (el.querySelector(".skd-club__n") || {}).textContent || document.title;
      var data = { title: title, text: title + " — по корпоративной карте СпортКлюч", url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { share.textContent = "Ссылка скопирована"; }).catch(function () { window.prompt("Ссылка на клуб:", location.href); });
      else window.prompt("Ссылка на клуб:", location.href);
    });
    installQr(el.querySelector(".skd-qr"));
  }
  // A QR for the install page — only where the camera is another device (a computer).
  function installQr(box) {
    if (!box || !window.matchMedia("(min-width: 900px) and (hover: hover)").matches) return;
    function draw() {
      window.SKQR.toDataURL(INSTALL, { margin: 1, width: 168, color: { dark: "#15163b", light: "#ffffff" } })
        .then(function (u) { box.querySelector("img").src = u; box.hidden = false; }).catch(function () {});
    }
    if (window.SKQR) { draw(); return; }
    var s = document.createElement("script");
    s.src = "/js/qrcode-sk.min.js?v=1";
    s.onload = function () { if (window.SKQR) draw(); };
    document.head.appendChild(s);
  }

  // ── boot ──────────────────────────────────────────────────────────────
  function boot() {
    document.querySelectorAll("[data-skd]").forEach(function (el) {
      if (el.__skd) return;
      el.__skd = 1;
      var kind = el.getAttribute("data-skd");
      try {
        if (kind === "home") initHome(el);
        else if (kind === "landing") initLanding(el);
        else if (kind === "list") initList(el);
        else if (kind === "club") initClub(el);
      } catch (e) { /* one block failing leaves the server-rendered page as it is */ }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
