// Temporary copy of the site (static hosting while the main hosting is restored): nothing can be
// sent from here, so every form and every POST answers with the phone and e-mail instead of
// failing silently.
(function () {
  var TEXT = 'Отправка заявок с сайта временно не работает. Позвоните нам: ' +
    '<a href="tel:+79932772708">+7 993 277-27-08</a> или напишите: ' +
    '<a href="mailto:team@sportskey.ru">team@sportskey.ru</a>.';

  function show() {
    var old = document.getElementById('sk-temp-notice');
    if (old) { old.remove(); }
    var wrap = document.createElement('div');
    wrap.id = 'sk-temp-notice';
    wrap.setAttribute('role', 'alertdialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(46,36,22,.45);padding:16px;font-family:Montserrat,-apple-system,Segoe UI,Roboto,sans-serif';
    wrap.innerHTML =
      '<div style="background:#FAF6EF;color:#1D1F3A;max-width:420px;width:100%;border-radius:18px;padding:24px 22px;' +
      'box-shadow:0 18px 50px rgba(46,36,22,.25);font-size:16px;line-height:1.5">' +
      '<p style="margin:0 0 18px">' + TEXT + '</p>' +
      '<button type="button" style="font:inherit;font-weight:700;border:0;border-radius:12px;padding:12px 20px;' +
      'background:#1D1F76;color:#fff;cursor:pointer">Понятно</button></div>';
    var links = wrap.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) { links[i].style.cssText = 'color:#1D1F76;font-weight:700;white-space:nowrap'; }
    function close() { wrap.remove(); document.removeEventListener('keydown', onKey, true); }
    function onKey(e) { if (e.key === 'Escape') { close(); } }
    wrap.addEventListener('click', function (e) { if (e.target === wrap || e.target.tagName === 'BUTTON') { close(); } });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(wrap);
    wrap.querySelector('button').focus();
  }

  function sameOrigin(u) {
    if (!u) { return true; }
    try { return new URL(u, location.href).origin === location.origin; } catch (e) { return true; }
  }

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && f.method && f.method.toLowerCase() === 'get' && sameOrigin(f.action)) { return; } // search forms
    e.preventDefault();
    e.stopImmediatePropagation();
    show();
  }, true);

  if (window.fetch) {
    var realFetch = window.fetch;
    window.fetch = function (input, init) {
      var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      var url = typeof input === 'string' ? input : (input && input.url);
      if (method !== 'GET' && method !== 'HEAD' && sameOrigin(url)) {
        show();
        return Promise.reject(new Error('sending is off on the temporary site'));
      }
      return realFetch.apply(this, arguments);
    };
  }

  var realOpen = XMLHttpRequest.prototype.open;
  var realSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__skBlocked = String(method).toUpperCase() !== 'GET' && sameOrigin(url);
    return realOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    if (this.__skBlocked) { show(); return; }
    return realSend.apply(this, arguments);
  };
})();
