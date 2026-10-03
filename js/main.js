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
  const projectStatusClass = status => /complete/i.test(String(status || '')) ? 'status-complete' : 'status-dev';
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
    const capacities = (project.capacity_fields || []).filter(item => item && (item.label || item.value)).map(item => `<div><strong>${escapeHtml([item.value, item.unit].filter(Boolean).join(' '))}</strong><span>${escapeHtml(item.label)}</span></div>`).join('');
    const timeline = (project.project_timeline || []).filter(item => item && (item.phase || item.description)).map(item => `<li><strong>${escapeHtml(item.date)} · ${escapeHtml(item.phase)}</strong><span>${escapeHtml(item.description)}</span></li>`).join('');
    const gallery = (project.project_gallery || []).map(safeProjectUrl).filter(Boolean).map((src, index) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(project.title)} project gallery image ${index + 1}" loading="lazy">`).join('');
    const articles = (project.related_articles || []).filter(item => item && item.title && safeProjectUrl(item.url)).map(item => `<li><a href="${escapeHtml(safeProjectUrl(item.url))}">${escapeHtml(item.title)}</a></li>`).join('');
    root.innerHTML = `
      <div class="featured-project-head"><span class="eyebrow">${project.featured ? 'Featured project' : 'Project case study'} · ${escapeHtml(project.project_category)}</span><h2>${escapeHtml(project.title)}</h2><div class="featured-project-meta"><span><strong>Location:</strong> ${escapeHtml(project.location)}</span><span><strong>Customer type:</strong> ${escapeHtml(project.client_type)}</span><span><strong>Status:</strong> <em class="status ${projectStatusClass(project.status)}">${escapeHtml(project.status)}</em></span></div></div>
      <div class="featured-project-grid"><figure class="featured-project-image">${hero ? `<img src="${escapeHtml(hero)}" alt="${escapeHtml(project.title)}" loading="lazy">` : `<div class="project-image-placeholder" role="img" aria-label="Project image not yet added"><span>Project image</span></div>`}<figcaption>${hero ? escapeHtml(project.title) : 'Add a hero image in Pages CMS'}</figcaption></figure><div class="featured-project-copy"><p class="project-lede">${escapeHtml(project.short_description)}</p><p>${escapeHtml(project.full_description)}</p><div class="tech-tags tech-tags-lg" aria-label="Project technologies">${projectTags(project.technologies)}</div><a href="contact.html" class="btn btn-primary">Discuss a Similar Project</a></div></div>
      <div class="case-study" aria-label="${escapeHtml(project.title)} case study">
        <div class="case-study-section"><span class="eyebrow">01 · The brief</span><h3>Challenge</h3><p>${escapeHtml(project.challenge || 'Project challenge details to be added.')}</p><h3>Palm 11 solution</h3><p>${escapeHtml(project.palm11_solution || 'Solution details to be added.')}</p></div>
        <div class="case-study-section"><span class="eyebrow">02 · The system</span><h3>System architecture</h3><p>${escapeHtml(project.system_architecture || 'System architecture details to be added.')}</p><h3>Technology</h3><div class="tech-tags">${projectTags(project.technologies)}</div><h3>Capacity</h3>${capacities ? `<div class="project-stats">${capacities}</div>` : '<p>Capacity details will be published after technical design confirmation.</p>'}</div>
        <div class="case-study-section"><span class="eyebrow">03 · Delivery</span><h3>Implementation</h3><p>${escapeHtml(project.implementation || 'Implementation details to be added.')}</p><h3>Project timeline</h3>${timeline ? `<ul class="project-timeline">${timeline}</ul>` : '<p>Milestones will be published as the project schedule is confirmed.</p>'}</div>
        <div class="case-study-section"><span class="eyebrow">04 · Outcomes</span><h3>Results</h3><p>${escapeHtml(project.results || 'Results will be published when measured and verified.')}</p><h3>Project gallery</h3>${gallery ? `<div class="case-study-gallery">${gallery}</div>` : '<p>Project-specific images can be added in Pages CMS.</p>'}<h3>Related articles</h3>${articles ? `<ul>${articles}</ul>` : '<p>Related articles will appear here when published.</p>'}</div>
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





