/* 4D galaxy backdrop (Three.js r128). window.createGalaxy(canvas, { reduce }) -> { render(t, dt, s), setVisible } | null
   The 4th dimension: every point carries a w coordinate; we rotate in the x-w plane and
   perspective-project 4D -> 3D in the vertex shader, so the galaxy morphs without re-uploading data. */
(function () {
  'use strict';
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  window.createGalaxy = function (canvas, opts) {
    if (!window.THREE) return null;
    var reduce = opts && opts.reduce;
    var mobile = window.innerWidth < 768;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch (e) { return null; }
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
      '  float x4 = p.x*cos(uMorph) - aW*sin(uMorph);',
      '  float w4 = p.x*sin(uMorph) + aW*cos(uMorph);',
      '  p.x = x4;',
      '  p *= 4.0 / (4.0 - clamp(w4, -2.5, 2.5) * 0.55);',
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

    function layer(n, build, cfg) {
      var pos = new Float32Array(n * 3), col = new Float32Array(n * 3), w = new Float32Array(n), rnd = new Float32Array(n);
      var o = { x: 0, y: 0, z: 0, w: 0, r: 0, g: 0, b: 0 };
      for (var i = 0; i < n; i++) {
        build(i, o);
        pos[i * 3] = o.x; pos[i * 3 + 1] = o.y; pos[i * 3 + 2] = o.z;
        col[i * 3] = o.r; col[i * 3 + 1] = o.g; col[i * 3 + 2] = o.b;
        w[i] = o.w; rnd[i] = Math.random();
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
      g.setAttribute('aW', new THREE.BufferAttribute(w, 1));
      g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
      var u = { uTime: { value: 0 }, uPixel: { value: dpr * 10 }, uSize: { value: cfg.size }, uSpin: { value: cfg.spin }, uMorph: { value: 0 } };
      var m = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      var pts = new THREE.Points(g, m);
      pts.frustumCulled = false;
      scene.add(pts);
      return { pts: pts, u: u, n: n, count: n };
    }

    var cIn = new THREE.Color('#ffa86b'), cMid = new THREE.Color('#b36bff'), cOut = new THREE.Color('#4f6bff'), cc = new THREE.Color();
    var galaxy = layer(mobile ? 22000 : 55000, function (i, o) {
      var R = 5.2, arms = 3;
      var r = Math.pow(Math.random(), 1.7) * R;
      var ang = (i % arms) / arms * Math.PI * 2 + r * 1.15;
      var spread = Math.pow(Math.random(), 3) * (0.35 + r * 0.12);
      var sg = function () { return Math.random() < 0.5 ? -1 : 1; };
      o.x = Math.cos(ang) * r + sg() * spread;
      o.y = sg() * spread * 0.35;
      o.z = Math.sin(ang) * r + sg() * spread;
      o.w = (Math.random() - 0.5) * 2.2;
      var t = r / R;
      cc.copy(cIn).lerp(cMid, clamp(t * 1.6, 0, 1)).lerp(cOut, clamp((t - 0.45) * 1.8, 0, 1));
      var b = 0.9 - t * 0.35;
      o.r = cc.r * b; o.g = cc.g * b; o.b = cc.b * b;
    }, { size: mobile ? 2.6 : 2.2, spin: 0.35 });

    var stars = layer(mobile ? 1200 : 3000, function (i, o) {
      var r = 14 + Math.random() * 30, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      o.x = r * Math.sin(ph) * Math.cos(th); o.y = r * Math.cos(ph); o.z = r * Math.sin(ph) * Math.sin(th);
      o.w = (Math.random() - 0.5) * 2;
      var v = 0.5 + Math.random() * 0.5; o.r = v * 0.8; o.g = v * 0.85; o.b = v;
    }, { size: 3.2, spin: 0.01 });

    var cam = { z: 6.5, y: 1.6, ry: 0, rx: 0.35 };
    var slow = 0, frames = 0, lastW = window.innerWidth, lastH = window.innerHeight;

    window.addEventListener('resize', function () {
      var w = window.innerWidth, h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 160) return; /* ignore mobile URL-bar jitter */
      lastW = w; lastH = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }, { passive: true });

    return {
      render: function (t, dt, s) {
        var tt = reduce ? t * 0.15 : t;
        galaxy.u.uTime.value = stars.u.uTime.value = tt;
        var morph = Math.sin(tt * 0.18) * 0.35 + s.progress * 1.8;
        galaxy.u.uMorph.value = morph; stars.u.uMorph.value = morph * 0.3;

        cam.z = lerp(cam.z, 6.5 - s.progress * 3.2, 0.06);
        cam.y = lerp(cam.y, 1.6 - s.progress * 1.2, 0.06);
        cam.ry = lerp(cam.ry, s.progress * Math.PI * 1.2 + s.px * 0.35, 0.05);
        cam.rx = lerp(cam.rx, 0.35 + s.progress * 0.5 + s.py * 0.2, 0.05);
        camera.position.set(0, cam.y, cam.z);
        camera.lookAt(0, 0, 0);
        galaxy.pts.rotation.set(cam.rx, cam.ry, 0);
        stars.pts.rotation.y = cam.ry * 0.3 + tt * 0.004;
        renderer.render(scene, camera);

        /* adaptive quality: shed particles + resolution if frames keep running long */
        frames++;
        slow = dt > 0.03 ? slow + 1 : Math.max(0, slow - 1);
        if (slow > 45 && frames > 90) {
          slow = 0;
          galaxy.count = Math.max(6000, Math.floor(galaxy.count * 0.7));
          galaxy.pts.geometry.setDrawRange(0, galaxy.count);
          dpr = Math.max(0.75, dpr - 0.25);
          renderer.setPixelRatio(dpr);
          renderer.setSize(window.innerWidth, window.innerHeight, false);
          galaxy.u.uPixel.value = stars.u.uPixel.value = dpr * 10;
        }
      }
    };
  };
})();
