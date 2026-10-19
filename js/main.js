/**
 * Guardianes del Paushiyaku - main.js
 * Lógica interactiva: Pestañas amigables, navegación dinámica, galería con lightbox y contadores.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // 1. Control de Pestañas Principales (Friendly Tabs Navigation)
  // ========================================================================
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const navTabsContainer = document.querySelector('.tabs-nav-container');

  function activateTab(tabId, updateHash = true) {
    if (!tabId) return;

    // Remover activo de enlaces y paneles
    tabLinks.forEach(link => {
      const target = link.getAttribute('data-tab');
      if (target === tabId) {
        link.classList.add('active');
        // Scroll suave horizontal en móviles para mantener visible la pestaña activa
        if (navTabsContainer) {
          link.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      } else {
        link.classList.remove('active');
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === tabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Actualizar hash en URL sin recargar
    if (updateHash && history.pushState) {
      history.pushState(null, null, `#${tabId}`);
    }

    // Si entramos a la pestaña de Visor, asegurar redimensionamiento
    if (tabId === 'tab-visor') {
      const visorFrame = document.getElementById('visor-iframe');
      if (visorFrame && visorFrame.contentWindow) {
        // Enviar evento de redimensionado al iframe si está disponible
        visorFrame.contentWindow.dispatchEvent(new Event('resize'));
      }
    }

    // Scroll superior amigable
    const tabsBar = document.querySelector('.main-tabs-nav-wrapper');
    if (tabsBar) {
      const offsetTop = tabsBar.getBoundingClientRect().top + window.scrollY - 10;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  }

  // Event listener para clics en pestañas
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute('data-tab');
      activateTab(targetTab);
    });
  });

  // Botones de salto entre pestañas (Siguiente / Anterior)
  const switchTabButtons = document.querySelectorAll('[data-switch-tab]');
  switchTabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = btn.getAttribute('data-switch-tab');
      activateTab(targetTab);
    });
  });

  // Detección de hash inicial al cargar la página (ej. #tab-equipo o #equipo)
  function handleInitialHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      let targetTab = hash;
      if (!targetTab.startsWith('tab-')) {
        targetTab = `tab-${targetTab}`;
      }
      const matchingPane = document.getElementById(targetTab);
      if (matchingPane) {
        activateTab(targetTab, false);
        return;
      }
    }
    // Si no hay hash, activar la primera por defecto
    activateTab('tab-proyecto', false);
  }

  // Escuchar cambios de hash en el navegador (atrás / adelante)
  window.addEventListener('popstate', () => {
    handleInitialHash();
  });

  handleInitialHash();

  // ========================================================================
  // 2. Contadores Numéricos Animados en Métricas
  // ========================================================================
  const metricNumbers = document.querySelectorAll('.metric-num');
  let metricsAnimated = false;

  function animateCounters() {
    if (metricsAnimated) return;
    metricsAnimated = true;

    metricNumbers.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target') || '0');
      const duration = 1400; // ms
      const steps = 40;
      const stepTime = duration / steps;
      const stepValue = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += stepValue;
        if (current >= target) {
          counter.textContent = Number.isInteger(target) ? target.toLocaleString('es-EC') : target.toFixed(1);
          clearInterval(timer);
        } else {
          counter.textContent = Number.isInteger(target) ? Math.floor(current).toLocaleString('es-EC') : current.toFixed(1);
        }
      }, stepTime);
    });
  }

  // Lanzar animación
  setTimeout(animateCounters, 300);

  // ========================================================================
  // 3. Subfiltros de la Galería Fotográfica y Cartográfica
  // ========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ========================================================================
  // 4. Modal Lightbox Interactivo con Navegación Previa/Siguiente
  // ========================================================================
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close');
  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');

  let currentGalleryList = [];
  let currentIndex = 0;

  // Recolectar todas las imágenes ampliables (galería y gráficas de diagnóstico)
  function getVisibleImages() {
    const activeCards = Array.from(document.querySelectorAll('.gallery-card, .lightbox-trigger'))
      .filter(item => {
        return window.getComputedStyle(item).display !== 'none';
      });
    return activeCards;
  }

  function openModalAtIndex(index) {
    currentGalleryList = getVisibleImages();
    if (currentGalleryList.length === 0) return;

    if (index < 0) index = currentGalleryList.length - 1;
    if (index >= currentGalleryList.length) index = 0;
    currentIndex = index;

    const item = currentGalleryList[currentIndex];
    const fullSrc = item.getAttribute('data-full') || item.getAttribute('src');
    const caption = item.getAttribute('data-caption') || item.getAttribute('alt') || 'Guardianes del Paushiyaku';

    if (modalImg && modalCaption) {
      modalImg.src = fullSrc;
      modalCaption.textContent = caption;
    }

    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Delegación de clics en tarjetas de galería
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.gallery-card, .lightbox-trigger');
    if (card) {
      currentGalleryList = getVisibleImages();
      const index = currentGalleryList.indexOf(card);
      if (index !== -1) {
        openModalAtIndex(index);
      }
    }
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalPrev) {
    modalPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      openModalAtIndex(currentIndex - 1);
    });
  }

  if (modalNext) {
    modalNext.addEventListener('click', (e) => {
      e.stopPropagation();
      openModalAtIndex(currentIndex + 1);
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Navegación con teclado
  document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      openModalAtIndex(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      openModalAtIndex(currentIndex + 1);
    }
  });

});
