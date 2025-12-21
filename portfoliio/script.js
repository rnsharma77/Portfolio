// Navbar Indicator Logic
const nav = document.querySelector("nav");
const links = document.querySelectorAll(".nav-links a");
const indicator = document.querySelector(".indicator");
const hamburger = document.getElementById("hamburger");
const navLinksContainer = document.getElementById("navLinks");

let userInteracted = false;

function moveIndicator(element) {
  if (element) {
    indicator.style.left = element.offsetLeft + "px";
    indicator.style.width = element.offsetWidth + "px";
  }
}

// Function to set the active link and move indicator
function setActiveLink(linkElement) {
  links.forEach((l) => l.classList.remove("active"));
  linkElement.classList.add("active");
  moveIndicator(linkElement);
}

links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    userInteracted = true;

    setActiveLink(link);

    // Smooth scroll to the section
    const targetId = link.getAttribute("href").substring(1); // Remove '#'
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      window.scrollTo({
        top: targetSection.offsetTop - nav.offsetHeight, // Adjust for fixed navbar height
        behavior: "smooth",
      });
    }

    // Close mobile menu after clicking a link
    if (navLinksContainer.classList.contains("active")) {
      navLinksContainer.classList.remove("active");
      hamburger.querySelector("i").classList.remove("fa-times"); // Change icon back
      hamburger.querySelector("i").classList.add("fa-bars");
    }
  });

  link.addEventListener("mouseenter", () => {
    // Only move indicator on hover if not on mobile (menu is active)
    if (window.innerWidth > 768 || !navLinksContainer.classList.contains('active')) {
      moveIndicator(link);
    }
  });

  link.addEventListener('mouseleave', () => {
    // Return indicator to active link if user hasn't interacted
    if (!userInteracted && window.innerWidth > 768) { // Only for desktop and if no user interaction
      const active = document.querySelector('.nav-links a.active');
      if (active) moveIndicator(active);
    }
  });
});

// Hamburger menu toggle
hamburger.addEventListener("click", () => {
  navLinksContainer.classList.toggle("active");
  const icon = hamburger.querySelector("i");
  if (navLinksContainer.classList.contains("active")) {
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-times"); // Change to 'X' icon
  } else {
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars"); // Change back to hamburger
  }
});

// On load, move to default active (Home)
window.addEventListener("load", () => {
  const active = document.querySelector(".nav-links a.active");
  if (active) moveIndicator(active);

  // Auto-select Home after 3 seconds if no interaction
  setTimeout(() => {
    if (!userInteracted) {
      const homeLink = document.querySelector('.nav-links a[href="#"]'); // Select the Home link specifically
      if (homeLink) {
        setActiveLink(homeLink);
      }
    }
  }, 3000);
});

// Update indicator position on window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    // Only show indicator on larger screens
    const active = document.querySelector(".nav-links a.active");
    if (active) moveIndicator(active);
    navLinksContainer.classList.remove("active"); // Hide mobile menu if resized to desktop
    hamburger.querySelector("i").classList.remove("fa-times");
    hamburger.querySelector("i").classList.add("fa-bars");
  } else {
    indicator.style.width = '0'; // Hide indicator on small screens
  }
});


// Scroll Reveal for Experience Timeline and Education
const faders = document.querySelectorAll(".fade-in");

const appearOnScroll = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // animate once
      }
    });
  },
  {
    threshold: 0.3, // Adjust threshold as needed
  }
);

faders.forEach((el) => appearOnScroll.observe(el));

// Animated Text for Hero Section
const roles = ["Developer", "UI & UX Designer", "Problem Solver"]; // Added "Problem Solver" for variety
const textElement = document.querySelector(".animated-text");
let index = 0;

function changeText() {
  textElement.style.opacity = 0;

  setTimeout(() => {
    textElement.textContent = roles[index];
    textElement.style.opacity = 1;
    index = (index + 1) % roles.length;
  }, 500); // fades out, then in
}

changeText(); // initial
setInterval(changeText, 3000); // change every 3 seconds (3000ms)

// Update active link on scroll
window.addEventListener('scroll', () => {
  // Shrink header when scrolled
  const shrinkThreshold = 60;
  if (window.scrollY > shrinkThreshold) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  // Update active link on scroll
  let current = '';
  const sections = document.querySelectorAll('section');
  const navHeight = nav.offsetHeight; // Get dynamic navbar height

  sections.forEach(section => {
    const sectionTop = section.offsetTop - navHeight; // Adjust for fixed navbar
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  links.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) {
      link.classList.add('active');
      if (window.innerWidth > 768) { // Only move indicator on desktop
        moveIndicator(link);
      } else {
        indicator.style.width = '0'; // Hide indicator on small screens
      }
    }
  });

  // Handle "Home" link when at the very top of the page
  if (window.scrollY === 0) {
    const homeLink = document.querySelector('.nav-links a[href="#"]');
    if (homeLink) {
      setActiveLink(homeLink);
    }
  }
});