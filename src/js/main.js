import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize custom cursor
  initCustomCursor();
  
  // Initialize scroll animations
  initScrollAnimations();
  
  // Initialize slider
  initSlider();
  
  // Initialize toggle functionality
  initToggle();
  
  // Initialize form handling
  initForm();
  
  // Load the full Code of Conduct content
  loadCodeOfConduct();
  
  // Load existing signatories
  loadSignatories();
  
  // Initialize language switcher
  initLanguageSwitcher();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize SVG drawing animations
  initSvgDrawing();
});

// Custom cursor
function initCustomCursor() {
  const cursor = document.querySelector('.cursor');
  
  if (!cursor) return;
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
  
  document.addEventListener('mousedown', () => {
    cursor.classList.add('active');
  });
  
  document.addEventListener('mouseup', () => {
    cursor.classList.remove('active');
  });
  
  // Add active class when hovering over links and buttons
  const interactiveElements = document.querySelectorAll('a, button, input, .conduct-item, .supporter-logo');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
    });
  });
}

// Scroll animations
function initScrollAnimations() {
  // Reveal text elements on scroll
  const revealTextElements = document.querySelectorAll('.reveal-text');
  
  revealTextElements.forEach(element => {
    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => element.classList.add('visible'),
      once: true
    });
  });
  
  // Reveal items with stagger on scroll
  const sectionContainers = document.querySelectorAll('section');
  
  sectionContainers.forEach(container => {
    const revealItems = container.querySelectorAll('.reveal-item');
    
    if (revealItems.length > 0) {
      ScrollTrigger.create({
        trigger: container,
        start: 'top 75%',
        onEnter: () => {
          gsap.to(revealItems, {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.6,
            ease: 'power3.out'
          });
        },
        once: true
      });
    }
  });
}

// Image slider functionality
function initSlider() {
  let slides = document.querySelectorAll('.slide');
  let dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  let slideInterval;
  
  if (slides.length === 0) return;
  
  // Shuffle slides function - Fisher-Yates algorithm
  const shuffleSlides = () => {
    // Convert NodeList to Array for manipulation
    const slidesArray = Array.from(slides);
    const container = slides[0].parentNode;
    
    // Remove active class from all slides
    slidesArray.forEach(slide => {
      slide.classList.remove('active');
      container.removeChild(slide);
    });
    
    // Shuffle array
    for (let i = slidesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slidesArray[i], slidesArray[j]] = [slidesArray[j], slidesArray[i]];
    }
    
    // Re-append slides in new order
    slidesArray.forEach((slide, index) => {
      container.appendChild(slide);
      if (index === 0) {
        slide.classList.add('active');
      }
    });
    
    // Update slides and dots references with the new order
    slides = document.querySelectorAll('.slide');
    
    // Update dots to match first slide
    dots.forEach((dot, index) => {
      if (index === 0) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  };
  
  // Shuffle slides on init
  shuffleSlides();
  
  // Function to change slides
  const goToSlide = (index) => {
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide and dot
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    // Update current slide index
    currentSlide = index;
  };
  
  // Auto slide change
  const startSlideInterval = () => {
    slideInterval = setInterval(() => {
      let nextSlide = currentSlide + 1;
      if (nextSlide >= slides.length) {
        nextSlide = 0;
      }
      goToSlide(nextSlide);
    }, 6000); // Change slide every 6 seconds
  };
  
  // Initialize slider
  startSlideInterval();
  
  // Click event on dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      clearInterval(slideInterval);
      goToSlide(index);
      startSlideInterval();
    });
  });
  
  // Animate first slide in
  gsap.fromTo(slides[0], 
    { opacity: 0 },
    { opacity: 1, duration: 1, ease: 'power2.out' }
  );
}

// Toggle functionality
function initToggle() {
  const toggleButton = document.querySelector('.toggle-conduct');
  const fullConduct = document.querySelector('#full-conduct');
  
  if (!toggleButton || !fullConduct) return;
  
  toggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    fullConduct.classList.toggle('active');
    
    if (fullConduct.classList.contains('active')) {
      toggleButton.textContent = 'Code of Conduct ausblenden';
      
      // Scroll to the full content
      setTimeout(() => {
        fullConduct.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else {
      toggleButton.textContent = 'Vollständigen Code of Conduct lesen';
    }
  });
}

// Form handling for signatures
function initForm() {
  const form = document.querySelector('#signature-form');
  const signatoriesList = document.querySelector('#signatories-list');
  
  if (!form || !signatoriesList) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = form.querySelector('#name');
    const locationInput = form.querySelector('#location');
    
    if (!nameInput.value || !locationInput.value) return;
    
    // Create a new signatory element
    const newSignatory = document.createElement('div');
    newSignatory.className = 'signatory reveal-item';
    newSignatory.innerHTML = `
      <div class="signatory-name">${nameInput.value}</div>
      <div class="signatory-location">${locationInput.value}</div>
    `;
    
    // Add to the list with animation
    signatoriesList.prepend(newSignatory);
    
    // Animate the new element
    gsap.fromTo(newSignatory, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
    
    // Reset the form
    form.reset();
    
    // Save to local storage and server
    saveSignatory(nameInput.value, locationInput.value);
  });
}

// Load the Code of Conduct content
function loadCodeOfConduct() {
  const conductContainer = document.querySelector('#full-conduct');
  
  if (!conductContainer) return;
  
  fetch('/content/code-of-conduct.md')
    .then(response => response.text())
    .then(content => {
      // Simple markdown to HTML conversion
      const html = content
        .replace(/# (.*)/g, '<h1>$1</h1>')
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n([0-9])\. (.*)/g, '<br><strong>$1.</strong> $2');
      
      conductContainer.innerHTML = `<p>${html}</p>`;
    })
    .catch(error => {
      console.error('Error loading Code of Conduct:', error);
      conductContainer.innerHTML = '<p>Der vollständige Code of Conduct konnte nicht geladen werden.</p>';
    });
}

// Save signatories to local storage and server
function saveSignatory(name, location) {
  let signatories = JSON.parse(localStorage.getItem('signatories') || '[]');
  
  const newSignatory = { name, location, date: new Date().toISOString() };
  signatories.push(newSignatory);
  
  localStorage.setItem('signatories', JSON.stringify(signatories));
  
  // Send to server - this would normally use an API endpoint
  // For demonstration, we'll just log that in a real environment this would save to a server
  console.log('In a production environment, this would save to a server API:', newSignatory);
  
  // Note: In a real implementation, you would use fetch() to send this data to your server:
  // fetch('/api/signatories', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(newSignatory)
  // })
  // .then(response => response.json())
  // .then(data => console.log('Success:', data))
  // .catch(error => console.error('Error:', error));
}

// Load signatories from local storage and server
function loadSignatories() {
  const signatoriesList = document.querySelector('#signatories-list');
  
  if (!signatoriesList) return;
  
  // First load from localStorage
  let signatories = JSON.parse(localStorage.getItem('signatories') || '[]');
  
  // Check if there's a signatories.json file we should load from
  fetch('/data/signatories.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('No server signatories found');
      }
      return response.json();
    })
    .then(serverSignatories => {
      // If we have no local signatories, use the server ones directly
      if (signatories.length === 0) {
        signatories = serverSignatories;
        localStorage.setItem('signatories', JSON.stringify(signatories));
      } else {
        // Otherwise, merge server signatories with local ones, avoiding duplicates
        const mergedSignatories = [...signatories];
        
        serverSignatories.forEach(serverSig => {
          // Check if this signatory already exists in our local list
          const exists = signatories.some(localSig => 
            localSig.name === serverSig.name && localSig.location === serverSig.location
          );
          
          if (!exists) {
            mergedSignatories.push(serverSig);
          }
        });
        
        // Update our working signatories array
        signatories = mergedSignatories;
        
        // Update local storage with merged list
        localStorage.setItem('signatories', JSON.stringify(mergedSignatories));
      }
      
      // Display the signatories
      displaySignatories(signatories);
    })
    .catch(error => {
      console.log('Error loading server signatories:', error);
      
      // If there are no signatories in localStorage or we couldn't load from server,
      // add some example ones
      if (signatories.length === 0) {
        // Default example signatories
        signatories = [
          { name: 'Peter Müller', location: 'Zürich' },
          { name: 'Sarah Schmid', location: 'Luzern' },
          { name: 'Marc Weber', location: 'Basel' },
          { name: 'Anna Frei', location: 'Bern' }
        ];
        
        // Save the examples to localStorage
        localStorage.setItem('signatories', JSON.stringify(signatories));
      }
      
      // Display the signatories
      displaySignatories(signatories);
    });
}

// Helper function to display signatories in the DOM
function displaySignatories(signatories) {
  const signatoriesList = document.querySelector('#signatories-list');
  
  // Clear existing content
  signatoriesList.innerHTML = '';
  
  // Display the signatories
  signatories.forEach(signatory => {
    const signatoryElement = document.createElement('div');
    signatoryElement.className = 'signatory reveal-item';
    signatoryElement.innerHTML = `
      <div class="signatory-name">${signatory.name}</div>
      <div class="signatory-location">${signatory.location}</div>
    `;
    
    signatoriesList.appendChild(signatoryElement);
  });
}

// Language switcher functionality
function initLanguageSwitcher() {
  const languageSwitcher = document.querySelector('.language-switcher');
  const currentLangBtn = document.querySelector('.current-lang');
  const langDropdown = document.querySelector('.lang-dropdown');
  const langOptions = document.querySelectorAll('.lang-dropdown li');
  const footerLangLinks = document.querySelectorAll('.lang-link');
  
  if (!languageSwitcher || !currentLangBtn || !langDropdown) return;
  
  // Detect browser language
  const detectBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang.substring(0, 2).toLowerCase();
    
    // Check if browser language is supported
    const supportedLangs = ['en', 'de', 'fr', 'it'];
    return supportedLangs.includes(shortLang) ? shortLang : 'en'; // Default to English if not supported
  };
  
  // Set initial language based on browser or stored preference
  const setInitialLanguage = () => {
    const storedLang = localStorage.getItem('selectedLanguage');
    const initialLang = storedLang || detectBrowserLanguage();
    
    setLanguage(initialLang);
  };
  
  // Set language
  const setLanguage = (lang) => {
    // Update current language button
    const langMap = {
      'en': 'EN',
      'de': 'DE',
      'fr': 'FR',
      'it': 'IT'
    };
    
    // Set data attribute for the whole page
    document.documentElement.setAttribute('lang', lang);
    
    // Update the button text
    currentLangBtn.textContent = langMap[lang];
    
    // Update active state for footer language links
    footerLangLinks.forEach(link => {
      if (link.getAttribute('data-lang') === lang) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // Store selected language
    localStorage.setItem('selectedLanguage', lang);
    
    // Load translations for the selected language
    loadTranslations(lang);
  };
  
  // Toggle dropdown
  currentLangBtn.addEventListener('click', () => {
    currentLangBtn.classList.toggle('active');
    langDropdown.classList.toggle('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!languageSwitcher.contains(e.target)) {
      currentLangBtn.classList.remove('active');
      langDropdown.classList.remove('active');
    }
  });
  
  // Language selection from dropdown
  langOptions.forEach(option => {
    option.addEventListener('click', () => {
      const selectedLang = option.getAttribute('data-lang');
      setLanguage(selectedLang);
      
      // Close dropdown
      currentLangBtn.classList.remove('active');
      langDropdown.classList.remove('active');
    });
  });
  
  // Language selection from footer links
  footerLangLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedLang = link.getAttribute('data-lang');
      setLanguage(selectedLang);
    });
  });
  
  // Load translations based on selected language
  const loadTranslations = (lang) => {
    fetch(`/content/translations/${lang}.json`)
      .then(response => response.json())
      .then(translations => {
        // Apply translations to elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
          const key = element.getAttribute('data-i18n');
          if (translations[key]) {
            // Handle different element types
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
              element.placeholder = translations[key];
            } else {
              element.textContent = translations[key];
            }
          }
        });
      })
      .catch(error => {
        console.error(`Error loading translations for ${lang}:`, error);
      });
  };
  
  // Initialize language
  setInitialLanguage();
}

// Mobile menu functionality
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const overlay = document.querySelector('.mobile-menu-overlay');
  const navLinks = document.querySelectorAll('.main-nav a');
  
  if (!menuToggle || !mainNav || !overlay) return;
  
  // Toggle menu on hamburger click
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mainNav.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });
  
  // Close menu when overlay is clicked
  overlay.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    mainNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });
  
  // Close menu when a nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mainNav.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });
  
  // Close menu on window resize (if desktop size)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && mainNav.classList.contains('active')) {
      menuToggle.classList.remove('active');
      mainNav.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  });
}

// Add function to check and handle visibility for SVG drawing animation
function initSvgDrawing() {
  const revealItems = document.querySelectorAll('.conduct-item.reveal-item');
  
  if (!revealItems.length) return;
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3
  };
  
  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Keine Animationen mehr hinzufügen, wenn Element sichtbar wird
        
      } else {
        // When element leaves viewport, remove the visible class
        // This will reset the animation so it can play again when returning
        entry.target.classList.remove('visible');
        
        // Keine Animationen mehr zurücksetzen, da sie nicht mehr hinzugefügt werden
      }
    });
  };
  
  const observer = new IntersectionObserver(observerCallback, observerOptions);
  
  revealItems.forEach(item => {
    observer.observe(item);
  });
}