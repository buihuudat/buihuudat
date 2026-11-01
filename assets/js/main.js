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
  for (let i = 0; i < skillsContent.length; i++) {
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
    const sectionId = current.getAttribute('id')
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link')
    } else {
      document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link')
    }
  })
}
window.addEventListener('scroll', scrollActive, { passive: true })

function scrollHeader() {
  const nav = document.getElementById('header')
  if (this.scrollY >= 80) nav.classList.add('scroll-header');
  else nav.classList.remove('scroll-header')
}
window.addEventListener('scroll', scrollHeader, { passive: true })

function scrollUp() {
  const scrollUp = document.getElementById('scroll-up');
  if (this.scrollY >= 560) scrollUp.classList.add('show-scroll');
  else scrollUp.classList.remove('show-scroll')

}
window.addEventListener('scroll', scrollUp, { passive: true })
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
window.addEventListener("load", function () {
  var load = document.querySelector('.loader');
  load.classList.add('is-hidden');
  document.documentElement.classList.add('is-ready');
  setTimeout(function () { load.style.display = 'none' }, 700)
})
