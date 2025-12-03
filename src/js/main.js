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
  
  // Initialize language switcher first
  initLanguageSwitcher();
  
  // Load existing signatories after language is initialized
  setTimeout(() => {
    loadSignatories();
  }, 500);
  
  // Initialize sort dropdown
  initSortDropdown();
  
  // Update banner styling and dates when language changes
  document.addEventListener('languageChanged', (event) => {
    const lang = event.detail.language;
    // Update all existing banner elements with correct language class
    document.querySelectorAll('.new-banner').forEach(element => {
      // Remove all language classes first
      element.classList.remove('lang-fr', 'lang-it', 'lang-en', 'lang-de');
      
      // Add language-specific class for styling
      if (lang === 'fr' || lang === 'it') {
        element.classList.add(`lang-${lang}`);
      }
    });
    
    // Update signature dates with new language formatting
    updateSignatureDates(lang);
  });
  
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

// Helper function to capitalize the first letter of each word in a name
// Handles spaces, hyphens (-), and apostrophes (')
function capitalizeFirstLetter(name) {
  if (!name) return name;
  
  return name
    // Split by spaces, hyphens, and apostrophes while keeping the separators
    .split(/(\s|-|')/)
    .map(part => {
      // If it's a separator (space, hyphen, apostrophe) or empty, return as is
      if (part.match(/^\s|-|'$/) || part.length === 0) return part;
      
      // Capitalize first letter, lowercase the rest
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
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
    
    // Format the actual creation date from the signatory object
    const currentLang = document.documentElement.getAttribute('lang') || 'de';
    const localeMap = {
      'de': 'de-DE',
      'en': 'en-US', 
      'fr': 'fr-FR',
      'it': 'it-IT'
    };
    
    // Use the actual creation date from the database response
    const creationDate = signatory.date ? new Date(signatory.date) : new Date();
    const formattedDate = creationDate.toLocaleDateString(localeMap[currentLang] || 'de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    newSignatory.innerHTML = `
      <div class="signatory-name">${capitalizeFirstLetter(name)}</div>
      <div class="signatory-location">${location}</div>
      <div class="signatory-date">${formattedDate}</div>
      <div class="new-banner" data-i18n="new_banner">New</div>
    `;
    
    // Add to the list with animation
    signatoriesList.innerHTML = newSignatory.outerHTML + signatoriesList.innerHTML;
    
    // Apply translations to the new banner
    applyTranslationsToNewElements(currentLang);
    
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
  
  // Remove any existing pagination containers
  document.querySelectorAll('.pagination-container').forEach(container => {
    container.remove();
  });
  
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

// Helper function to apply translations to newly added elements
function applyTranslationsToNewElements(lang) {
  fetch(`./content/translations/${lang}.json`)
    .then(response => response.json())
    .then(translations => {
      // Apply translations to new banner elements
      document.querySelectorAll('.new-banner[data-i18n="new_banner"]').forEach(element => {
        if (translations['new_banner']) {
          element.textContent = translations['new_banner'];
        }
        
        // Remove all language classes first
        element.classList.remove('lang-fr', 'lang-it', 'lang-en', 'lang-de');
        
        // Add language-specific class for styling
        if (lang === 'fr' || lang === 'it') {
          element.classList.add(`lang-${lang}`);
        }
      });
      
      
      // Update signature dates with correct language formatting
      updateSignatureDates(lang);
    })
    .catch(error => {
      console.error(`Error loading translations for ${lang}:`, error);
    });
}

// Helper function to update signature dates when language changes
function updateSignatureDates(lang) {
  // Don't reload signatories on language change to avoid multiple load more buttons
  // Instead, just update the existing date elements by re-formatting them in the new language
  const localeMap = {
    'de': 'de-DE',
    'en': 'en-US', 
    'fr': 'fr-FR',
    'it': 'it-IT'
  };
  
  // Update existing signature dates by re-formatting them
  document.querySelectorAll('.signatory').forEach(signatoryElement => {
    const dateElement = signatoryElement.querySelector('.signatory-date');
    if (dateElement) {
      // Try to extract the original date from the text
      const dateText = dateElement.textContent.trim();
      let originalDate = null;
      
      // Try to parse the existing date text to extract the actual date
      // This is a bit complex because we need to handle different language formats
      const monthNames = {
        'de': ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        'fr': ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        'it': ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
      };
      
      // Try to extract day, month, and year from the text
      const dateMatch = dateText.match(/(\d{1,2})[\.\s]*(\w+)[\s,]*(\d{4})/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const monthText = dateMatch[2];
        const year = parseInt(dateMatch[3]);
        
        // Find the month number by checking all language month names
        let monthIndex = -1;
        for (const [langKey, months] of Object.entries(monthNames)) {
          const index = months.findIndex(month => 
            month.toLowerCase() === monthText.toLowerCase()
          );
          if (index !== -1) {
            monthIndex = index;
            break;
          }
        }
        
        if (monthIndex !== -1) {
          // Create a date object with the extracted values
          originalDate = new Date(year, monthIndex, day);
        }
      }
      
      // If we couldn't parse the date, skip this element
      if (!originalDate || isNaN(originalDate.getTime())) {
        return;
      }
      
      // Format the date in the new language
      const formattedDate = originalDate.toLocaleDateString(localeMap[lang] || 'de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      dateElement.textContent = formattedDate;
    }
  });
}

// Helper function to check if signatory is new (within last 10 days)
function isSignatoryNew(signatory) {
  if (!signatory.timestamp && !signatory.date) return false;
  
  let signatoryDate;
  
  // Parse timestamp from various possible formats
  if (signatory.timestamp) {
    if (signatory.timestamp?.seconds) {
      // Firestore timestamp format
      signatoryDate = new Date(signatory.timestamp.seconds * 1000);
    } else if (signatory.timestamp?.toDate) {
      // Firestore timestamp object
      signatoryDate = signatory.timestamp.toDate();
    } else {
      // ISO string or regular Date
      signatoryDate = new Date(signatory.timestamp);
    }
  } else if (signatory.date) {
    // Use date field as fallback
    signatoryDate = new Date(signatory.date);
  }
  
  // Calculate 10 days ago
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  
  // Ensure we have a valid date
  if (!signatoryDate || isNaN(signatoryDate.getTime())) {
    return false;
  }
  
  return signatoryDate > tenDaysAgo;
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
  
  // Store signatories globally for sorting
  allSignatories = signatories;
  
  // Animate counter
  animateSignatureCounter(signatories.length);
  
  // Remove any existing pagination containers
  document.querySelectorAll('.pagination-container').forEach(container => {
    container.remove();
  });
  
  const paginationContainer = document.createElement('div');
  
  // Clear existing content
  signatoriesList.innerHTML = '';
  
  // Define constants for pagination
  const SIGNATORIES_PER_PAGE = 12;
  let currentPage = 1;
  
  // Filter and sort signatories
  try {
    // First, filter by search term if present
    let filteredSignatories = signatories;
    if (currentSearchTerm) {
      filteredSignatories = signatories.filter(signatory => {
        const name = (signatory.name || '').toLowerCase();
        const location = (signatory.location || '').toLowerCase();
        return name.includes(currentSearchTerm) || location.includes(currentSearchTerm);
      });
    }
    
    // Then sort the filtered results
    let sortedSignatories = [...filteredSignatories];
    
    switch (currentSortOrder) {
      case 'newest':
        // Sort by date, newest first
        sortedSignatories.sort((a, b) => {
          const timestampA = a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.timestamp || a.date || 0);
          const timestampB = b.timestamp?.seconds ? new Date(b.timestamp.seconds * 1000) : new Date(b.timestamp || b.date || 0);
          return timestampB - timestampA;
        });
        break;
        
      case 'oldest':
        // Sort by date, oldest first
        sortedSignatories.sort((a, b) => {
          const timestampA = a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.timestamp || a.date || 0);
          const timestampB = b.timestamp?.seconds ? new Date(b.timestamp.seconds * 1000) : new Date(b.timestamp || b.date || 0);
          return timestampA - timestampB;
        });
        break;
        
      case 'name-asc':
        // Sort by name A-Z
        sortedSignatories.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
        
      case 'name-desc':
        // Sort by name Z-A
        sortedSignatories.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameB.localeCompare(nameA);
        });
        break;
        
      case 'location-asc':
        // Sort by location A-Z (ignore postal codes at the beginning)
        sortedSignatories.sort((a, b) => {
          // Remove postal codes (numbers at the beginning) from location
          const locationA = (a.location || '').replace(/^\d+\s*/, '').toLowerCase();
          const locationB = (b.location || '').replace(/^\d+\s*/, '').toLowerCase();
          return locationA.localeCompare(locationB);
        });
        break;
        
      case 'location-desc':
        // Sort by location Z-A (ignore postal codes at the beginning)
        sortedSignatories.sort((a, b) => {
          // Remove postal codes (numbers at the beginning) from location
          const locationA = (a.location || '').replace(/^\d+\s*/, '').toLowerCase();
          const locationB = (b.location || '').replace(/^\d+\s*/, '').toLowerCase();
          return locationB.localeCompare(locationA);
        });
        break;
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(sortedSignatories.length / SIGNATORIES_PER_PAGE);
    
    // Function to display a specific page of signatories
    const displayPage = (page) => {
      try {
        // Clear current signatories
        signatoriesList.innerHTML = '';
        
        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        const startIndex = (page - 1) * SIGNATORIES_PER_PAGE;
        const endIndex = Math.min(startIndex + SIGNATORIES_PER_PAGE, sortedSignatories.length);
        
        // Display the signatories for this page
        for (let i = startIndex; i < endIndex; i++) {
          const signatory = sortedSignatories[i];
          
          if (!signatory) {
            console.warn('Skipping undefined signatory at index', i);
            continue;
          }
          
          const signatoryElement = document.createElement('div');
          signatoryElement.className = 'signatory reveal-item';
          signatoryElement.style.opacity = '1';  // Ensure visible immediately
          signatoryElement.style.transform = 'translateY(0)';  // No initial transform
          
          // Check if signatory is new (within last 10 days)
          const isNew = isSignatoryNew(signatory);
          
          // Format the signature date
          const formatSignatureDate = (signatory) => {
            let date;
            if (signatory.timestamp?.seconds) {
              date = new Date(signatory.timestamp.seconds * 1000);
            } else if (signatory.timestamp?.toDate) {
              date = signatory.timestamp.toDate();
            } else if (signatory.timestamp) {
              date = new Date(signatory.timestamp);
            } else if (signatory.date) {
              date = new Date(signatory.date);
            } else {
              return '';
            }
            
            // Get current language
            const currentLang = document.documentElement.getAttribute('lang') || 'de';
            
            // Format with written month names based on language
            const localeMap = {
              'de': 'de-DE',
              'en': 'en-US', 
              'fr': 'fr-FR',
              'it': 'it-IT'
            };
            
            return date.toLocaleDateString(localeMap[currentLang] || 'de-DE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
          };
          
          const formattedDate = formatSignatureDate(signatory);
          
          signatoryElement.innerHTML = `
            <div class="signatory-name">${capitalizeFirstLetter(signatory.name) || 'Unbekannt'}</div>
            <div class="signatory-location">${signatory.location || 'Unbekannt'}</div>
            ${formattedDate ? `<div class="signatory-date">${formattedDate}</div>` : ''}
            ${isNew ? '<div class="new-banner" data-i18n="new_banner">New</div>' : ''}
          `;
          
          fragment.appendChild(signatoryElement);
        }
        
        // Add signatories to the DOM
        signatoriesList.appendChild(fragment);
        
        // Apply translations to new banner elements
        const currentLang = document.documentElement.getAttribute('lang') || 'de';
        applyTranslationsToNewElements(currentLang);
        
        // Update pagination UI
        updatePaginationUI(page, totalPages);
      } catch (batchError) {
        console.error('Error displaying signatories page:', batchError);
      }
    };
    
    // Function to update pagination UI
    const updatePaginationUI = (page, totalPages) => {
      if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
      }
      
      paginationContainer.className = 'pagination-container';
      paginationContainer.innerHTML = '';
      
      // Previous button
      const prevBtn = document.createElement('button');
      prevBtn.className = 'pagination-btn pagination-prev';
      prevBtn.innerHTML = '&laquo;';
      prevBtn.disabled = page === 1;
      prevBtn.addEventListener('click', () => {
        if (page > 1) {
          currentPage--;
          displayPage(currentPage);
        }
      });
      paginationContainer.appendChild(prevBtn);
      
      // Page numbers
      const pageNumbersContainer = document.createElement('div');
      pageNumbersContainer.className = 'pagination-numbers';
      
      // Calculate which page numbers to show
      const maxVisiblePages = 5;
      let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // First page + ellipsis if needed
      if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.className = 'pagination-btn pagination-number';
        firstPageBtn.textContent = '1';
        firstPageBtn.addEventListener('click', () => {
          currentPage = 1;
          displayPage(currentPage);
        });
        pageNumbersContainer.appendChild(firstPageBtn);
        
        if (startPage > 2) {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'pagination-ellipsis';
          ellipsis.textContent = '...';
          pageNumbersContainer.appendChild(ellipsis);
        }
      }
      
      // Page number buttons
      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn pagination-number';
        if (i === page) {
          pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
          currentPage = i;
          displayPage(currentPage);
        });
        pageNumbersContainer.appendChild(pageBtn);
      }
      
      // Last page + ellipsis if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'pagination-ellipsis';
          ellipsis.textContent = '...';
          pageNumbersContainer.appendChild(ellipsis);
        }
        
        const lastPageBtn = document.createElement('button');
        lastPageBtn.className = 'pagination-btn pagination-number';
        lastPageBtn.textContent = totalPages;
        lastPageBtn.addEventListener('click', () => {
          currentPage = totalPages;
          displayPage(currentPage);
        });
        pageNumbersContainer.appendChild(lastPageBtn);
      }
      
      paginationContainer.appendChild(pageNumbersContainer);
      
      // Next button
      const nextBtn = document.createElement('button');
      nextBtn.className = 'pagination-btn pagination-next';
      nextBtn.innerHTML = '&raquo;';
      nextBtn.disabled = page === totalPages;
      nextBtn.addEventListener('click', () => {
        if (page < totalPages) {
          currentPage++;
          displayPage(currentPage);
        }
      });
      paginationContainer.appendChild(nextBtn);
    };
    
    // Display first page
    displayPage(1);
    
    // Add pagination if there are more signatories
    if (totalPages > 1) {
      signatoriesList.after(paginationContainer);
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
        
        // Apply translations to elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
          const key = element.getAttribute('data-i18n-placeholder');
          if (translations[key]) {
            element.placeholder = translations[key];
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

// Wakethieving Modal Functions
window.openWakethievingModal = async function() {
  const modal = document.getElementById('wakethieving-modal');
  const modalBody = document.getElementById('modal-body');
  const modalTitle = document.getElementById('modal-title');
  
  if (!modal || !modalBody || !modalTitle) return;
  
  // Show modal
  modal.classList.add('active');
  document.body.classList.add('no-scroll');
  
  // Show loading state
  modalBody.innerHTML = '<div class="loading">Lade Wakethieving Rules...</div>';
  
  try {
    // Fetch wakethieving rules from GitHub API
    const response = await fetch('https://raw.githubusercontent.com/pfederi/wakethievingrules/main/wakethieving-rules.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const apiData = await response.json();
    
    // Detect current language from page
    const currentLang = document.documentElement.getAttribute('lang') || 'de';
    
    // Get language-specific data, fallback to English if not available
    let rulesData;
    if (apiData.languages && apiData.languages[currentLang]) {
      rulesData = apiData.languages[currentLang];
    } else if (apiData.languages && apiData.languages['en']) {
      rulesData = apiData.languages['en'];
    } else {
      // Backward compatibility for old structure
      rulesData = apiData;
    }
    
    // Language-specific translations for UI elements
    const translations = {
      'de': { learnMore: 'Mehr erfahren' },
      'en': { learnMore: 'Learn more' },
      'fr': { learnMore: 'En savoir plus' },
      'it': { learnMore: 'Scopri di più' }
    };
    const currentTranslations = translations[currentLang] || translations['de'];
    
    // Update modal title
    modalTitle.textContent = rulesData.content?.title || rulesData.title || 'Wakethieving Rules';
    
    // Build content HTML
    let contentHTML = '';
    
    // Add subtitle if available
    const subtitle = rulesData.content?.subtitle || rulesData.subtitle;
    if (subtitle) {
      contentHTML += `<p class="modal-subtitle">${subtitle}</p>`;
    }
    
    if (rulesData.rules && Array.isArray(rulesData.rules)) {
      rulesData.rules.forEach((rule, index) => {
        // Skip community rule entirely
        if (rule.id === 'community') {
          return;
        }
        
        contentHTML += `<div class="rule-category">`;
        
        // Add rule icon if available (check both apiData.icons and rulesData.icons)
        const icons = apiData.icons || rulesData.icons;
        if (icons && rule.icon && icons[rule.icon]) {
          contentHTML += `<div style="display: flex; align-items: center; margin-bottom: 1.5rem;">`;
          
          // Parse SVG path and handle multiple paths if needed
          const iconPath = icons[rule.icon];
          let svgContent = '';
          
          // Split complex paths that contain multiple path commands
          if (iconPath.includes('M') && iconPath.indexOf('M', 1) > 0) {
            // Multiple paths in one string - split them
            const paths = iconPath.split(/(?=M)/).filter(p => p.trim());
            paths.forEach(path => {
              svgContent += `<path d="${path.trim()}" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
            });
          } else {
            // Single path
            svgContent = `<path d="${iconPath}" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
          }
          
          const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
          const svgStyle = isDarkMode 
            ? 'margin-right: 1rem; flex-shrink: 0; color: #91BED4;'
            : 'margin-right: 1rem; flex-shrink: 0; color: #304269;';
          
          contentHTML += `<svg width="32" height="32" viewBox="0 0 24 24" style="${svgStyle}">`;
          contentHTML += svgContent;
          contentHTML += `</svg>`;
          contentHTML += `<h3 style="margin: 0;">${rule.title}</h3>`;
          contentHTML += `</div>`;
        } else {
          contentHTML += `<h3>${rule.title}</h3>`;
        }
        
        contentHTML += `<div class="rule-content">`;
        
        // Handle different content structures based on actual API format
        if (rule.content) {
          // Handle text content
          if (typeof rule.content === 'string') {
            contentHTML += `<p>${rule.content}</p>`;
          } else if (typeof rule.content === 'object') {
            
            // Handle intro text
            if (rule.content.intro) {
              contentHTML += `<p>${rule.content.intro}</p>`;
            }
            
            // Handle main content section
            if (rule.content.main) {
              if (typeof rule.content.main === 'string') {
                contentHTML += `<p>${rule.content.main}</p>`;
              } else if (typeof rule.content.main === 'object') {
                if (rule.content.main.title) {
                  contentHTML += `<h4>${rule.content.main.title}</h4>`;
                }
                if (rule.content.main.description) {
                  contentHTML += `<p>${rule.content.main.description}</p>`;
                }
              }
            }
            
            // Handle daytime/nighttime sections
            if (rule.content.daytime) {
              if (rule.content.daytime.title) {
                contentHTML += `<h4>${rule.content.daytime.title}</h4>`;
              }
              if (rule.content.daytime.description) {
                contentHTML += `<p>${rule.content.daytime.description}</p>`;
              }
            }
            
            if (rule.content.nighttime) {
              if (rule.content.nighttime.title) {
                contentHTML += `<h4>${rule.content.nighttime.title}</h4>`;
              }
              if (rule.content.nighttime.description) {
                contentHTML += `<p>${rule.content.nighttime.description}</p>`;
              }
            }
            
            // Handle rules lists
            if (rule.content.rules && Array.isArray(rule.content.rules)) {
              contentHTML += '<ul>';
              rule.content.rules.forEach(subRule => {
                if (typeof subRule === 'string') {
                  contentHTML += `<li>${subRule}</li>`;
                } else if (typeof subRule === 'object') {
                  let ruleText = '';
                  if (subRule.title && subRule.description) {
                    ruleText = `<strong>${subRule.title}</strong> - ${subRule.description}`;
                  } else {
                    ruleText = subRule.title || subRule.text || subRule.description;
                  }
                  contentHTML += `<li>${ruleText}</li>`;
                }
              });
              contentHTML += '</ul>';
            }
            
            // Handle equipment section
            if (rule.content.equipment && Array.isArray(rule.content.equipment)) {
              contentHTML += '<ul>';
              rule.content.equipment.forEach(item => {
                if (typeof item === 'string') {
                  contentHTML += `<li>${item}</li>`;
                } else if (typeof item === 'object') {
                  let equipText = '';
                  if (item.title && item.description) {
                    equipText = `<strong>${item.title}</strong> - ${item.description}`;
                  } else {
                    equipText = item.title || item.name || item.description;
                  }
                  contentHTML += `<li>${equipText}</li>`;
                }
              });
              contentHTML += '</ul>';
              
              // Add local info box for safety equipment
              if (rule.id === 'safety-equipment') {
                const localInfoText = {
                  'de': 'Restube bietet aufblasbare Schwimmwesten, die perfekt für diese Anforderung sind. 10% Rabatt mit Code: FEDERI10X',
                  'en': 'Restube offers inflatable life jackets perfect for this requirement. 10% discount with code: FEDERI10X',
                  'fr': 'Restube propose des gilets de sauvetage gonflables parfaits pour cette exigence. 10% de réduction avec le code: FEDERI10X',
                  'it': 'Restube offre giubbotti di salvataggio gonfiabili perfetti per questo requisito. 10% di sconto con codice: FEDERI10X'
                };
                
                contentHTML += `<div class="distance-info">`;
                contentHTML += `<p><strong>ℹ️ ${localInfoText[currentLang] || localInfoText['de']}</strong></p>`;
                contentHTML += `<p><a href="https://indiana-paddlesurf.com/de_ch/shop/accessories/safety.html" target="_blank" rel="noopener noreferrer">${currentTranslations.learnMore}</a></p>`;
                contentHTML += `</div>`;
              }
            } else {
              // Add local info box for safety equipment (when no equipment array exists)
              if (rule.id === 'safety-equipment') {
                const localInfoText = {
                  'de': 'Restube bietet aufblasbare Schwimmwesten, die perfekt für diese Anforderung sind. 10% Rabatt mit Code: FEDERI10X',
                  'en': 'Restube offers inflatable life jackets perfect for this requirement. 10% discount with code: FEDERI10X',
                  'fr': 'Restube propose des gilets de sauvetage gonflables parfaits pour cette exigence. 10% de réduction avec le code: FEDERI10X',
                  'it': 'Restube offre giubbotti di salvataggio gonfiabili perfetti per questo requisito. 10% di sconto con codice: FEDERI10X'
                };
                
                contentHTML += `<div class="distance-info">`;
                contentHTML += `<p><strong>ℹ️ ${localInfoText[currentLang] || localInfoText['de']}</strong></p>`;
                contentHTML += `<p><a href="https://indiana-paddlesurf.com/de_ch/shop/accessories/safety.html" target="_blank" rel="noopener noreferrer">${currentTranslations.learnMore}</a></p>`;
                contentHTML += `</div>`;
              }
            }
            
            // Handle warning section
            if (rule.content.warning) {
              contentHTML += `<div class="distance-info" style="border-left-color: #F26101; background-color: rgba(242, 97, 1, 0.05);">`;
              if (typeof rule.content.warning === 'string') {
                contentHTML += `<strong>⚠️ ${rule.content.warning}</strong>`;
              } else if (typeof rule.content.warning === 'object') {
                if (rule.content.warning.text) {
                  contentHTML += `<strong>⚠️ ${rule.content.warning.text}</strong>`;
                }
                if (rule.content.warning.title) {
                  contentHTML += `<strong>⚠️ ${rule.content.warning.title}</strong>`;
                }
                if (rule.content.warning.description) {
                  contentHTML += `<p>${rule.content.warning.description}</p>`;
                }
              }
              contentHTML += `</div>`;
            }
            
            // Handle description (for community section) - but skip community rule entirely
            if (rule.content.description && !rule.content.main && rule.id !== 'community') {
              contentHTML += `<p>${rule.content.description}</p>`;
            }
            
            // All content types are now handled above with the new API structure
          }
        }
        
        contentHTML += `</div>`;
        contentHTML += `</div>`;
      });
    }
    
    // Add footer message from new API structure
    const footerMessage = rulesData.ui?.footer?.message || rulesData.footer?.message;
    if (footerMessage) {
      contentHTML += `<p class="modal-footer-text">${footerMessage}</p>`;
    }
    
    // Add API source information
    if (apiData.api) {
      const apiInfo = apiData.api;
      const sourceText = rulesData.ui?.apiSource || 'Rules loaded from Wakethieving Rules API';
      const apiUrl = 'https://github.com/pfederi/wakethievingrules';
      
      let apiInfoText = `<a href="${apiUrl}" target="_blank" rel="noopener noreferrer">${sourceText}</a>`;
      
      if (apiInfo.version) {
        apiInfoText += ` • Version ${apiInfo.version}`;
      }
      
      if (apiInfo.lastUpdated) {
        const date = new Date(apiInfo.lastUpdated);
        const formattedDate = date.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'de-DE');
        apiInfoText += ` • Last updated: ${formattedDate}`;
      }
      
      if (apiInfo.license) {
        apiInfoText += ` • License: ${apiInfo.license}`;
      }
      
      contentHTML += `<p class="modal-api-info">${apiInfoText}</p>`;
    }
    
    // Update modal content
    modalBody.innerHTML = contentHTML;
    
  } catch (error) {
    console.error('Error loading wakethieving rules:', error);
    modalBody.innerHTML = `
      <div class="error">
        <h3>Fehler beim Laden der Wakethieving Rules</h3>
        <p>Die Regeln konnten nicht geladen werden. Bitte versuchen Sie es später erneut oder besuchen Sie direkt:</p>
        <p><a href="https://nextwaveapp.ch/#rules" target="_blank" rel="noopener noreferrer">NextWave App - Wakethieving Rules</a></p>
      </div>
    `;
  }
};

window.closeWakethievingModal = function() {
  const modal = document.getElementById('wakethieving-modal');
  
  if (!modal) return;
  
  modal.classList.remove('active');
  document.body.classList.remove('no-scroll');
};

// Close modal when clicking outside of it
document.addEventListener('click', function(event) {
  const modal = document.getElementById('wakethieving-modal');
  if (modal && event.target === modal) {
    closeWakethievingModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeWakethievingModal();
  }
});

// Function to update the icon (needs to be accessible globally)
function updateDarkModeIcon(isDark) {
  const toggle = document.querySelector('.dark-mode-toggle');
  const toggleThumb = toggle?.querySelector('.toggle-thumb');
  
  if (!toggleThumb) return;
  
  // Apple SF Symbols style icons
  const sunIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  
  const moonIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  
  toggleThumb.innerHTML = isDark ? moonIcon : sunIcon;
}

// Sunrise-Sunset API Integration
async function getSunriseSunset(lat = 47.3769, lng = 8.5417) {
  // Default coordinates: Zürich, Switzerland
  try {
    const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results) {
      return {
        sunrise: new Date(data.results.sunrise),
        sunset: new Date(data.results.sunset)
      };
    }
  } catch (error) {
    console.error('Error fetching sunrise/sunset data:', error);
  }
  return null;
}

function shouldUseDarkMode(sunrise, sunset) {
  const now = new Date();
  // Dark mode between sunset and sunrise
  return now >= sunset || now < sunrise;
}

function setThemeBasedOnSun(sunrise, sunset) {
  // Check if user has manually set theme preference
  const manualTheme = localStorage.getItem('theme-manual');
  if (manualTheme) {
    // User has manually set theme, respect that
    return;
  }
  
  const isDark = shouldUseDarkMode(sunrise, sunset);
  const theme = isDark ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update toggle UI
  const toggle = document.querySelector('.dark-mode-toggle');
  if (toggle) {
    toggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
    updateDarkModeIcon(isDark);
  }
}

function scheduleThemeUpdate(sunrise, sunset) {
  const now = new Date();
  let nextUpdate;
  
  if (now < sunrise) {
    // Before sunrise, next update is sunrise
    nextUpdate = sunrise;
  } else if (now < sunset) {
    // Between sunrise and sunset, next update is sunset
    nextUpdate = sunset;
  } else {
    // After sunset, next update is tomorrow's sunrise
    const tomorrowSunrise = new Date(sunrise);
    tomorrowSunrise.setDate(tomorrowSunrise.getDate() + 1);
    nextUpdate = tomorrowSunrise;
  }
  
  const msUntilUpdate = nextUpdate.getTime() - now.getTime();
  
  setTimeout(() => {
    setThemeBasedOnSun(sunrise, sunset);
    // Schedule next update
    const newSunrise = new Date(sunrise);
    const newSunset = new Date(sunset);
    if (now >= sunset) {
      newSunrise.setDate(newSunrise.getDate() + 1);
      newSunset.setDate(newSunset.getDate() + 1);
    }
    scheduleThemeUpdate(newSunrise, newSunset);
  }, msUntilUpdate);
}

// Dark Mode Toggle
function initDarkModeToggle() {
  const toggle = document.querySelector('.dark-mode-toggle');
  const toggleThumb = toggle?.querySelector('.toggle-thumb');

  if (!toggle || !toggleThumb) return;


  // Check for manual theme preference first
  const manualTheme = localStorage.getItem('theme-manual');
  let currentTheme;
  
  if (manualTheme) {
    // User has manually set theme
    currentTheme = manualTheme;
  } else {
    // Use auto theme based on sunrise/sunset
    currentTheme = localStorage.getItem('theme') || 'light';
  }
  
  const isDark = currentTheme === 'dark';

  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggle.setAttribute('aria-checked', 'true');
  }

  updateDarkModeIcon(isDark);

  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const isDark = newTheme === 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    localStorage.setItem('theme-manual', newTheme); // Mark as manually set

    toggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
    updateDarkModeIcon(isDark);
  });
}

// Initialize dark mode toggle
initDarkModeToggle();

// Initialize sunrise/sunset based theme
async function initSunriseSunsetTheme() {
  const manualTheme = localStorage.getItem('theme-manual');
  if (manualTheme) {
    // User has manually set theme, don't override
    return;
  }
  
  const sunData = await getSunriseSunset();
  if (sunData) {
    setThemeBasedOnSun(sunData.sunrise, sunData.sunset);
    scheduleThemeUpdate(sunData.sunrise, sunData.sunset);
  }
}

// Initialize sunrise/sunset theme on page load
initSunriseSunsetTheme();

// Global variable to store all signatories for sorting and filtering
let allSignatories = [];
let currentSortOrder = 'newest';
let currentSearchTerm = '';

// Initialize sort dropdown
function initSortDropdown() {
  const sortSelect = document.getElementById('sort-select');
  const searchInput = document.getElementById('search-input');
  
  if (!sortSelect) return;
  
  sortSelect.addEventListener('change', (e) => {
    currentSortOrder = e.target.value;
    if (allSignatories.length > 0) {
      displaySignatories(allSignatories);
    }
  });
  
  // Initialize search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.toLowerCase().trim();
      if (allSignatories.length > 0) {
        displaySignatories(allSignatories);
      }
    });
  }
}