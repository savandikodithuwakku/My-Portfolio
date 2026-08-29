/* Portfolio interactions, no dependencies. */
(function () {
  'use strict';

  var EMAIL = 'savandikodithuwakku@gmail.com';

  /* ---- Optional hosted form endpoint -------------------------------
     Empty = the form opens the visitor's mail app with the message
     pre-filled. To receive messages in your inbox instead, create a free
     endpoint at https://formspree.io or https://web3forms.com and paste
     the URL here, e.g. 'https://formspree.io/f/xxxxxxx'.
  ------------------------------------------------------------------- */
  var FORM_ENDPOINT = '';

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var links = document.getElementById('nav-links');

  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- sticky header ---------- */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 10);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- reveal on scroll ---------- */
  var targets = document.querySelectorAll(
    '.head, .about__text, .card, .proj, .mini, .stats > div, .time li, ' +
    '.lead-list, .awards li, .certs li, .contact__side, .form, .subhead'
  );

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 5) * 60 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- active link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- copy email ---------- */
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('is-done');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('is-done');
        }, 1800);
      };
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { /* ignore */ }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
    });
  });

  /* ---------- contact form ---------- */
  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('cf-status');
  var sendBtn = document.getElementById('cf-send');
  var defaultNote = status ? status.textContent : '';

  var rules = {
    name: function (v) { return v.length >= 2 ? '' : 'Please enter your name.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address.'; },
    subject: function (v) { return v.length >= 3 ? '' : 'Please add a short subject.'; },
    message: function (v) { return v.length >= 10 ? '' : 'A few more words, please.'; }
  };

  function validate(input) {
    var rule = rules[input.name];
    if (!rule) return true;
    var msg = rule(input.value.trim());
    var wrap = input.closest('.field');
    var err = wrap ? wrap.querySelector('.err') : null;
    if (wrap) wrap.classList.toggle('is-bad', !!msg);
    if (err) err.textContent = msg;
    return !msg;
  }

  form.querySelectorAll('input, textarea').forEach(function (input) {
    input.addEventListener('blur', function () { validate(input); });
    input.addEventListener('input', function () {
      var wrap = input.closest('.field');
      if (wrap && wrap.classList.contains('is-bad')) validate(input);
    });
  });

  function setNote(text, kind) {
    if (!status) return;
    status.textContent = text;
    status.classList.remove('is-ok', 'is-bad');
    if (kind) status.classList.add(kind);
  }

  function openMailClient(data) {
    var body = data.message + '\n\n---\nFrom: ' + data.name + '\nEmail: ' + data.email;
    window.location.href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(data.subject) +
      '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var inputs = Array.prototype.slice.call(form.querySelectorAll('input, textarea'));
    if (!inputs.map(validate).every(Boolean)) {
      setNote('Please correct the highlighted fields.', 'is-bad');
      var bad = form.querySelector('.field.is-bad input, .field.is-bad textarea');
      if (bad) bad.focus();
      return;
    }

    var data = {};
    inputs.forEach(function (i) { data[i.name] = i.value.trim(); });

    if (FORM_ENDPOINT) {
      sendBtn.disabled = true;
      setNote('Sending…');
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('failed');
        form.reset();
        setNote('Message sent, thank you. I’ll reply within a day.', 'is-ok');
      }).catch(function () {
        openMailClient(data);
        setNote('Opening your mail app instead. Press send there.', 'is-ok');
      }).then(function () { sendBtn.disabled = false; });
      return;
    }

    openMailClient(data);
    setNote('Your mail app is opening. Press send there.', 'is-ok');
    setTimeout(function () { setNote(defaultNote); }, 9000);
  });
})();

/* Motion layer: rotating role, button ripples, counting stats. */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- typewriter role rotator ---------- */
  var roleEl = document.getElementById('type-txt');
  var ROLES = [
    'Software Engineering Undergraduate',
    'Full Stack Developer',
    'AI & LLM Enthusiast',
    'Technical Content Writer',
    'Problem Solver',
    'React · Node · Django',
    'Open to Internships'
  ];

  if (roleEl && !reduced) {
    var idx = 0, pos = 0, deleting = false;
    var step = function () {
      var word = ROLES[idx];
      pos += deleting ? -1 : 1;
      roleEl.textContent = word.slice(0, pos);

      var wait = deleting ? 34 : 62;
      if (!deleting && pos === word.length) { wait = 1900; deleting = true; }
      else if (deleting && pos === 0) { deleting = false; idx = (idx + 1) % ROLES.length; wait = 320; }
      setTimeout(step, wait);
    };
    roleEl.textContent = '';
    setTimeout(step, 700);
  }

  /* ---------- click ripple on buttons and pills ---------- */
  if (!reduced) {
    document.addEventListener('pointerdown', function (e) {
      var host = e.target.closest('.btn, .copy, .contact__social a, .hero__social a');
      if (!host) return;

      var box = host.getBoundingClientRect();
      var size = Math.max(box.width, box.height) * 2.2;
      var dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.width = dot.style.height = size + 'px';
      dot.style.left = (e.clientX - box.left) + 'px';
      dot.style.top = (e.clientY - box.top) + 'px';

      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.appendChild(dot);
      setTimeout(function () { dot.remove(); }, 640);
    }, { passive: true });
  }

  /* ---------- stats count up when they scroll into view ---------- */
  var nums = document.querySelectorAll('.stats b');
  if (nums.length && 'IntersectionObserver' in window && !reduced) {
    var run = function (el) {
      var raw = el.textContent.trim();
      var match = raw.match(/^([\d.]+)(.*)$/);
      if (!match) return;

      var target = parseFloat(match[1]);
      var suffix = match[2];
      var decimals = (match[1].split('.')[1] || '').length;
      var start = performance.now();
      var DUR = 1100;

      var frame = function (now) {
        var t = Math.min((now - start) / DUR, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };

    var counter = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        counter.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (n) { counter.observe(n); });
  }
})();
