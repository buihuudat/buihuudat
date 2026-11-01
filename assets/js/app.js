(function () {
  'use strict';

  /* ================= helpers ================= */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var EMAIL = 'buihuudat.dev@gmail.com';

  /* ================= data ================= */
  var I18N = {
    en: {
      skip: 'Skip to content', search: 'Search',
      'nav.home': 'Home', 'nav.about': 'About', 'nav.skills': 'Skills', 'nav.journey': 'Journey', 'nav.projects': 'Projects', 'nav.contact': 'Contact',
      'hero.status': 'Available for new opportunities', 'hero.hi': "Hi, I'm", 'hero.and': "And I'm a",
      'hero.desc': 'Persistence and perseverance are my strong points. I build fast, polished web and mobile products.',
      'hero.work': 'View my work', 'hero.contact': 'Contact me', 'hero.scroll': 'Scroll',
      'about.kicker': 'About', 'about.title': 'Crafting things for the web & mobile',
      'about.p1a': "I'm", 'about.p1b': 'years old. I grew up in Dak Nong and now study and work in Ho Chi Minh City.',
      'about.p2': "My hobbies are watching movies, playing games, listening to music and travelling. I'm never idle — besides school and work I keep learning online to gain experience and share knowledge.",
      'about.p3': 'I always try to do things the best way possible.',
      'stat.projects': 'Projects', 'stat.design': 'Years in design', 'stat.roles': 'Roles & internships',
      'about.cv': 'Download CV', 'about.copy': 'Copy email',
      'skills.kicker': 'Skills', 'skills.title': 'Tools I work with',
      'journey.kicker': 'Journey', 'journey.title': 'Experience & education', 'journey.work': 'Work', 'journey.edu': 'Education',
      'projects.kicker': 'Projects', 'projects.title': 'Selected work', 'projects.search': 'Search projects…',
      'projects.empty': 'No projects match your search.', 'projects.open': 'Open project', 'projects.all': 'All',
      'contact.kicker': 'Contact', 'contact.title': "Let's build something together",
      'contact.email': 'Email', 'contact.loc': 'Location', 'contact.locv': 'Go Vap, Ho Chi Minh City',
      'form.name': 'Name', 'form.email': 'Email', 'form.project': 'Project', 'form.msg': 'Message', 'form.send': 'Send message',
      'form.req': 'This field is required', 'form.bad': 'Please enter a valid email', 'form.sending': 'Sending…',
      'form.ok': 'Thanks! Your message was sent.', 'form.err': 'Something went wrong. Please try again or email me directly.',
      'footer.rights': 'All rights reserved.',
      'pal.ph': 'Type a command or search…', 'pal.none': 'No results', 'pal.go': 'Go to', 'pal.act': 'Action', 'pal.proj': 'Project',
      'pal.theme': 'Toggle theme', 'pal.lang': 'Switch language', 'pal.copy': 'Copy email', 'pal.top': 'Back to top',
      'toast.copied': 'Email copied to clipboard', 'toast.copyfail': 'Copy failed — ' + EMAIL,
      roles: ['Developer', 'Designer', 'Freelancer'],
      'skill.fe': 'Frontend', 'skill.be': 'Backend', 'skill.ds': 'Designer', 'skill.of': 'Office',
      'skill.y1': 'More than 1 year', 'skill.y5': 'More than 5 years',
      'work.passio': 'Part-time', 'work.fe': 'Frontend Intern', 'work.mobile': 'Mobile Developer Intern',
      'edu.primary': 'Primary school', 'edu.junior': 'Junior high school', 'edu.high': 'High school', 'edu.uni': 'University'
    },
    vi: {
      skip: 'Bỏ qua đến nội dung', search: 'Tìm kiếm',
      'nav.home': 'Trang chủ', 'nav.about': 'Giới thiệu', 'nav.skills': 'Kỹ năng', 'nav.journey': 'Hành trình', 'nav.projects': 'Dự án', 'nav.contact': 'Liên hệ',
      'hero.status': 'Sẵn sàng cho cơ hội mới', 'hero.hi': 'Xin chào, mình là', 'hero.and': 'Mình là',
      'hero.desc': 'Kiên trì và bền bỉ là điểm mạnh của mình. Mình xây dựng sản phẩm web và mobile nhanh, chỉn chu.',
      'hero.work': 'Xem dự án', 'hero.contact': 'Liên hệ', 'hero.scroll': 'Cuộn',
      'about.kicker': 'Giới thiệu', 'about.title': 'Tạo ra sản phẩm cho web & mobile',
      'about.p1a': 'Mình', 'about.p1b': 'tuổi, lớn lên ở Đắk Nông, hiện đang học và làm việc tại TP. Hồ Chí Minh.',
      'about.p2': 'Sở thích của mình là xem phim, chơi game, nghe nhạc và đi du lịch. Mình không rảnh rỗi — ngoài việc học và làm, mình luôn tự học online để tích luỹ kinh nghiệm và chia sẻ kiến thức.',
      'about.p3': 'Mình luôn cố gắng làm mọi việc theo cách tốt nhất có thể.',
      'stat.projects': 'Dự án', 'stat.design': 'Năm làm thiết kế', 'stat.roles': 'Vị trí & thực tập',
      'about.cv': 'Tải CV', 'about.copy': 'Sao chép email',
      'skills.kicker': 'Kỹ năng', 'skills.title': 'Công cụ mình sử dụng',
      'journey.kicker': 'Hành trình', 'journey.title': 'Kinh nghiệm & học vấn', 'journey.work': 'Công việc', 'journey.edu': 'Học vấn',
      'projects.kicker': 'Dự án', 'projects.title': 'Dự án tiêu biểu', 'projects.search': 'Tìm dự án…',
      'projects.empty': 'Không có dự án phù hợp.', 'projects.open': 'Mở dự án', 'projects.all': 'Tất cả',
      'contact.kicker': 'Liên hệ', 'contact.title': 'Cùng nhau tạo ra điều tuyệt vời',
      'contact.email': 'Email', 'contact.loc': 'Địa chỉ', 'contact.locv': 'Gò Vấp, TP. Hồ Chí Minh',
      'form.name': 'Họ tên', 'form.email': 'Email', 'form.project': 'Dự án', 'form.msg': 'Lời nhắn', 'form.send': 'Gửi tin nhắn',
      'form.req': 'Vui lòng điền mục này', 'form.bad': 'Email chưa hợp lệ', 'form.sending': 'Đang gửi…',
      'form.ok': 'Cảm ơn bạn! Tin nhắn đã được gửi.', 'form.err': 'Có lỗi xảy ra. Vui lòng thử lại hoặc gửi email trực tiếp.',
      'footer.rights': 'Bảo lưu mọi quyền.',
      'pal.ph': 'Gõ lệnh hoặc tìm kiếm…', 'pal.none': 'Không có kết quả', 'pal.go': 'Đến', 'pal.act': 'Hành động', 'pal.proj': 'Dự án',
      'pal.theme': 'Đổi giao diện sáng/tối', 'pal.lang': 'Đổi ngôn ngữ', 'pal.copy': 'Sao chép email', 'pal.top': 'Lên đầu trang',
      'toast.copied': 'Đã sao chép email', 'toast.copyfail': 'Không sao chép được — ' + EMAIL,
      roles: ['Lập trình viên', 'Nhà thiết kế', 'Freelancer'],
      'skill.fe': 'Frontend', 'skill.be': 'Backend', 'skill.ds': 'Thiết kế', 'skill.of': 'Văn phòng',
      'skill.y1': 'Hơn 1 năm', 'skill.y5': 'Hơn 5 năm',
      'work.passio': 'Làm thêm', 'work.fe': 'Thực tập Frontend', 'work.mobile': 'Thực tập Mobile Developer',
      'edu.primary': 'Tiểu học', 'edu.junior': 'Trung học cơ sở', 'edu.high': 'Trung học phổ thông', 'edu.uni': 'Đại học'
    }
  };

  var SKILLS = [
    { k: 'skill.fe', y: 'skill.y1', icon: 'uil-brackets-curly', items: ['HTML', 'CSS', 'JavaScript', 'React'] },
    { k: 'skill.be', y: 'skill.y1', icon: 'uil-server-network', items: ['MySQL', 'NodeJS', 'PHP', 'Express'] },
    { k: 'skill.ds', y: 'skill.y5', icon: 'uil-swatchbook', items: ['UI-UX', 'Premiere', 'Photoshop'] },
    { k: 'skill.of', y: 'skill.y1', icon: 'uil-file-alt', items: ['Word', 'Excel', 'PowerPoint'] }
  ];

  var JOURNEY = {
    work: [
      { t: 'work.mobile', org: 'MCI Solutions', d: '11/2023 – 2/2024', icon: 'uil-mobile-android' },
      { t: 'work.fe', org: 'MULTIMEDIAVIET', d: '12/2022 – 3/2023', icon: 'uil-desktop' },
      { t: 'work.passio', org: 'Passio Coffee', d: '2020 – 2021', icon: 'uil-coffee' }
    ],
    edu: [
      { t: 'edu.uni', org: 'Thuy Loi University', d: '2018 – 2022', img: 'University-min.jpg' },
      { t: 'edu.high', org: 'Phan Chu Trinh High School', d: '2015 – 2018', img: 'highSchool-min.jpg' },
      { t: 'edu.junior', org: 'Phan Dinh Phung Junior High School', d: '2011 – 2015', img: 'secondarySchool-min.jpg' },
      { t: 'edu.primary', org: 'Nguyen Dinh Chieu Primary School', d: '2006 – 2011', img: 'primarySchool-min.jpg' }
    ]
  };
  JOURNEY.edu[0].img = 'university-min.jpg';

  var PROJECTS = [
    { id: 'qlsv', name: 'Student Management', img: 'qlsv.jpg', tags: ['Web'], stack: 'HTML · CSS · JS', url: 'https://quanlisinhvien.vercel.app/',
      en: 'Student management website built with HTML, CSS and JavaScript.', vi: 'Website quản lý sinh viên xây dựng bằng HTML, CSS và JavaScript.' },
    { id: 'car', name: 'BHDCar Website', img: 'salseCar.jpg', tags: ['Web', 'Fullstack'], stack: 'HTML · CSS · JS · PHP · MySQL', url: 'https://buihuudat.github.io/myProject/BuiHuuDat/',
      en: 'Car-selling website for a web technology course, built with HTML, CSS, JS, PHP and MySQL.', vi: 'Website bán xe cho môn công nghệ web, dùng HTML, CSS, JS, PHP và MySQL.' },
    { id: 'admin', name: 'BHDCar Admin', img: 'admin.jpg', tags: ['Web', 'Fullstack'], stack: 'HTML · CSS · JS · PHP · MySQL', url: 'https://buihuudat.github.io/myProject/BuiHuuDat/admin.html',
      en: 'Admin dashboard for the BHDCar car-selling website.', vi: 'Trang quản trị cho website bán xe BHDCar.' },
    { id: 'social', name: 'Social Website (Beta)', img: 'social.jpg', tags: ['React'], stack: 'ReactJS', url: 'https://buihuudat-w-1.vercel.app/:slug/profile',
      en: 'Social networking website built with ReactJS.', vi: 'Website mạng xã hội xây dựng bằng ReactJS.' },
    { id: 'rport', name: 'React Portfolio', img: 'reactW.jpg', tags: ['React'], stack: 'ReactJS', url: 'https://buihuudat.github.io/about',
      en: 'Personal portfolio website built with ReactJS.', vi: 'Website portfolio cá nhân xây dựng bằng ReactJS.' },
    { id: 'spend', name: 'Spending Management', img: 'spendingApp.jpg', tags: ['React', 'Fullstack'], stack: 'MERN', url: 'https://spending-app.vercel.app/',
      en: 'Personal spending management app on the MERN stack.', vi: 'Ứng dụng quản lý chi tiêu cá nhân trên MERN stack.' },
    { id: 'pirus', name: 'Pirus Website', img: 'pirus.jpg', tags: ['React'], stack: 'React', url: 'https://pirus-react-website.vercel.app/',
      en: 'Marketing website built with React.', vi: 'Website giới thiệu sản phẩm xây dựng bằng React.' },
    { id: 'food', name: 'Food SF', img: 'food.jpg', tags: ['React', 'Fullstack'], stack: 'React · Express', url: 'https://food-buihuudat.vercel.app/',
      en: 'Food ordering website with a React frontend and an Express API.', vi: 'Website đặt đồ ăn với frontend React và API Express.' },
    { id: 'circlek', name: 'Circle K Website', img: 'circlekk.jpg', tags: ['React', 'Fullstack'], stack: 'React · Express', url: 'https://circle-k-buihuudat.vercel.app',
      en: 'Convenience-store website with a React frontend and an Express API.', vi: 'Website cửa hàng tiện lợi với frontend React và API Express.' },
    { id: 'tl2nd', name: 'Thuy Loi 2nd', img: 'tl2nd.jpg', tags: ['Mobile', 'Fullstack'], stack: 'React Native · Express', url: 'https://github.com/buihuudat/thuyLoi2ndClient',
      en: 'Second-hand marketplace mobile app built with React Native and Express.', vi: 'Ứng dụng di động chợ đồ cũ xây dựng bằng React Native và Express.' },
    { id: 'fgapp', name: 'FreshGreen App', img: 'freshgreenApp.png', tags: ['Mobile'], stack: 'React Native', url: 'https://github.com/buihuudat/app_freshgreen',
      en: 'FreshGreen mobile app built with React Native.', vi: 'Ứng dụng di động FreshGreen xây dựng bằng React Native.' },
    { id: 'fgweb', name: 'FreshGreen Web', img: 'freshgreenWeb.png', tags: ['Mobile', 'React'], stack: 'React Native', url: 'https://freshgreen.vercel.app',
      en: 'Web version of FreshGreen.', vi: 'Phiên bản web của FreshGreen.' }
  ];
  var FILTERS = ['All', 'Web', 'React', 'Fullstack', 'Mobile'];

  /* ================= i18n ================= */
  var lang = store.get('bhd-lang') || ((navigator.language || '').toLowerCase().indexOf('vi') === 0 ? 'vi' : 'en');
  if (!I18N[lang]) lang = 'en';
  var t = function (k) { var v = I18N[lang][k]; return v === undefined ? (I18N.en[k] === undefined ? k : I18N.en[k]) : v; };

  function applyI18n() {
    root.lang = lang;
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-i18n-ph')); });
    $('#langLabel').textContent = lang.toUpperCase();
    renderSkills(); renderTimeline(); renderFilters(); renderProjects();
    splitHeadings();
    typed.restart();
    placeDock(); placePill();
  }

  /* ================= split headings ================= */
  function splitHeadings() {
    $$('.split').forEach(function (el) {
      var text = el.textContent;
      el.setAttribute('aria-label', text);
      el.textContent = '';
      var n = 0;
      text.split(' ').forEach(function (word, wi, arr) {
        var w = document.createElement('span');
        w.setAttribute('aria-hidden', 'true');
        w.style.display = 'inline-block';
        word.split('').forEach(function (c) {
          var s = document.createElement('span');
          s.className = 'ch'; s.textContent = c; s.style.setProperty('--c', n++);
          w.appendChild(s);
        });
        el.appendChild(w);
        if (wi < arr.length - 1) { el.appendChild(document.createTextNode(' ')); n++; }
      });
    });
  }

  /* ================= typed roles ================= */
  var typed = (function () {
    var el = $('#typed'), i = 0, j = 0, del = false, timer = 0;
    function tick() {
      var roles = t('roles'), word = roles[i % roles.length];
      if (reduce) { el.textContent = word; timer = setTimeout(function () { i++; tick(); }, 2200); return; }
      j += del ? -1 : 1;
      el.textContent = word.slice(0, j);
      var d = del ? 45 : 95;
      if (!del && j === word.length) { del = true; d = 1400; }
      else if (del && j === 0) { del = false; i++; d = 350; }
      timer = setTimeout(tick, d);
    }
    return { restart: function () { clearTimeout(timer); i = 0; j = 0; del = false; tick(); } };
  })();

  /* ================= renderers ================= */
  function renderSkills() {
    $('#skillsGrid').innerHTML = SKILLS.map(function (s, i) {
      return '<article class="card skill glass reveal in" style="--i:' + i + '"><div class="skill__icon"><i class="uil ' + s.icon + '"></i></div>' +
        '<h3>' + t(s.k) + '</h3><small>' + t(s.y) + '</small><ul>' + s.items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></article>';
    }).join('');
    bindSpotlight($$('#skillsGrid .card'));
    revealObserve($$('#skillsGrid .reveal'), true);
  }

  var tab = 'work';
  function renderTimeline() {
    $('#timeline').innerHTML = JOURNEY[tab].map(function (j, i) {
      var lead = j.img ? '<img src="./assets/img/School/' + j.img + '" alt="" loading="lazy" width="64" height="64">' : '<div class="tl__ico"><i class="uil ' + j.icon + '"></i></div>';
      return '<li class="tl glass" style="--i:' + i + '">' + lead + '<div><h3>' + t(j.t) + '</h3><p>' + j.org + '</p><time>' + j.d + '</time></div></li>';
    }).join('');
  }

  var filter = 'All', query = '';
  function renderFilters() {
    $('#filters').innerHTML = FILTERS.map(function (f) {
      return '<button class="filter' + (f === filter ? ' is-active' : '') + '" data-f="' + f + '">' + (f === 'All' ? t('projects.all') : f) + '</button>';
    }).join('');
  }
  function renderProjects() {
    var q = query.trim().toLowerCase();
    var list = PROJECTS.filter(function (p) {
      return (filter === 'All' || p.tags.indexOf(filter) > -1) && (!q || (p.name + ' ' + p.stack + ' ' + p.tags.join(' ') + ' ' + p[lang]).toLowerCase().indexOf(q) > -1);
    });
    $('#projEmpty').hidden = list.length > 0;
    $('#projGrid').innerHTML = list.map(function (p, i) {
      return '<article class="proj card glass" style="--i:' + i + '" tabindex="0" role="button" data-id="' + p.id + '" aria-label="' + p.name + '">' +
        '<span class="glare"></span><div class="proj__img"><img src="./assets/img/project/' + p.img + '" alt="" loading="lazy" width="640" height="400"></div>' +
        '<div class="proj__body"><div class="tags">' + p.tags.map(function (x) { return '<span class="tag">' + x + '</span>'; }).join('') + '</div>' +
        '<h3>' + p.name + '</h3><p>' + p[lang] + '</p></div></article>';
    }).join('');
    $$('#projGrid .proj').forEach(function (el) { bindTilt(el, 7); });
    bindSpotlight($$('#projGrid .proj'));
  }

  /* ================= scroll engine ================= */
  var state = { scroll: 0, progress: 0, px: 0, py: 0, tx: 0, ty: 0, vh: innerHeight };
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  }
  function scrollToTarget(id) {
    var el = id === '#home' || id === '#' ? 0 : $(id);
    if (el === null) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.4 });
    else (el === 0 ? window.scrollTo({ top: 0, behavior: 'smooth' }) : el.scrollIntoView({ behavior: 'smooth' }));
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    scrollToTarget(a.getAttribute('href'));
  });

  /* ================= reveal / counters / spy ================= */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      io.unobserve(en.target);
      $$('[data-count]', en.target).forEach(countUp);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  function revealObserve(list) { list.forEach(function (el) { io.observe(el); }); }

  function countUp(el) {
    var to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), d = 1400;
    (function step(now) {
      var p = clamp((now - t0) / d, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e) + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  var dockLinks = $$('.dock__link'), glow = $('#dockGlow'), activeSec = 'home';
  function placeDock() {
    var a = $('.dock__link.is-active');
    if (!a) return;
    glow.style.left = a.offsetLeft + 'px';
    glow.style.width = a.offsetWidth + 'px';
  }
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      activeSec = en.target.id;
      dockLinks.forEach(function (l) { l.classList.toggle('is-active', l.dataset.sec === activeSec); });
      placeDock();
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(function (s) { spy.observe(s); });
  addEventListener('resize', function () { placeDock(); placePill(); }, { passive: true });

  /* ================= tabs ================= */
  function placePill() {
    var a = $('.tab.is-active'), pill = $('#tabPill');
    if (a) { pill.style.left = a.offsetLeft + 'px'; pill.style.width = a.offsetWidth + 'px'; }
  }
  $$('.tab').forEach(function (b) {
    b.addEventListener('click', function () {
      tab = b.dataset.tab;
      $$('.tab').forEach(function (x) { var on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
      placePill(); renderTimeline();
    });
  });

  /* ================= projects UI ================= */
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('.filter'); if (!b) return;
    filter = b.dataset.f; renderFilters(); renderProjects();
  });
  $('#projSearch').addEventListener('input', function (e) { query = e.target.value; renderProjects(); });

  var modal = $('#modal');
  function openProject(id) {
    var p = PROJECTS.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    $('#modalImg').src = './assets/img/project/' + p.img; $('#modalImg').alt = p.name;
    $('#modalTitle').textContent = p.name;
    $('#modalDesc').textContent = p[lang] + ' — ' + p.stack;
    $('#modalTags').innerHTML = p.tags.map(function (x) { return '<span class="tag">' + x + '</span>'; }).join('');
    $('#modalLink').href = p.url;
    openDialog(modal);
  }
  $('#projGrid').addEventListener('click', function (e) { var c = e.target.closest('.proj'); if (c) openProject(c.dataset.id); });
  $('#projGrid').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var c = e.target.closest('.proj'); if (c) { e.preventDefault(); openProject(c.dataset.id); }
  });
  $('#modalClose').addEventListener('click', function () { modal.close(); });

  function openDialog(d) {
    if (typeof d.showModal !== 'function') return;
    if (lenis) lenis.stop();
    d.showModal();
  }
  [modal, $('#palette')].forEach(function (d) {
    d.addEventListener('close', function () { if (lenis) lenis.start(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); }); /* backdrop click */
  });

  /* ================= toast / copy ================= */
  var toastT = 0;
  function toast(msg) {
    var el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }
  function copy(text) {
    var done = function () { toast(t('toast.copied')); };
    var fail = function () { toast(t('toast.copyfail')); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail);
    else {
      try {
        var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done();
      } catch (e) { fail(); }
    }
  }
  $$('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { copy(b.dataset.copy); }); });

  /* ================= theme / language ================= */
  function setTheme(next, ev) {
    var apply = function () { root.dataset.theme = next; store.set('bhd-theme', next); var m = document.querySelector('meta[name=theme-color]'); if (m) m.content = next === 'dark' ? '#07071a' : '#f4f5ff'; };
    if (!document.startViewTransition || reduce) { apply(); return; }
    var r = (ev && ev.currentTarget ? ev.currentTarget : $('#themeBtn')).getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2, end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var vt = document.startViewTransition(apply);
    vt.ready.then(function () {
      root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 750, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(function () {});
  }
  function toggleTheme(ev) { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', ev); }
  function toggleLang() { lang = lang === 'en' ? 'vi' : 'en'; store.set('bhd-lang', lang); applyI18n(); toast(lang === 'en' ? 'English' : 'Tiếng Việt'); }
  $('#themeBtn').addEventListener('click', toggleTheme);
  $('#langBtn').addEventListener('click', toggleLang);

  /* ================= command palette ================= */
  var pal = $('#palette'), palIn = $('#palInput'), palList = $('#palList'), palItems = [], palSel = 0;
  function commands() {
    var nav = [['#home', 'nav.home', 'uil-estate'], ['#about', 'nav.about', 'uil-user'], ['#skills', 'nav.skills', 'uil-layers'], ['#journey', 'nav.journey', 'uil-briefcase-alt'], ['#projects', 'nav.projects', 'uil-apps'], ['#contact', 'nav.contact', 'uil-message']]
      .map(function (n) { return { label: t(n[1]), tag: t('pal.go'), icon: n[2], run: function () { scrollToTarget(n[0]); } }; });
    var acts = [
      { label: t('pal.theme'), tag: t('pal.act'), icon: 'uil-moon', run: function () { toggleTheme(); } },
      { label: t('pal.lang'), tag: t('pal.act'), icon: 'uil-language', run: toggleLang },
      { label: t('pal.copy'), tag: t('pal.act'), icon: 'uil-copy', run: function () { copy(EMAIL); } },
      { label: t('pal.top'), tag: t('pal.act'), icon: 'uil-arrow-up', run: function () { scrollToTarget('#home'); } },
      { label: 'GitHub', tag: t('pal.act'), icon: 'uil-github-alt', run: function () { window.open('https://github.com/buihuudat', '_blank', 'noopener'); } }
    ];
    var projs = PROJECTS.map(function (p) { return { label: p.name, tag: t('pal.proj'), icon: 'uil-rocket', run: function () { setTimeout(function () { openProject(p.id); }, 60); } }; });
    return nav.concat(acts, projs);
  }
  function renderPal() {
    var q = palIn.value.trim().toLowerCase();
    palItems = commands().filter(function (c) { return !q || c.label.toLowerCase().indexOf(q) > -1; });
    palSel = clamp(palSel, 0, Math.max(0, palItems.length - 1));
    palList.innerHTML = palItems.length ? palItems.map(function (c, i) {
      return '<li class="pal-item' + (i === palSel ? ' is-sel' : '') + '" role="option" data-i="' + i + '"><i class="uil ' + c.icon + '"></i>' + c.label + '<small>' + c.tag + '</small></li>';
    }).join('') : '<li class="pal-empty">' + t('pal.none') + '</li>';
    var s = $('.is-sel', palList); if (s) s.scrollIntoView({ block: 'nearest' });
  }
  function openPalette() { palIn.value = ''; palSel = 0; renderPal(); openDialog(pal); palIn.focus(); }
  function runPal(i) { var c = palItems[i]; if (!c) return; pal.close(); c.run(); }
  $('#openPalette').addEventListener('click', openPalette);
  palIn.addEventListener('input', function () { palSel = 0; renderPal(); });
  palIn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); palSel = (palSel + 1) % Math.max(1, palItems.length); renderPal(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); palSel = (palSel - 1 + palItems.length) % Math.max(1, palItems.length); renderPal(); }
    else if (e.key === 'Enter') { e.preventDefault(); runPal(palSel); }
  });
  palList.addEventListener('click', function (e) { var li = e.target.closest('.pal-item'); if (li) runPal(+li.dataset.i); });
  palList.addEventListener('pointermove', function (e) {
    var li = e.target.closest('.pal-item');
    if (li && +li.dataset.i !== palSel) { palSel = +li.dataset.i; $$('.pal-item', palList).forEach(function (x, i) { x.classList.toggle('is-sel', i === palSel); }); }
  });
  document.addEventListener('keydown', function (e) {
    var typing = /input|textarea/i.test((e.target.tagName || ''));
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); pal.open ? pal.close() : openPalette(); }
    else if (e.key === '/' && !typing && !pal.open) { e.preventDefault(); openPalette(); }
  });
  if (!/Mac|iPhone|iPad/.test(navigator.platform || '')) { var kb = $('.kbd-btn kbd'); if (kb) kb.textContent = 'Ctrl K'; }

  /* ================= form ================= */
  var form = $('#form'), statusEl = $('#formStatus');
  function validate() {
    var ok = true;
    $$('.field', form).forEach(function (f) {
      var inp = $('input,textarea', f), msg = '';
      if (inp.required && !inp.value.trim()) msg = t('form.req');
      else if (inp.type === 'email' && inp.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value)) msg = t('form.bad');
      f.classList.toggle('bad', !!msg); $('em', f).textContent = msg;
      if (msg) ok = false;
    });
    return ok;
  }
  $$('.field input, .field textarea').forEach(function (i) { i.addEventListener('input', function () { if (i.closest('.field').classList.contains('bad')) validate(); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusEl.className = 'form__status'; statusEl.textContent = '';
    if (!validate()) { var bad = $('.field.bad input, .field.bad textarea', form); if (bad) bad.focus(); return; }
    var btn = $('#send'); btn.disabled = true; statusEl.textContent = t('form.sending');
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); statusEl.className = 'form__status ok'; statusEl.textContent = t('form.ok'); })
      .catch(function () { statusEl.className = 'form__status err'; statusEl.textContent = t('form.err'); })
      .then(function () { btn.disabled = false; });
  });

  /* ================= tilt / spotlight / magnetic / ripple / cursor ================= */
  function bindTilt(el, max) {
    if (reduce || el._tilt) return;
    el._tilt = true;
    var raf = 0, rx = 0, ry = 0, gx = 50, gy = 0, down = false;
    function apply() { raf = 0; el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) scale3d(1.02,1.02,1.02)'; el.style.setProperty('--gx', gx + '%'); el.style.setProperty('--gy', gy + '%'); }
    function move(e) {
      if (e.pointerType === 'touch' && !down) return;
      var b = el.getBoundingClientRect(), px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
      ry = (px - 0.5) * max * 2; rx = -(py - 0.5) * max * 2; gx = px * 100; gy = py * 100;
      el.classList.add('is-tilting');
      if (!raf) raf = requestAnimationFrame(apply);
    }
    function reset() { down = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } el.classList.remove('is-tilting'); el.style.transform = ''; }
    el.addEventListener('pointerdown', function (e) { down = true; move(e); }, { passive: true });
    el.addEventListener('pointermove', move, { passive: true });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(function (n) { el.addEventListener(n, reset, { passive: true }); });
  }
  function bindSpotlight(list) {
    list.forEach(function (el) {
      if (el._spot) return; el._spot = true;
      function set(e) { var b = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - b.left) + 'px'); el.style.setProperty('--my', (e.clientY - b.top) + 'px'); el.classList.add('is-lit'); }
      el.addEventListener('pointermove', set, { passive: true });
      el.addEventListener('pointerdown', set, { passive: true });
      ['pointerleave', 'pointerup', 'pointercancel'].forEach(function (n) { el.addEventListener(n, function () { el.classList.remove('is-lit'); }, { passive: true }); });
    });
  }
  $$('.tilt[data-tilt]').forEach(function (el) { bindTilt(el, +el.dataset.tilt); });

  if (fine && !reduce) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        el.style.translate = ((e.clientX - b.left - b.width / 2) * 0.25).toFixed(1) + 'px ' + ((e.clientY - b.top - b.height / 2) * 0.25).toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = ''; });
    });
  }

  if (!reduce) {
    document.addEventListener('pointerdown', function (e) {
      var r = document.createElement('span'); r.className = 'ripple';
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      document.body.appendChild(r); r.addEventListener('animationend', function () { r.remove(); });
    }, { passive: true });
  }

  var dot = $('#cDot'), ring = $('#cRing'), cur = { x: -100, y: -100, rx: -100, ry: -100 };
  if (fine && !reduce) {
    root.classList.add('has-cursor');
    var hov = 'a, button, .proj, .filter, input, textarea, [role=button], .pal-item';
    document.addEventListener('pointerover', function (e) { if (e.target.closest && e.target.closest(hov)) ring.classList.add('is-hover'); });
    document.addEventListener('pointerout', function (e) { if (e.target.closest && e.target.closest(hov)) ring.classList.remove('is-hover'); });
    document.addEventListener('pointerdown', function () { ring.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { ring.classList.remove('is-down'); });
  }
  addEventListener('pointermove', function (e) {
    cur.x = e.clientX; cur.y = e.clientY;
    state.tx = e.clientX / innerWidth * 2 - 1; state.ty = e.clientY / innerHeight * 2 - 1;
  }, { passive: true });

  /* ================= galaxy + main loop ================= */
  var galaxy = window.createGalaxy ? window.createGalaxy($('#bg'), { reduce: reduce }) : null;
  var topbar = $('.topbar'), bar = $('#progress'), toTop = $('#toTop'), parallax = $$('[data-parallax]');
  $('#toTop').addEventListener('click', function () { scrollToTarget('#home'); });
  var running = true, last = performance.now(), t0 = last;

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (lenis) lenis.raf(now);
    state.scroll = lenis ? lenis.scroll : (pageYOffset || 0);
    state.progress = clamp(state.scroll / Math.max(1, root.scrollHeight - innerHeight), 0, 1);
    state.px = lerp(state.px, state.tx, 0.06); state.py = lerp(state.py, state.ty, 0.06);
    bar.style.transform = 'scaleX(' + state.progress.toFixed(4) + ')';
    toTop.classList.toggle('show', state.scroll > innerHeight * 0.8);
    topbar.classList.toggle('is-scrolled', state.scroll > 40);

    if (!reduce && state.scroll < innerHeight * 1.5) {
      parallax.forEach(function (el) { el.style.translate = '0 ' + (state.scroll * +el.dataset.parallax).toFixed(1) + 'px'; });
    }
    if (galaxy && root.dataset.theme === 'dark') galaxy.render((now - t0) / 1000, dt, state);

    if (fine && !reduce) {
      cur.rx = lerp(cur.rx, cur.x, 0.16); cur.ry = lerp(cur.ry, cur.y, 0.16);
      dot.style.transform = 'translate3d(' + cur.x + 'px,' + cur.y + 'px,0)';
      ring.style.transform = 'translate3d(' + cur.rx.toFixed(1) + 'px,' + cur.ry.toFixed(1) + 'px,0)';
    }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) running = false;
    else if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  });

  /* ================= boot ================= */
  $('#year').textContent = new Date().getFullYear();
  $('#age').textContent = new Date().getFullYear() - 2001;
  applyI18n();
  document.body.classList.add('is-loading');
  var bootBar = $('#bootBar'), pct = 0, loaded = false, started = performance.now();
  addEventListener('load', function () { loaded = true; });
  (function bootTick() {
    pct = loaded ? Math.min(100, pct + 6) : Math.min(88, pct + 2);
    bootBar.style.width = pct + '%';
    if (pct >= 100 && performance.now() - started > 900) return finishBoot();
    setTimeout(bootTick, 30);
  })();
  function finishBoot() {
    $('#boot').classList.add('is-done');
    document.body.classList.remove('is-loading');
    revealObserve($$('.reveal:not(.in)'));
    setTimeout(function () { $('#boot').style.display = 'none'; }, 1000);
    placeDock(); placePill();
  }
  requestAnimationFrame(frame);
  /* safety net: never leave the page hidden if something above failed */
  setTimeout(function () { if (!$('#boot').classList.contains('is-done')) finishBoot(); }, 6000);
})();
