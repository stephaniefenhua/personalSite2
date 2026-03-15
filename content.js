/**
 * Loads content.json and injects text into elements via data attributes:
 *   data-content="path"       - textContent
 *   data-content-html="path"  - innerHTML
 *   data-content-list="path"  - array of strings or { html } for <ul>
 *   data-content-links="path"  - array of { label, href } for links
 *   data-content-jobs="path"   - array of { company, role, dates, highlights[] } for experience cards
 * Result is also stored in window.__content for other scripts.
 */
(function () {
  var isExperiencePage = window.location.pathname.indexOf('/experience') === 0;
  var contentPath = isExperiencePage ? '../content.json' : 'content.json';

  function get(obj, path) {
    return path.split('.').reduce(function (o, key) { return o && o[key]; }, obj);
  }

  function injectMeta(content) {
    var meta = content.meta;
    var shared = content.shared;
    if (!meta) return;
    document.title = isExperiencePage && content.experience && shared
      ? content.experience.title + ' · ' + shared.siteName
      : meta.title;
    var setMeta = function (attr, key, value) {
      var el = document.querySelector('meta[' + attr + '="' + key + '"]');
      if (el && value) el.setAttribute('content', value);
    };
    setMeta('name', 'description', isExperiencePage && content.experience && content.experience.metaDescription
      ? content.experience.metaDescription
      : meta.description);
    setMeta('name', 'author', meta.author);
    setMeta('property', 'og:title', meta.ogTitle || meta.title);
    setMeta('property', 'og:type', meta.ogType);
    setMeta('property', 'og:description', meta.ogDescription || meta.description);
    setMeta('property', 'og:image', meta.ogImage || meta.favicon);
    setMeta('name', 'twitter:card', meta.twitterCard);
    var faviconEl = document.getElementById('favicon');
    if (faviconEl && meta.favicon) faviconEl.href = meta.favicon;
  }

  function inject(content) {
    window.__content = content;
    injectMeta(content);

    document.querySelectorAll('[data-content]').forEach(function (el) {
      var value = get(content, el.getAttribute('data-content'));
      if (value != null) el.textContent = Array.isArray(value) ? value.join(' ') : value;
    });

    document.querySelectorAll('[data-content-html]').forEach(function (el) {
      var value = get(content, el.getAttribute('data-content-html'));
      if (value != null) el.innerHTML = value;
    });

    document.querySelectorAll('[data-content-list]').forEach(function (listEl) {
      var items = get(content, listEl.getAttribute('data-content-list'));
      if (!Array.isArray(items)) return;
      listEl.innerHTML = '';
      items.forEach(function (item) {
        var li = document.createElement('li');
        if (typeof item === 'string') {
          li.textContent = item;
        } else if (item && item.html) {
          li.innerHTML = Array.isArray(item.html) ? item.html.join('') : item.html;
        }
        listEl.appendChild(li);
      });
    });

    document.querySelectorAll('[data-content-links]').forEach(function (container) {
      var links = get(content, container.getAttribute('data-content-links'));
      if (!Array.isArray(links)) return;
      container.innerHTML = '';
      links.forEach(function (link, i) {
        var a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.label;
        a.target = link.href.startsWith('http') || link.href.startsWith('mailto:') ? '_blank' : '_self';
        if (link.target) a.target = link.target;
        container.appendChild(a);
        if (i < links.length - 1) container.appendChild(document.createTextNode(' '));
      });
    });

    document.querySelectorAll('[data-content-jobs]').forEach(function (container) {
      var jobs = get(content, container.getAttribute('data-content-jobs'));
      if (!Array.isArray(jobs)) return;
      container.innerHTML = '';
      jobs.forEach(function (job) {
        var card = document.createElement('article');
        card.className = 'job-card';
        var header = document.createElement('header');
        header.className = 'job-card-header';
        var company = document.createElement('span');
        company.className = 'job-company';
        company.textContent = job.company || '';
        var role = document.createElement('span');
        role.className = 'job-role';
        role.textContent = job.role ? (job.company ? ' · ' + job.role : job.role) : '';
        var dates = document.createElement('span');
        dates.className = 'job-dates';
        dates.textContent = job.dates || '';
        header.appendChild(company);
        header.appendChild(role);
        header.appendChild(dates);
        card.appendChild(header);
        if (job.paragraph) {
          var p = document.createElement('p');
          p.className = 'job-paragraph';
          p.textContent = Array.isArray(job.paragraph) ? job.paragraph.join(' ') : job.paragraph;
          card.appendChild(p);
        } else if (job.highlights && job.highlights.length) {
          var ul = document.createElement('ul');
          ul.className = 'job-highlights';
          job.highlights.forEach(function (text) {
            var li = document.createElement('li');
            li.textContent = text;
            ul.appendChild(li);
          });
          card.appendChild(ul);
        }
        container.appendChild(card);
      });
    });
  }

  fetch(contentPath)
    .then(function (r) { return r.json(); })
    .then(function (content) {
      inject(content);
      window.dispatchEvent(new CustomEvent('contentReady'));
    })
    .catch(function (err) { console.warn('Could not load content.json', err); });
})();
