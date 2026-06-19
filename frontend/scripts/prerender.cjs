#!/usr/bin/env node
/**
 * Post-build prerender for CRA.
 *
 * Reads build/index.html (the rich homepage shell) and emits per-route HTML
 * files at build/<route>/index.html with page-specific <title>, meta, OG tags,
 * canonical URL, JSON-LD, and a static content block — so crawlers, link
 * previews, and slow-network users see real content before React mounts.
 *
 * The generated files still load the same React bundle, so once JS runs,
 * React Router navigates to the correct route and the client app takes over.
 */
const fs = require('node:fs');
const path = require('node:path');

const SITE = process.env.PRERENDER_SITE_URL || 'https://reachripple-live-web.onrender.com';
const BUILD = path.resolve(__dirname, '..', 'build');
const SRC = path.join(BUILD, 'index.html');

if (!fs.existsSync(SRC)) {
  console.error('[prerender] build/index.html not found — did the React build succeed?');
  process.exit(1);
}

const baseHtml = fs.readFileSync(SRC, 'utf8');

// Tolerant regex: html-minifier may re-order attributes or strip quotes.
const SEO_RE = /<meta[^>]*data-rr-seo=["']?start["']?[^>]*>[\s\S]*?<meta[^>]*data-rr-seo=["']?end["']?[^>]*>/;
const CONTENT_RE = /<template[^>]*data-rr-prerender=["']?start["']?[^>]*>[\s\S]*?<template[^>]*data-rr-prerender=["']?end["']?[^>]*><\/template>/;

if (!SEO_RE.test(baseHtml) || !CONTENT_RE.test(baseHtml)) {
  console.error('[prerender] expected SEO and PRERENDER markers in build/index.html');
  process.exit(1);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function seoBlock({ title, description, path: routePath, jsonLd }) {
  const url = `${SITE}${routePath}`;
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const ogImage = `${SITE}/reachripple.jpg`;
  const ld = (jsonLd || []).map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`).join('\n    ');
  return `<meta data-rr-seo="start" />
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta property="og:site_name" content="ReachRipple" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:alt" content="ReachRipple — premium classifieds and services" />
    <meta property="og:locale" content="en_GB" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${ogImage}" />
    ${ld}
    <meta data-rr-seo="end" />`;
}

const SHELL_OPEN = `<div class="rr-shell" data-prerender="page">
        <header>
          <nav class="rr-nav" aria-label="Primary">
            <a class="rr-nav-brand" href="/" aria-label="ReachRipple home">
              <img src="/logomark.png" alt="" width="32" height="32" />
              <span><span class="rr-blue">Reach</span><span class="rr-purple">Ripple</span></span>
            </a>
            <div class="rr-nav-links">
              <a href="/escorts">Browse</a>
              <a href="/about">About</a>
              <a href="/safety">Safety</a>
              <a href="/contact">Contact</a>
              <a class="rr-cta rr-cta-secondary" href="/login">Sign in</a>
              <a class="rr-cta rr-cta-primary" href="/signup">Post a listing</a>
            </div>
          </nav>
        </header>
        <main id="main">`;

const SHELL_CLOSE = `</main>
        <footer class="rr-footer">
          <div class="rr-container">
            <div class="rr-footer-grid">
              <div><h4>ReachRipple</h4><ul>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul></div>
              <div><h4>Trust &amp; safety</h4><ul>
                <li><a href="/safety">Safety tips</a></li>
                <li><a href="/online-safety">Online Safety Act</a></li>
                <li><a href="/modern-slavery">Modern slavery</a></li>
                <li><a href="/law-enforcement">Law enforcement</a></li>
              </ul></div>
              <div><h4>Legal</h4><ul>
                <li><a href="/privacy">Privacy policy</a></li>
                <li><a href="/terms">Terms of service</a></li>
                <li><a href="/cookies">Cookies</a></li>
              </ul></div>
              <div><h4>Categories</h4><ul>
                <li><a href="/category/services">Services</a></li>
                <li><a href="/category/buy-sell">Buy &amp; Sell</a></li>
                <li><a href="/category/jobs">Jobs</a></li>
                <li><a href="/escorts">Adult (18+)</a></li>
              </ul></div>
            </div>
            <div class="rr-footer-meta">
              <span>© <span id="rr-year">2026</span> ReachRipple. All rights reserved.</span>
              <span>UK-focused premium classifieds. 18+ where applicable.</span>
            </div>
          </div>
        </footer>
      </div>`;

function pageContent({ heading, lede, sections, breadcrumb }) {
  const crumb = breadcrumb
    ? `<nav aria-label="Breadcrumb" style="font-size:0.85rem;color:#52525b;margin-bottom:0.75rem"><a href="/">Home</a> &rsaquo; <span>${escapeHtml(breadcrumb)}</span></nav>`
    : '';
  const body = (sections || []).map((s) => {
    const items = s.items
      ? `<ul style="margin:0.5rem 0 0;padding-left:1.1rem;color:#3f3f46">${s.items.map((i) => `<li>${i}</li>`).join('')}</ul>`
      : '';
    return `<section class="rr-section"><div class="rr-container"><h2>${escapeHtml(s.title)}</h2>${s.body ? `<p class="rr-lede">${s.body}</p>` : ''}${items}</div></section>`;
  }).join('\n          ');
  return `<template data-rr-prerender="start"></template>
      ${SHELL_OPEN}
          <section class="rr-hero" aria-labelledby="rr-page-h1">
            <div class="rr-container">
              ${crumb}
              <h1 id="rr-page-h1">${escapeHtml(heading)}</h1>
              ${lede ? `<p class="rr-sub">${lede}</p>` : ''}
            </div>
          </section>
          ${body}
      ${SHELL_CLOSE}
      <template data-rr-prerender="end"></template>`;
}

const ORG_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ReachRipple',
  url: `${SITE}/`,
  logo: `${SITE}/logomark-512.png`,
};

function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

const PAGES = [
  {
    slug: 'about',
    title: 'About ReachRipple | Verified Premium Classifieds',
    description: 'ReachRipple is a UK-focused premium classifieds marketplace. Learn how we verify listings, protect privacy, and keep contact safe.',
    breadcrumb: 'About',
    heading: 'About ReachRipple',
    lede: 'A premium classifieds marketplace built around verified listings, transparent moderation, and privacy-first contact.',
    jsonLd: [ORG_LD, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])],
    sections: [
      { title: 'What we do', body: 'ReachRipple connects people across the UK with trusted local services and listings. We focus on signal over noise: verified providers, clear categories, and direct, privacy-first contact.' },
      { title: 'Our principles', items: ['Verification before promotion', 'Moderation before publication', 'Privacy by default', 'Transparent reporting and takedown'] },
      { title: 'Where we operate', body: 'UK-focused, mobile-first. Listings cover services, jobs, property, vehicles, buy &amp; sell, and an age-gated 18+ adult directory where applicable.' },
    ],
  },
  {
    slug: 'safety',
    title: 'Safety &amp; Verification | ReachRipple',
    description: 'How ReachRipple verifies providers, moderates listings, and helps you stay safe. Includes scam awareness, reporting, and prohibited content rules.',
    breadcrumb: 'Safety',
    heading: 'Safety &amp; verification',
    lede: 'Practical guidance for using ReachRipple safely, plus how to report concerns and how our moderation team responds.',
    jsonLd: [ORG_LD, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Safety', path: '/safety' }])],
    sections: [
      { title: 'Scam awareness', items: ['Never pay upfront for unverified services or "deposits" via gift cards or crypto.', 'Be wary of pressure tactics or off-platform contact requests.', 'Trust your instincts and end any conversation that feels wrong.'] },
      { title: 'How to report a suspicious listing', body: 'Use the report button on any listing or message. Reports are reviewed by our moderation team and acted on promptly.' },
      { title: 'Provider verification', body: 'Providers can complete identity verification to earn a verified badge. Verification is optional, clearly labelled, and can be revoked.' },
      { title: 'Privacy guidance', items: ['Use platform messaging before sharing personal contact details.', 'Avoid sharing IDs, financial info, or home addresses with unverified users.', 'Report harassment immediately.'] },
      { title: 'Prohibited content', items: ['No content involving minors, trafficking, or coercion.', 'No misleading, fraudulent, or illegal listings.', 'No hate speech, harassment, or doxxing.'] },
      { title: 'Moderation &amp; takedown', body: 'Listings are reviewed against our content rules before going live, and we accept reports continuously after publication. Confirmed violations are removed; serious cases are escalated to law enforcement where appropriate.' },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy | ReachRipple',
    description: 'How ReachRipple collects, uses, and protects your data. Your rights, our retention policy, and contact details for privacy queries.',
    breadcrumb: 'Privacy',
    heading: 'Privacy policy',
    lede: 'A summary of how we handle personal data on ReachRipple. Open the page in your browser for the complete, legally binding policy.',
    jsonLd: [ORG_LD, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Privacy', path: '/privacy' }])],
    sections: [
      { title: 'What we collect', items: ['Account information you provide (email, password hash, profile data).', 'Listing content you publish.', 'Technical data such as IP address, device, and basic analytics.'] },
      { title: 'How we use it', items: ['To operate and secure the platform.', 'To moderate content and prevent abuse.', 'To communicate about your account.'] },
      { title: 'Your rights', body: 'You have rights to access, correct, export, or delete personal data we hold about you. See the full policy in-app for the formal process and contact details.' },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of Service | ReachRipple',
    description: 'The terms governing use of ReachRipple, including acceptable use, listing rules, account termination, and dispute resolution.',
    breadcrumb: 'Terms',
    heading: 'Terms of service',
    lede: 'A summary of the rules that apply when you use ReachRipple. The full terms are loaded in the app — please read them before posting or contacting providers.',
    jsonLd: [ORG_LD, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Terms', path: '/terms' }])],
    sections: [
      { title: 'Acceptable use', items: ['Post only legal content you have the right to share.', 'Do not impersonate others or misrepresent services.', 'Respect age-gating and category rules.'] },
      { title: 'Account termination', body: 'We may suspend or remove accounts that breach our rules, with appeal available where appropriate.' },
      { title: 'Liability', body: 'ReachRipple is a classifieds platform. We do not guarantee the quality, legality, or safety of any listing. Always exercise due diligence.' },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact ReachRipple | Support &amp; Reports',
    description: 'Contact ReachRipple support, report abuse, or submit a law enforcement request. We reply to verified queries promptly.',
    breadcrumb: 'Contact',
    heading: 'Contact ReachRipple',
    lede: 'For account help, abuse reports, or press and partnership queries, the form on this page (loaded with the app) is the fastest route.',
    jsonLd: [ORG_LD, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])],
    sections: [
      { title: 'Support', body: 'Use the contact form in the app for fastest response. Most account queries are answered within a few business days.' },
      { title: 'Report abuse', body: 'Use the report button on any listing or message, or contact us via this page if a report cannot be filed in-app. Urgent threats should be reported to local authorities first.' },
      { title: 'Law enforcement', body: 'See the <a href="/law-enforcement">Law Enforcement Guide</a> for the formal request process.' },
    ],
  },
  {
    slug: 'categories',
    title: 'Browse Categories | ReachRipple Classifieds',
    description: 'Browse ReachRipple categories: services, jobs, property, vehicles, buy &amp; sell, and the age-gated adult directory.',
    breadcrumb: 'Categories',
    heading: 'Browse categories',
    lede: 'Pick a category to start exploring listings on ReachRipple.',
    jsonLd: [ORG_LD, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Categories', path: '/categories' }])],
    sections: [
      { title: 'Top categories', body: '<a href="/category/services">Services</a> · <a href="/category/buy-sell">Buy &amp; Sell</a> · <a href="/category/jobs">Jobs</a> · <a href="/category/property">Property</a> · <a href="/category/vehicles">Vehicles</a> · <a href="/escorts">Adult (18+)</a>' },
      { title: 'How browsing works', body: 'Use the category page to filter by location and subcategory. The app loads richer search and filtering once JavaScript is enabled.' },
    ],
  },
];

let written = 0;
for (const page of PAGES) {
  const out = baseHtml
    .replace(SEO_RE, seoBlock({
      title: page.title,
      description: page.description,
      path: `/${page.slug}`,
      jsonLd: page.jsonLd,
    }))
    .replace(CONTENT_RE, pageContent(page));
  const dir = path.join(BUILD, page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), out, 'utf8');
  written += 1;
  console.log(`[prerender] wrote build/${page.slug}/index.html`);
}

console.log(`[prerender] done — ${written} prerendered route(s) written.`);
