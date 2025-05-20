import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { saveSignatoryToDb, loadSignatoriesFromDb, checkSignatoryExists } from './db.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Global variable to store reCAPTCHA status
let recaptchaComplete = false;

// reCAPTCHA callback function (must be global for the callback to work)
window.onCaptchaComplete = (token) => {
  console.log('reCAPTCHA validated with token:', token);
  recaptchaComplete = true;
  
  // Trigger form submission if it was initiated
  if (window.pendingFormSubmission) {
    window.pendingFormSubmission();
    window.pendingFormSubmission = null;
  }
};

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
  
  // Sync any pending uploads from localStorage to Firestore
  syncPendingUploads();
  
  // Load existing signatories
  loadSignatories();
  
  // Initialize language switcher
  initLanguageSwitcher();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize SVG drawing animations
  initSvgDrawing();
  
  // Make hero buttons equal width
  initEqualWidthButtons();
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
      // Set initial state
      gsap.set(revealItems, {
        y: 30
      });
      
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
    
    // Sammle alle Bildlegenden und setze sie auf unsichtbar
    slidesArray.forEach(slide => {
      const caption = slide.querySelector('.slide-caption');
      if (caption) {
        gsap.set(caption, { opacity: 0, y: 10 });
      }
      slide.classList.remove('active');
      container.removeChild(slide);
    });
    
    // Keep first slide, shuffle the rest
    const firstSlide = slidesArray[0];
    const remainingSlides = slidesArray.slice(1);
    
    // Shuffle remaining slides
    for (let i = remainingSlides.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingSlides[i], remainingSlides[j]] = [remainingSlides[j], remainingSlides[i]];
    }
    
    // Re-append slides in new order (first slide first, then shuffled remaining slides)
    container.appendChild(firstSlide);
    remainingSlides.forEach(slide => {
      container.appendChild(slide);
    });
    
    // Set first slide as active and ensure others are hidden
    firstSlide.classList.add('active');
    remainingSlides.forEach(slide => {
      slide.classList.remove('active');
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
  
  // Initialisiere die erste Bildlegende
  const firstCaption = slides[0].querySelector('.slide-caption');
  if (firstCaption) {
    // Stelle sicher, dass Bildlegende initial unsichtbar ist
    gsap.set(firstCaption, { opacity: 0, y: 10 });
    // Dann sanft einblenden
    gsap.to(firstCaption, { 
      opacity: 1, 
      y: 0, 
      duration: 0.8, 
      delay: 0.5, 
      ease: 'power2.out' 
    });
  }
  
  // Function to change slides
  const goToSlide = (index) => {
    // Erst alte Bildlegende ausblenden, dann nach kurzer Verzögerung Slide wechseln
    const activeSlide = document.querySelector('.slide.active');
    const activeCaption = activeSlide ? activeSlide.querySelector('.slide-caption') : null;
    
    if (activeCaption) {
      // Erst Bildlegende ausblenden
      gsap.to(activeCaption, {
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          // Dann Slide wechseln
          // Remove active class from all slides and dots
          slides.forEach(slide => slide.classList.remove('active'));
          dots.forEach(dot => dot.classList.remove('active'));
          
          // Add active class to current slide and dot
          slides[index].classList.add('active');
          dots[index].classList.add('active');
          
          // Neue Bildlegende einblenden
          const newCaption = slides[index].querySelector('.slide-caption');
          if (newCaption) {
            gsap.fromTo(newCaption, 
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' }
            );
          }
          
          // Update current slide index
          currentSlide = index;
        }
      });
    } else {
      // Fallback wenn keine Bildlegende vorhanden ist
      // Remove active class from all slides and dots
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      // Add active class to current slide and dot
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      
      // Update current slide index
      currentSlide = index;
    }
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

// Function to verify reCAPTCHA token with server (optional but recommended)
async function verifyRecaptchaToken(token) {
  try {
    // In production, you'd verify this token with Google's servers
    // This is a placeholder for that verification
    // Normally you'd make a POST request to your server, which would then verify with Google
    
    // Simulated successful verification
    return true;
    
    // Example of actual implementation:
    /*
    const response = await fetch('/verify-recaptcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });
    
    const result = await response.json();
    return result.success;
    */
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return false;
  }
}

// Initialize form handling
function initForm() {
  const form = document.querySelector('#sign-form');
  const signatoriesList = document.querySelector('#signatories-list');
  
  if (!form || !signatoriesList) return;
  
  // Spam protection: Track submissions per session
  const submissionCount = parseInt(sessionStorage.getItem('submissionCount') || '0');
  const MAX_SUBMISSIONS_PER_SESSION = 1;

  // Initialize timestamp field for spam protection
  const timestampField = document.getElementById('timestamp');
  if (timestampField) {
    timestampField.value = Date.now().toString();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Spam protection: Check honeypot
    const honeypotField = document.getElementById('website');
    if (!honeypotField) {
      console.error('Honeypot field not found in the form');
    } else {
      const honeypotValue = honeypotField.value;
      if (honeypotValue) {
        console.log('Spam detected: Honeypot field filled');
        return false;
      }
    }
    
    // Spam protection: Check time (must be at least 3 seconds between page load and submission)
    const submissionTime = Date.now();
    const timestampField = document.getElementById('timestamp');
    if (!timestampField) {
      console.error('Timestamp field not found in the form');
      return false;
    }
    
    const pageLoadTime = parseInt(timestampField.value || '0');
    const TIME_THRESHOLD = 3000; // 3 seconds
    
    if (submissionTime - pageLoadTime < TIME_THRESHOLD) {
      console.log('Spam detected: Form submitted too quickly');
      alert('Bitte warten Sie einen Moment, bevor Sie das Formular absenden.');
      return false;
    }
    
    // Spam protection: Check submission count
    if (submissionCount >= MAX_SUBMISSIONS_PER_SESSION) {
      console.log('Spam detected: Too many submissions in this session');
      alert('Sie haben bereits den Code of Conduct unterzeichnet. Vielen Dank für Ihre Unterstützung!');
      return false;
    }
    
    const nameInput = form.querySelector('#name');
    const locationInput = form.querySelector('#location');
    
    if (!nameInput || !locationInput) {
      console.error('Name or location input fields not found');
      return false;
    }
    
    if (!nameInput.value || !locationInput.value) return;

    const name = nameInput.value.trim();
    const location = locationInput.value.trim();
    
    // Spam protection: Additional validation
    // ... existing code ...
    
    // Spam protection: Check for suspicious patterns
    // ... existing code ...
    
    // Display loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent || 'Unterzeichnen';
    submitButton.disabled = true;
    submitButton.textContent = 'Speichern...';
    
    // Execute reCAPTCHA validation if not already completed
    if (!recaptchaComplete) {
      // Store pending submission so it can be triggered after reCAPTCHA completes
      window.pendingFormSubmission = () => {
        processFormSubmission(form, name, location, submitButton, originalText, signatoriesList);
      };
      
      // Trigger reCAPTCHA
      try {
        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.execute();
        } else {
          console.error('reCAPTCHA not loaded');
          alert('Bitte laden Sie die Seite neu und versuchen Sie es erneut.');
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      } catch (error) {
        console.error('Error executing reCAPTCHA:', error);
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    } else {
      // reCAPTCHA was previously validated, proceed with submission
      processFormSubmission(form, name, location, submitButton, originalText, signatoriesList);
      recaptchaComplete = false; // Reset for next submission
    }
    
    /* Auskommentierter Code für lokale Entwicklung (ohne reCAPTCHA)
    // Überspringe reCAPTCHA und verarbeite das Formular direkt
    processFormSubmission(form, name, location, submitButton, originalText, signatoriesList);
    */
  });
}

// Extract form submission processing to a separate function
async function processFormSubmission(form, name, location, submitButton, originalText, signatoriesList) {
  try {
    console.log(`Attempting to save signature for ${name} from ${location}`);
    
    // Check if the signatory already exists in the database
    const exists = await checkSignatoryExists(name, location);
    
    if (exists) {
      console.log(`Signature already exists for ${name} from ${location}`);
      alert('Diese Kombination aus Name und Ort existiert bereits. Bitte versuchen Sie es mit einem anderen Namen oder Ort.');
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      return;
    }
    
    // Save to Firestore database
    const signatory = await saveSignatoryToDb(name, location);
    console.log(`Successfully saved signature to Firestore: ${name} from ${location}`);
    
    // Increment submission counter in session storage
    const submissionCount = parseInt(sessionStorage.getItem('submissionCount') || '0');
    sessionStorage.setItem('submissionCount', (submissionCount + 1).toString());
    
    // Create a new signatory element
    const newSignatory = document.createElement('div');
    newSignatory.className = 'signatory reveal-item';
    newSignatory.style.opacity = '1';  // Ensure visible immediately
    newSignatory.style.transform = 'translateY(0)';  // No initial transform
    newSignatory.innerHTML = `
      <div class="signatory-name">${name}</div>
      <div class="signatory-location">${location}</div>
    `;
    
    // Add to the list with animation
    signatoriesList.innerHTML = newSignatory.outerHTML + signatoriesList.innerHTML;
    
    // Update signature counters
    const counterElements = document.querySelectorAll('.signature-counter, .hero-signature-counter');
    if (counterElements.length > 0) {
      const currentCount = parseInt(document.querySelector('.signature-counter').textContent || '0');
      const newCount = currentCount + 1;
      
      // Update all counter elements with the new count
      counterElements.forEach(element => {
        element.textContent = newCount;
      });
    }
    
    // Reset the form
    form.reset();
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    
  } catch (error) {
    console.error('Error saving signature:', error);
    alert('Es gab ein Problem beim Speichern der Unterschrift. Bitte versuchen Sie es später erneut.');
    
    // Reset button state
    submitButton.disabled = false;
    submitButton.textContent = originalText || 'Unterzeichnen';
  }
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

// Load signatories from Firestore database and localStorage
async function loadSignatories() {
  const signatoriesList = document.querySelector('#signatories-list');
  
  if (!signatoriesList) return;
  
  // Show loading indicator
  signatoriesList.innerHTML = '<div class="loading">Signatories laden...</div>';
  
  try {
    console.log("Attempting to load signatories from Firestore...");
    
    // First try to load from Firestore
    let dbSignatories = [];
    try {
      dbSignatories = await loadSignatoriesFromDb();
      console.log(`Firestore returned ${dbSignatories?.length || 0} signatories`);
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      dbSignatories = [];
    }
    
    // Wenn wir Daten aus der Firestore bekommen haben, verwenden wir diese
    if (dbSignatories && dbSignatories.length > 0) {
      console.log('Displaying signatures from Firestore database');
      displaySignatories(dbSignatories);
    } else {
      // No data from Firestore, show empty state
      console.log('No signatures found in Firestore, showing empty state');
      signatoriesList.innerHTML = '<div class="no-signatories">Noch keine Unterschriften. Sei der Erste, der den Code of Conduct unterzeichnet!</div>';
    }
  } catch (error) {
    console.error('Error in loadSignatories function:', error);
    
    // Show error state
    console.log('Error occurred while loading signatures, showing error message');
    signatoriesList.innerHTML = '<div class="error-message">Es gab ein Problem beim Laden der Unterschriften. Bitte versuchen Sie es später erneut.</div>';
  }
}

// Helper function to display signatories in the DOM
function displaySignatories(signatories) {
  const signatoriesList = document.querySelector('#signatories-list');
  
  if (!signatoriesList) return;
  if (!signatories || !Array.isArray(signatories)) {
    console.error('Invalid signatories data:', signatories);
    signatoriesList.innerHTML = '<div class="error-message">Ungültige Daten erhalten.</div>';
    return;
  }
  
  // Animate counter
  animateSignatureCounter(signatories.length);
  
  const loadMoreContainer = document.createElement('div');
  
  // Clear existing content
  signatoriesList.innerHTML = '';
  
  // Define constants for pagination
  const SIGNATORIES_PER_PAGE = 12;
  let currentPage = 1;
  
  // Randomize signatories array for initial display
  try {
    const randomizedSignatories = [...signatories].sort(() => Math.random() - 0.5);
    
    // Function to display a batch of signatories
    const displaySignatoriesBatch = (start, count) => {
      try {
        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Display the signatories
        for (let i = start; i < start + count && i < randomizedSignatories.length; i++) {
          const signatory = randomizedSignatories[i];
          
          if (!signatory) {
            console.warn('Skipping undefined signatory at index', i);
            continue;
          }
          
          const signatoryElement = document.createElement('div');
          signatoryElement.className = 'signatory reveal-item';
          signatoryElement.style.opacity = '1';  // Ensure visible immediately
          signatoryElement.style.transform = 'translateY(0)';  // No initial transform
          signatoryElement.innerHTML = `
            <div class="signatory-name">${signatory.name || 'Unbekannt'}</div>
            <div class="signatory-location">${signatory.location || 'Unbekannt'}</div>
          `;
          
          fragment.appendChild(signatoryElement);
        }
        
        // Add signatories to the DOM
        signatoriesList.appendChild(fragment);
      } catch (batchError) {
        console.error('Error displaying signatories batch:', batchError);
      }
    };
    
    // Create and configure "Load More" button
    loadMoreContainer.className = 'load-more-container';
    loadMoreContainer.innerHTML = '<button class="btn btn-secondary load-more-btn" data-i18n="load_more_button">Mehr laden</button>';
    
    // Display first batch of signatories
    displaySignatoriesBatch(0, SIGNATORIES_PER_PAGE);
    
    // Add Load More button if there are more signatories
    if (randomizedSignatories.length > SIGNATORIES_PER_PAGE) {
      signatoriesList.after(loadMoreContainer);
      
      // Add event listener to Load More button
      const loadMoreBtn = loadMoreContainer.querySelector('.load-more-btn');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          currentPage++;
          const startIndex = (currentPage - 1) * SIGNATORIES_PER_PAGE;
          
          // Display next batch
          displaySignatoriesBatch(startIndex, SIGNATORIES_PER_PAGE);
          
          // Hide button if all signatories are displayed
          if (startIndex + SIGNATORIES_PER_PAGE >= randomizedSignatories.length) {
            loadMoreContainer.style.display = 'none';
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in displaySignatories:', error);
    signatoriesList.innerHTML = '<div class="error-message">Fehler beim Anzeigen der Unterschriften.</div>';
  }
}

// Function to animate the signature counter
function animateSignatureCounter(total) {
  const counterElements = document.querySelectorAll('.signature-counter, .hero-signature-counter');
  const counterContainer = document.querySelector('.signature-counter-container');
  
  if (!counterElements || !counterContainer) return;
  
  // Initialize the counters to 0
  counterElements.forEach(element => {
    element.textContent = '0';
  });
  
  // Erstelle einen Intersection Observer für den Counter-Container
  const options = {
    root: null, // Browser viewport
    rootMargin: '0px',
    threshold: 0.5 // 50% des Elements muss sichtbar sein
  };
  
  // Update both main counter and hero counter
  const updateCounterValues = (value) => {
    counterElements.forEach(element => {
      element.textContent = value;
    });
  };
  
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    
    // Wenn der Container sichtbar ist und noch nicht animiert wurde
    if (entry.isIntersecting && !counterContainer.classList.contains('animated')) {
      // Markiere den Container als animiert, damit die Animation nur einmal ausgelöst wird
      counterContainer.classList.add('animated');
      
      // Zeige den Container
      counterContainer.classList.add('visible');
      
      // Starte von 0
      let count = 0;
      
      // Für eine nicht-lineare Animation (easeOutExpo)
      const easeOutExpo = (t) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      };
      
      // Dauer der Animation in ms
      const duration = 2000;
      const startTime = Date.now();
      
      const updateCounter = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1); // Wert zwischen 0 und 1
        
        // Nicht-lineare Anpassung des Fortschritts
        const easedProgress = easeOutExpo(progress);
        
        // Berechne den aktuellen Wert, der angezeigt werden soll
        const currentValue = Math.floor(easedProgress * total);
        
        // Aktualisiere nur, wenn sich der Wert geändert hat
        if (currentValue !== count) {
          count = currentValue;
          updateCounterValues(count);
        }
        
        // Wiederholen, bis die Animation abgeschlossen ist
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          // Stelle sicher, dass am Ende der exakte Wert angezeigt wird
          updateCounterValues(total);
        }
      };
      
      // Starte die Animation
      requestAnimationFrame(updateCounter);
      
      // Beobachtung beenden, da die Animation bereits ausgelöst wurde
      observer.disconnect();
    }
  }, options);
  
  // Starte die Beobachtung des Counter-Containers
  observer.observe(counterContainer);
  
  // Always update the hero counter immediately without animation
  updateCounterValues(total);
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
    fetch(`./content/translations/${lang}.json`)
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
        
        // Dispatch an event to notify that language has changed
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
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

// Function to synchronize any pending uploads from localStorage to Firestore
async function syncPendingUploads() {
  console.log("Synchronizing with Firestore is now handled directly in the main code");
  // Diese Funktion ist deaktiviert, da wir die Lokalspeicherung nicht mehr verwenden
  return;
}

// Function to ensure hero buttons have equal width based on the widest button
function initEqualWidthButtons() {
  const buttonContainer = document.querySelector('.hero-content .buttons-container');
  const buttons = buttonContainer ? buttonContainer.querySelectorAll('.btn') : null;
  
  if (!buttonContainer || !buttons || buttons.length < 2) return;
  
  // Function to update button widths
  const updateButtonWidths = () => {
    // Reset widths to auto to measure their natural width
    buttons.forEach(btn => {
      btn.style.width = 'auto';
    });
    
    // Find the maximum width among all buttons
    let maxWidth = 0;
    buttons.forEach(btn => {
      const width = btn.offsetWidth;
      maxWidth = Math.max(maxWidth, width);
    });
    
    // Set all buttons to the maximum width
    if (maxWidth > 0 && window.innerWidth > 768) { // Only apply on non-mobile screens
      buttons.forEach(btn => {
        btn.style.width = `${maxWidth}px`;
      });
    }
  };
  
  // Update initially and whenever window resizes
  updateButtonWidths();
  window.addEventListener('resize', updateButtonWidths);
  
  // Also update when language changes (custom event that might be triggered elsewhere)
  document.addEventListener('languageChanged', updateButtonWidths);
  
  // Update again after all content is loaded
  window.addEventListener('load', updateButtonWidths);
}