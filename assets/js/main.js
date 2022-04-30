var old = document.getElementById('old');
const dateTime = new Date();
old.innerText = dateTime.getFullYear() - 2001;


document.addEventListener('contextmenu', event => event.preventDefault());

var typed = new Typed(".typing_home", {
  strings: ["Developer", "Designer", "Freelance"],
  typeSpeed: 100,
  backSpeed: 60,
  loop: !0
});
var typed = new Typed(".typing_about", {
  strings: ["Developer", "Designer", "Freelance"],
  typeSpeed: 100,
  backSpeed: 60,
  loop: !0
});
var typed = new Typed(".typing_footer   ", {
  strings: ["Developer", "Designer", "Freelance"],
  typeSpeed: 100,
  backSpeed: 60,
  loop: !0
});
const navMenu = document.getElementById('nav-menu'),
  navToggle = document.getElementById('nav-toggle'),
  navClose = document.getElementById('nav-close')
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.add('show-menu')
  })
}
if (navClose) {
  navClose.addEventListener('click', () => {
    navMenu.classList.remove('show-menu')
  })
}
const navLink = document.querySelectorAll('.nav__link')

function linkAction() {
  const navMenu = document.getElementById('nav-menu')
  navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))
const skillsContent = document.getElementsByClassName('skills__content'),
  skillsHeader = document.querySelectorAll('.skills__header')

function toggleSkills() {
  let itemClass = this.parentNode.className
  for (i = 0; i < skillsContent.length; i++) {
    skillsContent[i].className = 'skills__content skills__close'
  }
  if (itemClass === 'skills__content skills__close') {
    this.parentNode.className = 'skills__content skills__open'
  }
}
skillsHeader.forEach((el) => {
  el.addEventListener('click', toggleSkills)
})
const tabs = document.querySelectorAll('[data-target]'),
  tabContents = document.querySelectorAll('[data-content]')
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = document.querySelector(tab.dataset.target)
    tabContents.forEach(tabContent => {
      tabContent.classList.remove('qualification__active')
    })
    target.classList.add('qualification__active')
    tabs.forEach(tab => {
      tab.classList.remove('qualification__active')
    })
    tab.classList.add('qualification__active')
  })
})
const modalViews = document.querySelectorAll('.services__modal'),
  modalBtns = document.querySelectorAll('.services__button'),
  modalCloses = document.querySelectorAll('.services__modal-close')
let modal = function (modalClick) {
  modalViews[modalClick].classList.add('active-modal')
}
modalBtns.forEach((modalBtn, i) => {
  modalBtn.addEventListener('click', () => {
    modal(i)
  })
})
modalCloses.forEach((modalClose) => {
  modalClose.addEventListener('click', () => {
    modalViews.forEach((modalView) => {
      modalView.classList.remove('active-modal')
    })
  })
})

let swiperQualification = new Swiper(".qualification__edu", {
  loop: true,
  spaceBetween: 48,
  grabCursor: true,
  centeredSlides: true,
  centerInsufficientSlides: true,
  autoplay: {
    delay: 3000,
    disableOnInteraction: !1,
  },
  breakpoints: {
    568: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 3,
    }
  },
});
let swiperProject = new Swiper(".project__container", {
  loop: true,
  autoplay: {
    delay: 4000,
    disableOnInteraction: !1,
  },
});

let swiperTestimonial = new Swiper(".testimonial__container", {
  loop: true,
  grabCursor: true,
  spaceBetween: 48,
  autoplay: {
    delay: 3000,
    disableOnInteraction: !1,
  },

  breakpoints: {
    568: {
      slidesPerView: 2,
    }
  }
});

const sections = document.querySelectorAll('section[id]')

function scrollActive() {
  const scrollY = window.pageYOffset
  sections.forEach(current => {
    const sectionHeight = current.offsetHeight
    const sectionTop = current.offsetTop - 50;
    sectionId = current.getAttribute('id')
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link')
    } else {
      document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link')
    }
  })
}
window.addEventListener('scroll', scrollActive)

function scrollHeader() {
  const nav = document.getElementById('header')
  if (this.scrollY >= 80) nav.classList.add('scroll-header');
  else nav.classList.remove('scroll-header')
}
window.addEventListener('scroll', scrollHeader)

function scrollUp() {
  const scrollUp = document.getElementById('scroll-up');
  if (this.scrollY >= 560) scrollUp.classList.add('show-scroll');
  else scrollUp.classList.remove('show-scroll')

}
window.addEventListener('scroll', scrollUp)
const themeButton = document.getElementById('theme-toggle')
const darkTheme = 'dark-theme'
const selectedTheme = localStorage.getItem('selected-theme')
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
if (selectedTheme) {
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
}
themeButton.addEventListener('click', () => {
  document.body.classList.toggle(darkTheme)
  localStorage.setItem('selected-theme', getCurrentTheme())
});
themeButton.addEventListener("click", () => {
  document.body.classList.contains("light-theme") ? enableDarkMode() : enableLightMode()
});

function enableDarkMode() {
  document.body.classList.remove("light-theme");
  document.body.classList.add("dark-theme")
}

function enableLightMode() {
  document.body.classList.remove("dark-theme");
  document.body.classList.add("light-theme")
}

function setThemePreference() {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    enableDarkMode();
    return
  }
  enableLightMode()
}
document.onload = setThemePreference();
! function (a, b) {
  "use strict";

  function c(a) {
    a = a || {};
    for (var b = 1; b < arguments.length; b++) {
      var c = arguments[b];
      if (c)
        for (var d in c) c.hasOwnProperty(d) && ("object" == typeof c[d] ? deepExtend(a[d], c[d]) : a[d] = c[d])
    }
    return a
  }

  function d(d, g) {
    function h() {
      if (y) {
        r = b.createElement("canvas"), r.className = "pg-canvas", r.style.display = "block", d.insertBefore(r, d.firstChild), s = r.getContext("2d"), i();
        for (var c = Math.round(r.width * r.height / g.density), e = 0; c > e; e++) {
          var f = new n;
          f.setStackPos(e), z.push(f)
        }
        a.addEventListener("resize", function () {
          k()
        }, !1), b.addEventListener("mousemove", function (a) {
          A = a.pageX, B = a.pageY
        }, !1), D && !C && a.addEventListener("deviceorientation", function () {
          F = Math.min(Math.max(-event.beta, -30), 30), E = Math.min(Math.max(-event.gamma, -30), 30)
        }, !0), j(), q("onInit")
      }
    }

    function i() {
      r.width = d.offsetWidth, r.height = d.offsetHeight, s.fillStyle = g.dotColor, s.strokeStyle = g.lineColor, s.lineWidth = g.lineWidth
    }

    function j() {
      if (y) {
        u = a.innerWidth, v = a.innerHeight, s.clearRect(0, 0, r.width, r.height);
        for (var b = 0; b < z.length; b++) z[b].updatePosition();
        for (var b = 0; b < z.length; b++) z[b].draw();
        G || (t = requestAnimationFrame(j))
      }
    }

    function k() {
      i();
      for (var a = d.offsetWidth, b = d.offsetHeight, c = z.length - 1; c >= 0; c--)(z[c].position.x > a || z[c].position.y > b) && z.splice(c, 1);
      var e = Math.round(r.width * r.height / g.density);
      if (e > z.length)
        for (; e > z.length;) {
          var f = new n;
          z.push(f)
        } else e < z.length && z.splice(e);
      for (c = z.length - 1; c >= 0; c--) z[c].setStackPos(c)
    }

    function l() {
      G = !0
    }

    function m() {
      G = !1, j()
    }

    function n() {
      switch (this.stackPos, this.active = !0, this.layer = Math.ceil(3 * Math.random()), this.parallaxOffsetX = 0, this.parallaxOffsetY = 0, this.position = {
        x: Math.ceil(Math.random() * r.width),
        y: Math.ceil(Math.random() * r.height)
      }, this.speed = {}, g.directionX) {
        case "left":
          this.speed.x = +(-g.maxSpeedX + Math.random() * g.maxSpeedX - g.minSpeedX).toFixed(2);
          break;
        case "right":
          this.speed.x = +(Math.random() * g.maxSpeedX + g.minSpeedX).toFixed(2);
          break;
        default:
          this.speed.x = +(-g.maxSpeedX / 2 + Math.random() * g.maxSpeedX).toFixed(2), this.speed.x += this.speed.x > 0 ? g.minSpeedX : -g.minSpeedX
      }
      switch (g.directionY) {
        case "up":
          this.speed.y = +(-g.maxSpeedY + Math.random() * g.maxSpeedY - g.minSpeedY).toFixed(2);
          break;
        case "down":
          this.speed.y = +(Math.random() * g.maxSpeedY + g.minSpeedY).toFixed(2);
          break;
        default:
          this.speed.y = +(-g.maxSpeedY / 2 + Math.random() * g.maxSpeedY).toFixed(2), this.speed.x += this.speed.y > 0 ? g.minSpeedY : -g.minSpeedY
      }
    }

    function o(a, b) {
      return b ? void(g[a] = b) : g[a]
    }

    function p() {
      console.log("destroy"), r.parentNode.removeChild(r), q("onDestroy"), f && f(d).removeData("plugin_" + e)
    }

    function q(a) {
      void 0 !== g[a] && g[a].call(d)
    }
    var r, s, t, u, v, w, x, y = !!b.createElement("canvas").getContext,
      z = [],
      A = 0,
      B = 0,
      C = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i),
      D = !!a.DeviceOrientationEvent,
      E = 0,
      F = 0,
      G = !1;
    return g = c({}, a[e].defaults, g), n.prototype.draw = function () {
      s.beginPath(), s.arc(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY, g.particleRadius / 2, 0, 2 * Math.PI, !0), s.closePath(), s.fill(), s.beginPath();
      for (var a = z.length - 1; a > this.stackPos; a--) {
        var b = z[a],
          c = this.position.x - b.position.x,
          d = this.position.y - b.position.y,
          e = Math.sqrt(c * c + d * d).toFixed(2);
        e < g.proximity && (s.moveTo(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY), g.curvedLines ? s.quadraticCurveTo(Math.max(b.position.x, b.position.x), Math.min(b.position.y, b.position.y), b.position.x + b.parallaxOffsetX, b.position.y + b.parallaxOffsetY) : s.lineTo(b.position.x + b.parallaxOffsetX, b.position.y + b.parallaxOffsetY))
      }
      s.stroke(), s.closePath()
    }, n.prototype.updatePosition = function () {
      if (g.parallax) {
        if (D && !C) {
          var a = (u - 0) / 60;
          w = (E - -30) * a + 0;
          var b = (v - 0) / 60;
          x = (F - -30) * b + 0
        } else w = A, x = B;
        this.parallaxTargX = (w - u / 2) / (g.parallaxMultiplier * this.layer), this.parallaxOffsetX += (this.parallaxTargX - this.parallaxOffsetX) / 10, this.parallaxTargY = (x - v / 2) / (g.parallaxMultiplier * this.layer), this.parallaxOffsetY += (this.parallaxTargY - this.parallaxOffsetY) / 10
      }
      var c = d.offsetWidth,
        e = d.offsetHeight;
      switch (g.directionX) {
        case "left":
          this.position.x + this.speed.x + this.parallaxOffsetX < 0 && (this.position.x = c - this.parallaxOffsetX);
          break;
        case "right":
          this.position.x + this.speed.x + this.parallaxOffsetX > c && (this.position.x = 0 - this.parallaxOffsetX);
          break;
        default:
          (this.position.x + this.speed.x + this.parallaxOffsetX > c || this.position.x + this.speed.x + this.parallaxOffsetX < 0) && (this.speed.x = -this.speed.x)
      }
      switch (g.directionY) {
        case "up":
          this.position.y + this.speed.y + this.parallaxOffsetY < 0 && (this.position.y = e - this.parallaxOffsetY);
          break;
        case "down":
          this.position.y + this.speed.y + this.parallaxOffsetY > e && (this.position.y = 0 - this.parallaxOffsetY);
          break;
        default:
          (this.position.y + this.speed.y + this.parallaxOffsetY > e || this.position.y + this.speed.y + this.parallaxOffsetY < 0) && (this.speed.y = -this.speed.y)
      }
      this.position.x += this.speed.x, this.position.y += this.speed.y
    }, n.prototype.setStackPos = function (a) {
      this.stackPos = a
    }, h(), {
      option: o,
      destroy: p,
      start: m,
      pause: l
    }
  }
  var e = "particleground",
    f = a.jQuery;
  a[e] = function (a, b) {
    return new d(a, b)
  }, a[e].defaults = {
    minSpeedX: .1,
    maxSpeedX: .7,
    minSpeedY: .1,
    maxSpeedY: .7,
    directionX: "center",
    directionY: "center",
    density: 1e4,
    dotColor: "#666666",
    lineColor: "#666666",
    particleRadius: 7,
    lineWidth: 1,
    curvedLines: !1,
    proximity: 100,
    parallax: !0,
    parallaxMultiplier: 5,
    onInit: function () {},
    onDestroy: function () {}
  }, f && (f.fn[e] = function (a) {
    if ("string" == typeof arguments[0]) {
      var b, c = arguments[0],
        g = Array.prototype.slice.call(arguments, 1);
      return this.each(function () {
        f.data(this, "plugin_" + e) && "function" == typeof f.data(this, "plugin_" + e)[c] && (b = f.data(this, "plugin_" + e)[c].apply(this, g))
      }), void 0 !== b ? b : this
    }
    return "object" != typeof a && a ? void 0 : this.each(function () {
      f.data(this, "plugin_" + e) || f.data(this, "plugin_" + e, new d(this, a))
    })
  })
}(window, document),
function () {
  for (var a = 0, b = ["ms", "moz", "webkit", "o"], c = 0; c < b.length && !window.requestAnimationFrame; ++c) window.requestAnimationFrame = window[b[c] + "RequestAnimationFrame"], window.cancelAnimationFrame = window[b[c] + "CancelAnimationFrame"] || window[b[c] + "CancelRequestAnimationFrame"];
  window.requestAnimationFrame || (window.requestAnimationFrame = function (b) {
    var c = (new Date).getTime(),
      d = Math.max(0, 16 - (c - a)),
      e = window.setTimeout(function () {
        b(c + d)
      }, d);
    return a = c + d, e
  }), window.cancelAnimationFrame || (window.cancelAnimationFrame = function (a) {
    clearTimeout(a)
  })
}();
particleground(document.getElementById('particles-foreground'), {
  dotColor: 'rgba(255, 255, 255, 1)',
  lineColor: 'rgba(255, 255, 255, 0.05)',
  minSpeedX: 0.3,
  maxSpeedX: 0.6,
  minSpeedY: 0.3,
  maxSpeedY: 0.6,
  density: 50000,
  curvedLines: !1,
  proximity: 250,
  parallaxMultiplier: 10,
  particleRadius: 4,
});
particleground(document.getElementById('particles-background'), {
  dotColor: 'rgba(255, 255, 255, 0.5)',
  lineColor: 'rgba(255, 255, 255, 0.05)',
  minSpeedX: 0.075,
  maxSpeedX: 0.15,
  minSpeedY: 0.075,
  maxSpeedY: 0.15,
  density: 30000,
  curvedLines: !1,
  proximity: 20,
  parallaxMultiplier: 20,
  particleRadius: 2,
});
window.addEventListener("load", function () {
  var load = document.querySelector('.loader');
  load.style.display = 'none'
})
