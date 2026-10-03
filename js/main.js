// Palm 11 Energy - Main JS
document.addEventListener('DOMContentLoaded', function () {

  /* Mobile menu and Energy Solutions accordion */
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.nav-menu');
  const closeDropdowns = () => {
    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
      dropdown.classList.remove('open');
      const button = dropdown.querySelector('.nav-dropdown-toggle');
      if (button) {
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Show Energy Solutions links');
      }
    });
  };
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      if (!isOpen) closeDropdowns();
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      closeDropdowns();
    }));
  }
  document.querySelectorAll('.nav-dropdown-toggle').forEach(button => {
    const dropdown = button.closest('.nav-dropdown');
    button.addEventListener('click', () => {
      const isOpen = dropdown.classList.toggle('open');
      button.setAttribute('aria-expanded', isOpen);
      button.setAttribute('aria-label', isOpen ? 'Hide Energy Solutions links' : 'Show Energy Solutions links');
    });
    button.addEventListener('keydown', event => {
      if (event.key === 'Escape' && dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Show Energy Solutions links');
      }
    });
  });
  /* Sticky header */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () =>
      header.classList.toggle('scrolled', window.scrollY > 40)
    );
  }

  /* Project filters: query rendered CMS cards on every selection. */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const applyProjectFilter = filter => {
    document.querySelectorAll('.project-card[data-category]').forEach(card => {
      const cats = (card.dataset.category || '').split(/\s+/);
      card.style.display = (filter === 'all' || cats.includes(filter)) ? '' : 'none';
    });
  };
  if (filterBtns.length) {
    filterBtns.forEach(btn => btn.addEventListener('click', () => {
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      applyProjectFilter(btn.dataset.filter);
    }));
  }
  /* Contact form (front-end demo handler) */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      const original = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Enquiry Received ✓';
        form.reset();
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 2500);
      }, 900);
    });
  }

  /* Smooth scroll to hash (services anchors, Debojo anchor) */
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const [path, hash] = href.split('#');
      if (!hash) return;
      const samePage = !path || path === '' ||
        path === window.location.pathname.split('/').pop();
      if (!samePage) return;
      const target = document.getElementById(hash);
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', '#' + hash);
      }
    });
  });

  /* Reveal on scroll for the energy-flow section */
  const revealEls = document.querySelectorAll('.energy-flow, .featured-project-image, .project-card');
  if ('IntersectionObserver' in window && revealEls.length) {
    revealEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.16,1,.3,1)';
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }

  /* Pages CMS project content */
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const safeProjectUrl = value => {
    const url = String(value || '').trim();
    if (!url || /^\/\//.test(url) || (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^https?:\/\//i.test(url))) return '';
    return url;
  };
  const projectStatusClass = status => {
    const key = String(status || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return 'status-' + (key || 'concept');
  };
  const projectTags = values => (Array.isArray(values) ? values : []).filter(Boolean).map(value => `<span>${escapeHtml(value)}</span>`).join('');
  const projectCategories = project => {
    const value = String(project.project_category || '').toLowerCase();
    return ['commercial', 'residential', 'industrial', 'community', 'hybrid'].filter(category => value.includes(category)).join(' ');
  };
  const updateProjectSeo = project => {
    if (project.seo_title) document.title = project.seo_title;
    const description = document.querySelector('meta[name="description"]');
    if (description && project.seo_description) description.content = project.seo_description;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && project.seo_title) ogTitle.content = project.seo_title;
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && project.seo_description) ogDescription.content = project.seo_description;
  };
  const renderProjectCase = project => {
    if (!project) return;
    const root = document.querySelector('.featured-project .container');
    if (!root) return;
    const hero = safeProjectUrl(project.hero_image);
    const architectureImage = safeProjectUrl(project.system_architecture_image);
    const structuredCapacities = [
      ['Solar PV capacity', project.solar_pv_capacity],
      ['Battery storage capacity', project.battery_storage_capacity],
      ['Generator capacity', project.generator_capacity],
      ['Controlled / load capacity', project.controlled_load_capacity],
      ['Users / customers served', project.users_customers_served]
    ].filter(([, item]) => item && item.value).map(([label, item]) => ({ label, value: item.value, unit: item.unit }));
    const capacities = [...(project.capacity_fields || []).filter(item => item && (item.label || item.value)), ...structuredCapacities].map(item => `<div><strong>${escapeHtml([item.value, item.unit].filter(Boolean).join(' '))}</strong><span>${escapeHtml(item.label)}</span></div>`).join('');
    const projectMeta = [['Location', project.location], ['Project type', project.project_type || project.project_category], ['Customer type', project.client_type], ['Operating model', project.operating_model]].filter(([, value]) => value).map(([label, value]) => `<span><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</span>`).join('');
    const timeline = (project.project_timeline || []).filter(item => item && (item.phase || item.description)).map(item => `<li><strong>${escapeHtml(item.date)} · ${escapeHtml(item.phase)}</strong><span>${escapeHtml(item.description)}</span></li>`).join('');
    const gallery = (project.project_gallery || []).map((entry, index) => {
      const item = typeof entry === 'string' ? { image: entry } : (entry || {});
      const src = safeProjectUrl(item.image || item.src || item.url);
      if (!src) return '';
      const category = String(item.category || '').trim();
      const caption = String(item.caption || '').trim();
      const alt = String(item.alt_text || caption || category || `${project.title} project photo ${index + 1}`).trim();
      const label = [category, caption].filter(Boolean).map(escapeHtml);
      return `<figure class="project-gallery-item"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">${label.length ? `<figcaption>${label.map((text, position) => position === 0 && category ? `<strong>${text}</strong>` : text).join(' · ')}</figcaption>` : ''}</figure>`;
    }).filter(Boolean).join('');
    const articles = (project.related_articles || []).filter(item => item && item.title && safeProjectUrl(item.url)).map(item => `<li><a href="${escapeHtml(safeProjectUrl(item.url))}">${escapeHtml(item.title)}</a></li>`).join('');
    const verifiedOutcomes = (project.project_outcomes || []).filter(item => item && item.verified_for_publication === true && item.label && item.value).map(item => `<div class="project-outcome"><strong>${escapeHtml([item.value, item.unit].filter(Boolean).join(' '))}</strong><span>${escapeHtml(item.label)}</span>${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}</div>`).join('');
    const verifiedSummary = project.results_verified === true ? String(project.results || '').trim() : '';
    const resultsSection = verifiedSummary || verifiedOutcomes ? `<div class="case-study-section"><span class="eyebrow">04 · Outcomes</span><h3>Verified results</h3>${verifiedSummary ? `<p>${escapeHtml(verifiedSummary)}</p>` : ''}${verifiedOutcomes ? `<div class="project-outcomes">${verifiedOutcomes}</div>` : ''}</div>` : '';
    root.innerHTML = `
      <div class="featured-project-head"><span class="eyebrow">${project.featured ? 'Featured project' : 'Project case study'} · ${escapeHtml(project.project_category)}</span><h2>${escapeHtml(project.title)}</h2><div class="featured-project-meta">${projectMeta}<span><strong>Project stage:</strong> <em class="status ${projectStatusClass(project.status)}">${escapeHtml(project.status)}</em></span></div></div>
      <div class="featured-project-grid"><figure class="featured-project-image">${hero ? `<img src="${escapeHtml(hero)}" alt="${escapeHtml(project.title)}" loading="lazy">` : `<div class="project-image-placeholder" role="img" aria-label="Project image not yet added"><span>Project image</span></div>`}<figcaption>${hero ? escapeHtml(project.title) : 'Add a hero image in Pages CMS'}</figcaption></figure><div class="featured-project-copy"><p class="project-lede">${escapeHtml(project.short_description)}</p><p>${escapeHtml(project.full_description)}</p><div class="tech-tags tech-tags-lg" aria-label="Project technologies">${projectTags(project.technologies)}</div><a href="contact.html" class="btn btn-primary">Discuss a Similar Project</a></div></div>
      <div class="case-study" aria-label="${escapeHtml(project.title)} case study">
        <div class="case-study-section"><span class="eyebrow">01 · The brief</span><h3>Challenge</h3><p>${escapeHtml(project.challenge || 'Challenge details will be published after confirmation and approval by Palm 11.')}</p><h3>Palm 11 solution</h3><p>${escapeHtml(project.palm11_solution || 'Solution details will be published after confirmation and approval by Palm 11.')}</p></div>
        <div class="case-study-section"><span class="eyebrow">02 · The system</span><h3>System architecture</h3>${project.system_architecture ? `<p>${escapeHtml(project.system_architecture)}</p>` : ''}${architectureImage ? `<figure class="system-architecture-diagram"><img src="${escapeHtml(architectureImage)}" alt="Approved system architecture diagram for ${escapeHtml(project.title)}" loading="lazy"><figcaption>System architecture</figcaption></figure>` : '<p class="architecture-pending">Approved system architecture diagram will be added when available.</p>'}<h3>Technology</h3><div class="tech-tags">${projectTags(project.technologies)}</div><h3>Technical specifications &amp; capacity</h3>${capacities ? `<div class="project-stats">${capacities}</div>` : '<p>No capacity figures or technical specifications are published pending confirmation and approval by Palm 11.</p>'}</div>
        <div class="case-study-section"><span class="eyebrow">03 · Delivery</span><h3>Implementation</h3><p>${escapeHtml(project.implementation || 'Implementation details will be published after confirmation and approval by Palm 11.')}</p><h3>Project timeline</h3>${timeline ? `<ul class="project-timeline">${timeline}</ul>` : '<p>Timeline details will be published after confirmation and approval by Palm 11.</p>'}</div>
        ${resultsSection}${gallery ? `<div class="case-study-section"><h3>Project gallery</h3><div class="case-study-gallery">${gallery}</div></div>` : ''}${articles ? `<div class="case-study-section"><h3>Related articles</h3><ul>${articles}</ul></div>` : ''}
      </div><div class="case-study-contact"><div><span class="eyebrow">Planning an energy project?</span><h3>Talk with Palm 11 about your site.</h3></div><a href="contact.html" class="btn btn-primary">Contact Palm 11</a></div>`;
    root.parentElement.id = 'project-case-study';
    updateProjectSeo(project);
  };
  const renderProjectCards = projects => {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;
    grid.innerHTML = projects.map(project => {
      const image = safeProjectUrl(project.hero_image);
      const stats = (project.capacity_fields || []).slice(0, 3).map(item => `<div><strong>${escapeHtml([item.value, item.unit].filter(Boolean).join(' '))}</strong><span>${escapeHtml(item.label)}</span></div>`).join('');
      return `<article class="project-card${project.featured ? ' project-card-featured' : ''}" data-project-slug="${escapeHtml(project.slug)}" data-category="${escapeHtml(projectCategories(project))}" data-status="${escapeHtml(project.status)}" data-featured="${Boolean(project.featured)}"><div class="project-image">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(project.title)}" loading="lazy">` : '<div class="project-image-placeholder" aria-hidden="true"></div>'}<span class="project-badge">${project.featured ? 'Featured · ' : ''}${escapeHtml(project.project_category)}</span></div><div class="project-body"><h3>${escapeHtml(project.title)}</h3><div class="project-meta"><span>${escapeHtml(project.location)}</span><span>${escapeHtml(project.status)}</span></div><p>${escapeHtml(project.short_description)}</p>${stats ? `<div class="project-stats">${stats}</div>` : ''}<div class="tech-tags">${projectTags((project.technologies || []).slice(0, 4))}</div><div class="project-card-footer"><span class="project-status-label">${escapeHtml(project.client_type)}</span><a class="project-link" href="#project-case-study" data-project-select="${escapeHtml(project.slug)}">View case study <span aria-hidden="true">→</span></a></div></div></article>`;
    }).join('');
    const activeFilter = document.querySelector('.filter-btn.active');
    if (activeFilter) applyProjectFilter(activeFilter.dataset.filter);
    grid.querySelectorAll('[data-project-select]').forEach(link => link.addEventListener('click', () => {
      const selected = projects.find(project => project.slug === link.dataset.projectSelect);
      renderProjectCase(selected);
    }));
  };
  fetch('data/projects.json').then(response => {
    if (!response.ok) throw new Error('Project content could not be loaded.');
    return response.json();
  }).then(projects => {
    if (!Array.isArray(projects)) throw new Error('Project content must be a list.');
    const featured = projects.find(project => project.featured) || projects[0];
    renderProjectCase(featured);
    renderProjectCards(projects);
  }).catch(error => console.warn('Pages CMS project content:', error.message));});













