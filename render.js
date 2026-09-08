/*
 * Renders PROJECTS (from projects.js) and FEATURED into the page.
 * No dependencies, no build step — degrades gracefully when optional
 * fields (icon, screenshots, links, tags) are missing.
 */

function initials(name) {
  return name
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

// Accepts project.screenshots as an array of strings or {src, caption}
// objects, or the older single project.screenshot string — always
// returns a normalized array of {src, caption} (caption may be undefined).
function normalizeScreenshots(project) {
  const raw = project.screenshots || (project.screenshot ? [project.screenshot] : []);
  return raw.map((s) => (typeof s === "string" ? { src: s } : s));
}

function linkButtons(links) {
  if (!links) return "";
  const buttons = [];
  if (links.website) {
    buttons.push(
      `<a class="btn btn-primary" href="${links.website}" target="_blank" rel="noopener">Website ↗</a>`
    );
  }
  if (links.download) {
    buttons.push(
      `<a class="btn btn-dashed-accent" href="${links.download}" target="_blank" rel="noopener">Download ↓</a>`
    );
  }
  if (links.portfolio) {
    buttons.push(
      `<a class="btn" href="${links.portfolio}" target="_blank" rel="noopener">Portfolio ↗</a>`
    );
  }
  if (links.repo) {
    buttons.push(
      `<a class="btn" href="${links.repo}" target="_blank" rel="noopener">Source ↗</a>`
    );
  }
  return buttons.join("");
}

function tagBadges(project) {
  const badges = [];
  if (project.fork) {
    badges.push(`<span class="tag tag-fork">fork</span>`);
  }
  (project.tags || []).forEach((t) => {
    const lower = t.toLowerCase();
    const cls =
      lower === "private"
        ? "tag tag-private"
        : lower === "canary" || lower === "beta"
        ? "tag tag-canary"
        : "tag";
    badges.push(`<span class="${cls}">${t}</span>`);
  });
  return badges.length
    ? `<div class="card-tags">${badges.join("")}</div>`
    : "";
}

/* ---------- lightbox (shared singleton, lazily built) ---------- */

const Lightbox = {
  el: null,
  imgEl: null,
  captionEl: null,
  counterEl: null,
  gallery: [],
  index: 0,

  ensure() {
    if (this.el) return;
    const overlay = el("div", "lightbox-overlay");
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close">✕</button>
      <button class="lightbox-nav lightbox-prev" aria-label="Previous">‹</button>
      <div class="lightbox-content">
        <img class="lightbox-img" alt="" />
        <div class="lightbox-meta">
          <span class="lightbox-caption"></span>
          <span class="lightbox-counter"></span>
        </div>
      </div>
      <button class="lightbox-nav lightbox-next" aria-label="Next">›</button>
    `;
    document.body.appendChild(overlay);

    this.el = overlay;
    this.imgEl = overlay.querySelector(".lightbox-img");
    this.captionEl = overlay.querySelector(".lightbox-caption");
    this.counterEl = overlay.querySelector(".lightbox-counter");

    overlay.querySelector(".lightbox-close").onclick = () => this.close();
    overlay.querySelector(".lightbox-prev").onclick = () => this.step(-1);
    overlay.querySelector(".lightbox-next").onclick = () => this.step(1);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.close();
    });
    document.addEventListener("keydown", (e) => {
      if (!this.el.classList.contains("open")) return;
      if (e.key === "Escape") this.close();
      if (e.key === "ArrowLeft") this.step(-1);
      if (e.key === "ArrowRight") this.step(1);
    });
  },

  open(gallery, index) {
    this.ensure();
    this.gallery = gallery;
    this.index = index;
    this.render();
    this.el.classList.add("open");
    document.body.style.overflow = "hidden";
  },

  close() {
    if (!this.el) return;
    this.el.classList.remove("open");
    document.body.style.overflow = "";
  },

  step(delta) {
    this.index = (this.index + delta + this.gallery.length) % this.gallery.length;
    this.render();
  },

  render() {
    const shot = this.gallery[this.index];
    this.imgEl.src = shot.src;
    this.imgEl.alt = shot.caption || "";
    this.captionEl.textContent = shot.caption || "";
    this.counterEl.textContent =
      this.gallery.length > 1 ? `${this.index + 1} / ${this.gallery.length}` : "";
    const multi = this.gallery.length > 1;
    this.el.querySelector(".lightbox-prev").style.display = multi ? "" : "none";
    this.el.querySelector(".lightbox-next").style.display = multi ? "" : "none";
  },
};

function screenshotBlock(project) {
  const shots = normalizeScreenshots(project);
  if (!shots.length) return null;

  const wrap = el("div", "card-screenshot-wrap");
  let cursor = 0;

  if (shots.length === 1) {
    const img = el("img", "card-screenshot");
    img.src = shots[0].src;
    img.alt = shots[0].caption || `${project.name} screenshot`;
    img.loading = "lazy";
    img.onerror = () => wrap.remove();
    wrap.appendChild(img);
  } else {
    // Two stacked layers crossfade directly into each other (the incoming
    // image fades in on top of the outgoing one) instead of fading to the
    // background in between.
    const layerA = el("img", "card-screenshot layer-visible");
    const layerB = el("img", "card-screenshot");
    layerA.src = shots[0].src;
    layerA.alt = shots[0].caption || `${project.name} screenshot`;
    layerA.loading = "lazy";
    layerA.onerror = () => wrap.remove();
    wrap.appendChild(layerA);
    wrap.appendChild(layerB);

    const badge = el("span", "screenshot-count-badge", `⛶ ${shots.length}`);
    wrap.appendChild(badge);

    let front = layerA;
    let back = layerB;

    const advance = () => {
      cursor = (cursor + 1) % shots.length;
      const shot = shots[cursor];
      back.onload = () => {
        back.classList.add("layer-visible");
        front.classList.remove("layer-visible");
        [front, back] = [back, front];
      };
      back.alt = shot.caption || `${project.name} screenshot`;
      back.src = shot.src;
    };

    let timer = setInterval(advance, 5000);
    wrap.addEventListener("mouseenter", () => clearInterval(timer));
    wrap.addEventListener("mouseleave", () => {
      timer = setInterval(advance, 5000);
    });
  }

  wrap.addEventListener("click", () => Lightbox.open(shots, cursor));
  return wrap;
}

// Shared icon + stacked name/tagline row, used by both the featured card
// and grid cards. `big` swaps in the larger featured-size icon/heading.
function buildHead(project, { big } = {}) {
  const sizeClass = big ? " featured-icon" : "";
  const head = el("div", `card-head${big ? " featured-head" : ""}`);

  if (project.icon) {
    const icon = el("img", `card-icon${sizeClass}`);
    if (project.iconRounded) icon.classList.add("card-icon-rounded");
    icon.src = project.icon;
    icon.alt = "";
    icon.loading = "lazy";
    icon.onerror = () => {
      icon.replaceWith(el("div", `card-icon-fallback${sizeClass}`, initials(project.name)));
    };
    head.appendChild(icon);
  } else if (project.iconClass) {
    head.appendChild(
      el("div", `card-icon-fallback${sizeClass}`, `<i class="${project.iconClass}"></i>`)
    );
  } else {
    head.appendChild(el("div", `card-icon-fallback${sizeClass}`, initials(project.name)));
  }

  const titles = el("div", "card-titles");
  titles.appendChild(el(big ? "h2" : "h3", big ? null : "card-name", project.name));
  if (project.tagline) {
    titles.appendChild(el("p", "card-tagline", project.tagline));
  }
  head.appendChild(titles);

  return head;
}

function buildFeatured(project) {
  const section = el("section", "featured");

  const shots = screenshotBlock(project);
  if (shots) {
    shots.classList.add("featured-screenshot-wrap");
    section.appendChild(shots);
  }

  const body = el("div", "featured-body");
  body.appendChild(buildHead(project, { big: true }));

  body.insertAdjacentHTML(
    "beforeend",
    `
      ${project.description ? `<p>${project.description}</p>` : ""}
      ${tagBadges(project)}
      <div class="card-links">${linkButtons(project.links)}</div>
    `
  );
  section.appendChild(body);
  return section;
}

function renderFeaturedList(projects) {
  const mount = document.getElementById("featured-list");
  if (!mount || !projects || !projects.length) return;
  projects.forEach((p) => mount.appendChild(buildFeatured(p)));
}

function renderCard(project) {
  const card = el("article", "card");

  const shots = screenshotBlock(project);
  if (shots) card.appendChild(shots);

  const body = el("div", "card-body");
  body.appendChild(buildHead(project));

  if (project.description) {
    body.appendChild(el("p", "card-desc", project.description));
  }

  const tags = tagBadges(project);
  if (tags) body.appendChild(el("div", null, tags).firstChild);

  const links = linkButtons(project.links);
  body.appendChild(el("div", "card-links", links));

  card.appendChild(body);
  return card;
}

function renderGrid(projects) {
  const mount = document.getElementById("grid");
  if (!mount) return;
  projects.forEach((p) => mount.appendChild(renderCard(p)));
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof FEATURED_PROJECTS !== "undefined") renderFeaturedList(FEATURED_PROJECTS);
  if (typeof PROJECTS !== "undefined") renderGrid(PROJECTS);
});
