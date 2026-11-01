/* FX layer: Lenis smooth scroll, Three.js 4D galaxy, tilt, magnetic, cursor, ripple. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var coarse = !fine;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  var state = { scroll: 0, progress: 0, mx: 0, my: 0, smx: 0, smy: 0, vh: window.innerHeight };

  /* ---------- Lenis ---------- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    var menu = document.getElementById('nav-menu');
    if (menu) menu.setAttribute('data-lenis-prevent', '');
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      var target = id.length > 1 ? document.querySelector(id) : null;
      if (id === '#' || id === '#home') { e.preventDefault(); lenis.scrollTo(0, { duration: 1.4 }); }
      else if (target) { e.preventDefault(); lenis.scrollTo(target, { duration: 1.4 }); }
    });
  }

  /* ---------- WebGL galaxy ---------- */
  var canvas = document.getElementById('fx-bg');
  var gl = null;
  if (canvas && window.THREE) {
    try { gl = initGalaxy(canvas); } catch (err) { gl = null; if (canvas) canvas.style.display = 'none'; }
  }

  function initGalaxy(canvas) {
    var mobile = window.innerWidth < 768;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    var dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x05050f, 1);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.6, 6.5);

    var vert = [
      'attribute float aW; attribute float aRand; attribute vec3 aColor;',
      'uniform float uTime, uPixel, uSize, uSpin, uMorph;',
      'varying vec3 vColor; varying float vA;',
      'void main(){',
      '  vec3 p = position;',
      '  float r = length(p.xz);',
      '  float a = uTime * uSpin / (0.7 + r);',
      '  float c = cos(a), s = sin(a);',
      '  p.xz = vec2(c*p.x - s*p.z, s*p.x + c*p.z);',
      '  float th = uMorph;',                                    /* x-w plane rotation (4th dimension) */
      '  float x4 = p.x*cos(th) - aW*sin(th);',
      '  float w4 = p.x*sin(th) + aW*cos(th);',
      '  p.x = x4;',
      '  p *= 4.0 / (4.0 - clamp(w4, -2.5, 2.5) * 0.55);',        /* 4D -> 3D perspective projection */
      '  p.y += sin(uTime*0.6 + aRand*20.0 + r*2.0) * 0.035;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  gl_PointSize = uSize * uPixel * (0.45 + aRand) * (1.0 / -mv.z);',
      '  vColor = aColor;',
      '  vA = 0.55 + 0.45 * sin(uTime*1.6 + aRand*60.0);',
      '}'
    ].join('\n');
    var frag = [
      'precision mediump float;',
      'varying vec3 vColor; varying float vA;',
      'void main(){',
      '  float d = length(gl_PointCoord - 0.5);',
      '  if (d > 0.5) discard;',
      '  float k = pow(1.0 - d*2.0, 2.0);',
      '  gl_FragColor = vec4(vColor * k * vA, 1.0);',
      '}'
    ].join('\n');

    function layer(n, build, uniforms) {
      var pos = new Float32Array(n * 3), col = new Float32Array(n * 3), w = new Float32Array(n), rnd = new Float32Array(n);
      var tmp = { x: 0, y: 0, z: 0, w: 0, r: 0, g: 0, b: 0 };
      for (var i = 0; i < n; i++) {
        build(i, n, tmp);
        pos[i * 3] = tmp.x; pos[i * 3 + 1] = tmp.y; pos[i * 3 + 2] = tmp.z;
        col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
        w[i] = tmp.w; rnd[i] = Math.random();
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
      g.setAttribute('aW', new THREE.BufferAttribute(w, 1));
      g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
      var u = { uTime: { value: 0 }, uPixel: { value: dpr * 10 }, uSize: { value: uniforms.size }, uSpin: { value: uniforms.spin }, uMorph: { value: 0 } };
      var m = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      var pts = new THREE.Points(g, m);
      pts.frustumCulled = false;
      scene.add(pts);
      return { pts: pts, u: u, n: n };
    }

    var inner = new THREE.Color('#ffa86b'), mid = new THREE.Color('#b36bff'), outer = new THREE.Color('#4f6bff'), cc = new THREE.Color();
    var galaxy = layer(mobile ? 22000 : 55000, function (i, n, o) {
      var R = 5.2, arms = 3;
      var r = Math.pow(Math.random(), 1.7) * R;
      var branch = (i % arms) / arms * Math.PI * 2;
      var ang = branch + r * 1.15;
      var spread = Math.pow(Math.random(), 3) * (0.35 + r * 0.12);
      var sx = (Math.random() < .5 ? -1 : 1) * spread, sy = (Math.random() < .5 ? -1 : 1) * spread * 0.35, sz = (Math.random() < .5 ? -1 : 1) * spread;
      o.x = Math.cos(ang) * r + sx; o.y = sy; o.z = Math.sin(ang) * r + sz;
      o.w = (Math.random() - 0.5) * 2.2;
      var t = r / R;
      cc.copy(inner).lerp(mid, clamp(t * 1.6, 0, 1)).lerp(outer, clamp((t - 0.45) * 1.8, 0, 1));
      var b = 0.9 - t * 0.35;
      o.r = cc.r * b; o.g = cc.g * b; o.b = cc.b * b;
    }, { size: mobile ? 2.6 : 2.2, spin: 0.35 });

    var stars = layer(mobile ? 1200 : 3000, function (i, n, o) {
      var r = 14 + Math.random() * 30, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      o.x = r * Math.sin(ph) * Math.cos(th); o.y = r * Math.cos(ph); o.z = r * Math.sin(ph) * Math.sin(th);
      o.w = (Math.random() - 0.5) * 2;
      var v = 0.5 + Math.random() * 0.5; o.r = v * 0.8; o.g = v * 0.85; o.b = v;
    }, { size: 3.2, spin: 0.01 });

    galaxy.pts.rotation.x = 0.35;

    var cam = { z: 6.5, y: 1.6, rotY: 0, rotX: 0.35 };
    var slow = 0, frames = 0, lastW = window.innerWidth;

    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      if (w === lastW && Math.abs(h - state.vh) < 120) return;   /* ignore mobile URL-bar resizes */
      lastW = w; state.vh = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize, { passive: true });

    return {
      render: function (t, dt) {
        var sp = reduce ? 0.15 : 1;
        var tt = t * sp;
        galaxy.u.uTime.value = tt; stars.u.uTime.value = tt;
        var morph = Math.sin(tt * 0.18) * 0.35 + state.progress * 1.8;
        galaxy.u.uMorph.value = morph; stars.u.uMorph.value = morph * 0.3;

        /* scroll flies the camera through the galaxy; pointer orbits it */
        cam.z = lerp(cam.z, 6.5 - state.progress * 3.2, 0.06);
        cam.y = lerp(cam.y, 1.6 - state.progress * 1.2, 0.06);
        cam.rotY = lerp(cam.rotY, state.progress * Math.PI * 1.2 + state.smx * 0.35, 0.05);
        cam.rotX = lerp(cam.rotX, 0.35 + state.progress * 0.5 + state.smy * 0.2, 0.05);
        camera.position.z = cam.z; camera.position.y = cam.y;
        camera.lookAt(0, 0, 0);
        galaxy.pts.rotation.y = cam.rotY; galaxy.pts.rotation.x = cam.rotX;
        stars.pts.rotation.y = cam.rotY * 0.3 + tt * 0.004;
        renderer.render(scene, camera);

        /* adaptive quality: shed particles / resolution when frames run long */
        frames++;
        slow = dt > 0.03 ? slow + 1 : Math.max(0, slow - 1);
        if (slow > 45 && frames > 90) {
          slow = 0;
          if (galaxy.pts.geometry.drawRange.count === Infinity || galaxy.pts.geometry.drawRange.count > galaxy.n * 0.35) {
            galaxy.pts.geometry.setDrawRange(0, Math.floor((galaxy.pts.geometry.drawRange.count === Infinity ? galaxy.n : galaxy.pts.geometry.drawRange.count) * 0.7));
          }
          dpr = Math.max(0.75, dpr - 0.25);
          renderer.setPixelRatio(dpr);
          renderer.setSize(window.innerWidth, window.innerHeight, false);
          galaxy.u.uPixel.value = stars.u.uPixel.value = dpr * 10;
        }
      }
    };
  }

  /* ---------- pointer / scroll state ---------- */
  window.addEventListener('pointermove', function (e) {
    state.mx = e.clientX / window.innerWidth * 2 - 1;
    state.my = e.clientY / window.innerHeight * 2 - 1;
    cur.x = e.clientX; cur.y = e.clientY;
  }, { passive: true });

  function readScroll() {
    state.scroll = lenis ? lenis.scroll : (window.pageYOffset || 0);
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    state.progress = clamp(state.scroll / max, 0, 1);
  }

  /* ---------- cursor ---------- */
  var dot = document.querySelector('.fx-cursor-dot'), ring = document.querySelector('.fx-cursor-ring');
  var cur = { x: -100, y: -100, rx: -100, ry: -100 };
  if (fine && !reduce && dot && ring) {
    doc.classList.add('fx-cursor');
    var hoverSel = 'a, button, .skills__header, [data-target], .swiper-button-next, .swiper-button-prev, input, textarea';
    document.addEventListener('pointerover', function (e) { if (e.target.closest && e.target.closest(hoverSel)) ring.classList.add('is-hover'); });
    document.addEventListener('pointerout', function (e) { if (e.target.closest && e.target.closest(hoverSel)) ring.classList.remove('is-hover'); });
    document.addEventListener('pointerdown', function () { ring.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { ring.classList.remove('is-down'); });
  }

  /* ---------- ripple (mouse + touch) ---------- */
  if (!reduce) {
    document.addEventListener('pointerdown', function (e) {
      var r = document.createElement('span');
      r.className = 'fx-ripple';
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      r.addEventListener('animationend', function () { r.remove(); });
    }, { passive: true });
  }

  /* ---------- 3D tilt ---------- */
  if (!reduce) {
    document.querySelectorAll('.project__img, .qualification__card, .home__blob, .about__img').forEach(function (el) {
      var max = el.classList.contains('qualification__card') ? 7 : 12;
      el.classList.add('fx-tilt');
      var raf = 0, rx = 0, ry = 0;
      function apply() { raf = 0; el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) scale3d(1.03,1.03,1.03)'; }
      function move(e) {
        if (e.pointerType === 'touch' && e.buttons === 0 && e.type === 'pointermove' && !el._down) return;
        var b = el.getBoundingClientRect();
        var px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
        ry = px * max * 2; rx = -py * max * 2;
        el.classList.add('is-tilting');
        if (!raf) raf = requestAnimationFrame(apply);
      }
      function reset() {
        el._down = false;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        el.classList.remove('is-tilting');
        el.style.transform = '';
      }
      el.addEventListener('pointerdown', function (e) { el._down = true; move(e); }, { passive: true });
      el.addEventListener('pointermove', move, { passive: true });
      ['pointerleave', 'pointerup', 'pointercancel'].forEach(function (n) { el.addEventListener(n, reset, { passive: true }); });
    });
  }

  /* ---------- spotlight glow ---------- */
  document.querySelectorAll('.skills__content, .contact__information, .qualification__card').forEach(function (el) {
    function set(e) {
      var b = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - b.left) + 'px');
      el.style.setProperty('--my', (e.clientY - b.top) + 'px');
      el.classList.add('is-lit');
    }
    el.addEventListener('pointermove', set, { passive: true });
    el.addEventListener('pointerdown', set, { passive: true });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(function (n) {
      el.addEventListener(n, function () { el.classList.remove('is-lit'); }, { passive: true });
    });
  });

  /* ---------- magnetic ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('.button, .home__social-icon, .scrollup, #theme-toggle').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        var x = (e.clientX - (b.left + b.width / 2)) * 0.28, y = (e.clientY - (b.top + b.height / 2)) * 0.28;
        el.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = ''; });
    });
  }

  /* ---------- main loop ---------- */
  var progressBar = document.querySelector('.fx-progress');
  var heroImg = document.querySelector('.home__img'), heroData = document.querySelector('.home__data');
  var last = performance.now(), running = true, t0 = last;
  var isLight = function () { return !document.body.classList.contains('dark-theme'); };

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (lenis) lenis.raf(now);
    readScroll();
    state.smx = lerp(state.smx, state.mx, 0.06);
    state.smy = lerp(state.smy, state.my, 0.06);

    if (progressBar) progressBar.style.transform = 'scaleX(' + state.progress.toFixed(4) + ')';

    if (!reduce) {
      var s = state.scroll;
      if (s < state.vh * 1.5) {
        if (heroImg) heroImg.style.translate = '0 ' + (s * 0.12).toFixed(1) + 'px';
        if (heroData) heroData.style.translate = '0 ' + (s * 0.06).toFixed(1) + 'px';
      }
    }

    if (canvas) {
      /* light theme: cosmos only behind the hero, then fades into the page */
      canvas.style.opacity = isLight() ? clamp(1 - state.scroll / (state.vh * 0.9), 0, 1).toFixed(3) : '1';
      if (gl && (!isLight() || state.scroll < state.vh)) gl.render((now - t0) / 1000, dt);
    }

    if (dot) {
      cur.rx = lerp(cur.rx, cur.x, 0.16); cur.ry = lerp(cur.ry, cur.y, 0.16);
      dot.style.transform = 'translate3d(' + cur.x + 'px,' + cur.y + 'px,0)';
      ring.style.transform = 'translate3d(' + cur.rx.toFixed(1) + 'px,' + cur.ry.toFixed(1) + 'px,0)';
    }
  }
  requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) running = false;
    else if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  });
})();
