document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. SCROLL EFFECT ON HEADER & NAVIGATION LINK ACTIVE STATE
     ========================================================================== */
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // Shrink header
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll spy for active navigation item
    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     2. MOBILE MENU DRAWER
     ========================================================================== */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function toggleMobileMenu() {
    mobileToggle.classList.toggle('active');
    mobileDrawer.classList.toggle('active');
    document.body.classList.toggle('block-scroll');
  }

  mobileToggle.addEventListener('click', toggleMobileMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });

  /* ==========================================================================
     3. INTERACTIVE SERVICE TABS
     ========================================================================== */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = `tab-${btn.dataset.tab}`;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTabId).classList.add('active');
    });
  });

  /* ==========================================================================
     4. INTERACTIVE ROI CALCULATOR
     ========================================================================== */
  const serviceTypeSelect = document.getElementById('service-type');
  const areaInput = document.getElementById('area-input');
  const areaSlider = document.getElementById('area-slider');
  const areaLabel = document.getElementById('area-label');
  const areaUnit = document.getElementById('area-unit');
  
  const resultTimeDrone = document.getElementById('result-time-drone');
  const resultTimeTraditional = document.getElementById('result-time-traditional');
  const resultSavings = document.getElementById('result-savings');
  const resultSavingsPercent = document.getElementById('result-savings-percent');
  const securityMeterFill = document.querySelector('.security-fill');
  const securityLabel = document.querySelector('.calc-results .result-item.full-width .result-comparison');

  // ROI Configuration parameters
  const serviceConfigs = {
    limpeza: {
      unitName: 'Área da Fachada/Telhado (m²)',
      unitSymbol: 'm²',
      sliderMin: 100,
      sliderMax: 10000,
      sliderStep: 100,
      defaultVal: 1000,
      droneRateHr: 220,       // m² cleaned per hour
      tradRateHr: 30,         // m² cleaned per hour with scaffolding
      droneCostPerUnit: 4.5,  // Cost in R$ per m²
      tradCostPerUnit: 8.5,   // Cost in R$ per m²
      savingsPct: 47,
      securityPct: 100,
      securityMsg: '<i class="fa-solid fa-shield-halved"></i> 100% de Redução do Risco de Queda (Operação via Solo - NR-35)'
    },
    pulverizacao: {
      unitName: 'Área da Lavoura (Hectares)',
      unitSymbol: 'ha',
      sliderMin: 10,
      sliderMax: 500,
      sliderStep: 5,
      defaultVal: 50,
      droneRateHr: 12,        // Hectares sprayed per hour
      tradRateHr: 2.2,        // Hectares sprayed with traditional tractor
      droneCostPerUnit: 90,   // Cost in R$ per hectare
      tradCostPerUnit: 180,   // Cost in R$ per hectare (includes crop crushing/amassamento losses)
      savingsPct: 50,
      securityPct: 90,
      securityMsg: '<i class="fa-solid fa-shield-halved"></i> 90% Menos Exposição a Defensivos (Operação Autônoma Remota)'
    },
    mapeamento: {
      unitName: 'Área de Mapeamento (Hectares)',
      unitSymbol: 'ha',
      sliderMin: 10,
      sliderMax: 1000,
      sliderStep: 10,
      defaultVal: 100,
      droneRateHr: 80,        // Hectares mapped per hour
      tradRateHr: 1.5,        // Hectares manual walking diagnostics per hour
      droneCostPerUnit: 25,   // Cost in R$ per hectare
      tradCostPerUnit: 65,    // Cost in R$ per hectare (labor & slow turnaround)
      savingsPct: 61,
      securityPct: 80,
      securityMsg: '<i class="fa-solid fa-shield-halved"></i> 80% Menos Risco de Acidentes de Campo (Picadas, Quedas, Calor)'
    }
  };

  function updateCalculatorUI(service) {
    const config = serviceConfigs[service];
    
    // Update labels and slider bounds
    areaLabel.textContent = config.unitName;
    areaUnit.textContent = config.unitSymbol;
    
    areaSlider.min = config.sliderMin;
    areaSlider.max = config.sliderMax;
    areaSlider.step = config.sliderStep;
    
    // Set default value if out of bounds
    let currentVal = parseInt(areaInput.value);
    if (isNaN(currentVal) || currentVal < config.sliderMin || currentVal > config.sliderMax) {
      areaInput.value = config.defaultVal;
      areaSlider.value = config.defaultVal;
    } else {
      areaSlider.value = currentVal;
    }
  }

  function formatTime(hours) {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `~ ${minutes} minutos`;
    }
    const days = Math.floor(hours / 8); // Assumes 8-hour workday
    const remainingHours = Math.round(hours % 8);
    
    if (days >= 1) {
      if (remainingHours > 0) {
        return `~ ${days} dia(s) e ${remainingHours}h`;
      }
      return `~ ${days} dia(s)`;
    }
    
    return `~ ${hours.toFixed(1)} horas`;
  }

  function calculateROI() {
    const service = serviceTypeSelect.value;
    const config = serviceConfigs[service];
    const area = parseFloat(areaInput.value);

    if (isNaN(area) || area <= 0) return;

    // Calculate times
    const droneTime = area / config.droneRateHr;
    const tradTime = area / config.tradRateHr;

    // Calculate costs
    const droneCost = area * config.droneCostPerUnit;
    const tradCost = area * config.tradCostPerUnit;
    const savedAmount = Math.max(0, tradCost - droneCost);
    const savingsPercent = Math.round((savedAmount / tradCost) * 100);

    // Update time values
    resultTimeDrone.textContent = formatTime(droneTime);
    resultTimeTraditional.textContent = `vs. ${formatTime(tradTime)} (Tradicional)`;

    // Update cost savings
    resultSavings.textContent = `R$ ${Math.round(savedAmount).toLocaleString('pt-BR')}`;
    resultSavingsPercent.textContent = `Economia estimada de ~ ${savingsPercent}%`;

    // Update safety metrics
    securityMeterFill.style.width = `${config.securityPct}%`;
    securityLabel.innerHTML = config.securityMsg;
  }

  // Handle service type change
  serviceTypeSelect.addEventListener('change', () => {
    updateCalculatorUI(serviceTypeSelect.value);
    calculateROI();
  });

  // Sync inputs (Number input <-> Range slider)
  areaInput.addEventListener('input', () => {
    let val = parseFloat(areaInput.value);
    const service = serviceTypeSelect.value;
    const config = serviceConfigs[service];

    if (!isNaN(val)) {
      if (val > config.sliderMax) val = config.sliderMax;
      areaSlider.value = val;
      calculateROI();
    }
  });

  areaSlider.addEventListener('input', () => {
    areaInput.value = areaSlider.value;
    calculateROI();
  });

  // Initial calculator setup
  updateCalculatorUI('limpeza');
  calculateROI();

  /* ==========================================================================
     5. RESPONSIVE TOUCH-FRIENDLY PORTFOLIO CAROUSEL
     ========================================================================== */
  const track = document.getElementById('gallery-track');
  const slides = Array.from(track.children);
  const nextButton = document.getElementById('gallery-next');
  const prevButton = document.getElementById('gallery-prev');
  const dotsContainer = document.getElementById('gallery-dots');

  let activeIndex = 0;

  // Create indicator dots dynamically
  function setupDots() {
    dotsContainer.innerHTML = '';
    const itemsToShow = getItemsToShow();
    const dotsCount = Math.max(1, slides.length - itemsToShow + 1);

    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        moveToSlide(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  function getItemsToShow() {
    const width = window.innerWidth;
    if (width <= 768) return 1;
    if (width <= 1024) return 2;
    return 3; // Desktop
  }

  function moveToSlide(index) {
    const itemsToShow = getItemsToShow();
    const maxIndex = slides.length - itemsToShow;
    
    // Clamp index
    activeIndex = Math.max(0, Math.min(index, maxIndex));

    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = 24; // Gap defined in style.css (.carousel-track)
    const amountToMove = activeIndex * (slideWidth + gap);

    track.style.transform = `translateX(-${amountToMove}px)`;

    // Update dots status
    const dots = Array.from(dotsContainer.children);
    dots.forEach((dot, idx) => {
      if (idx === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update button states
    prevButton.style.opacity = activeIndex === 0 ? '0.3' : '1';
    nextButton.style.opacity = activeIndex === maxIndex ? '0.3' : '1';
  }

  nextButton.addEventListener('click', () => {
    moveToSlide(activeIndex + 1);
  });

  prevButton.addEventListener('click', () => {
    moveToSlide(activeIndex - 1);
  });

  // Re-adjust slide position and dot configuration on resize
  window.addEventListener('resize', () => {
    setupDots();
    moveToSlide(activeIndex);
  });

  // Initial Carousel Setup
  setupDots();
  moveToSlide(0);

  /* ==========================================================================
     6. FAQ ACCORDION SYSTEM
     ========================================================================== */
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const faqItem = trigger.parentElement;
      const faqPanel = trigger.nextElementSibling;
      const isActive = faqItem.classList.contains('active');

      // Close all other panels for accordion effect
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-panel').style.maxHeight = null;
        item.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        faqItem.classList.add('active');
        faqPanel.style.maxHeight = faqPanel.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ==========================================================================
     7. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
     ========================================================================== */
  const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-right');

  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is in full view
  });

  animatedElements.forEach(el => animationObserver.observe(el));

  // Add scroll class trigger for stats count animation (bonus aesthetic detail)
  const statsSection = document.querySelector('.stats-section');
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  function animateStatsNumbers() {
    statNumbers.forEach(num => {
      const target = parseInt(num.dataset.target);
      if (target === 0) return; // Risco 0 doesn't count up, stays 0%

      let current = 0;
      const duration = 2000; // 2 seconds animation
      const stepTime = Math.abs(Math.floor(duration / target));
      
      const timer = setInterval(() => {
        current += 1;
        num.textContent = current + '%';
        if (current >= target) {
          num.textContent = target + '%';
          clearInterval(timer);
        }
      }, stepTime);
    });
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        animateStatsNumbers();
        statsAnimated = true;
      }
    });
  }, { threshold: 0.5 });

  if (statsSection) statsObserver.observe(statsSection);

  /* ==========================================================================
     8. CONTACT FORM SUBMISSION MOCKUP
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enviando... <i class="fa-solid fa-spinner fa-spin"></i>';
      formStatus.style.display = 'none';

      // Simulate API post request
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // Display success response
        formStatus.textContent = 'Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve via WhatsApp ou E-mail.';
        formStatus.className = 'form-status success';
        
        // Reset form
        contactForm.reset();
      }, 1500);
    });
  }

});
