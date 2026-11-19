import favicon from './extensions/favicon.ico';
import logo from './extensions/plainsea-mark.svg';
import { EntryBar } from './edit-view/EntryBar.jsx';
import { ChartPie, Clock, Lightning, Pencil, WarningCircle } from '@strapi/icons';

// Admin panel customisations.
//
// Dropdowns (relation pickers such as Related terms or Category, and select
// fields) are capped at 15rem by Strapi's design system. Relation pickers also
// keep a "Create a relation" row at the bottom, and each option carries a
// status badge, so only about two options were visible at a time. 24rem shows
// at least five. The popup still never grows past the space left on screen,
// and opens upwards when there is more room above the field.
const DROPDOWN_CSS = `
[data-radix-popper-content-wrapper] [role="listbox"] {
  max-height: min(24rem, var(--radix-popper-available-height, 24rem)) !important;
}
`;

const KPI_ROW_CSS = `
div:has(> section [data-plainsea-kpi-row]) {
  grid-column: 1 / -1 !important;
}
section:has([data-plainsea-kpi-row]) {
  background: none !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
}
section:has([data-plainsea-kpi-row]) > header {
  display: none !important;
}
/* Widgets that scroll keep room for the scrollbar, so it never covers the counts
   on the right. The admin does not declare a colour scheme, so browsers draw
   their light default scrollbar even on the dark theme; this thin one with a
   see-through track and a translucent grey thumb suits both themes. */
section:has(> header) > main {
  scrollbar-gutter: stable !important;
  padding-right: 0.8rem !important;
  scrollbar-width: thin;
  scrollbar-color: rgba(142, 142, 169, 0.35) transparent;
}
section:has(> header) > main:hover {
  scrollbar-color: rgba(142, 142, 169, 0.65) transparent;
}
section:has([data-plainsea-kpi-row]) > main {
  height: auto !important;
  overflow: visible !important;
  padding-right: 0 !important;
}
`;

// Edit view: Strapi puts Save and Publish in an "Entry" card in a side column
// that takes a quarter of the width. Instead the form gets the full width and
// the card becomes a toolbar above it that stays on screen while scrolling:
// status, name, type and last save on the left (./edit-view/EntryBar.jsx),
// Save, Publish and more (...) on the right. Strapi's own compact header,
// which appears on scroll with just the name, is hidden there since the
// toolbar replaces it. Anchored on the side panel Strapi marks with
// aside[aria-labelledby="additional-information"].
const SIDE = 'aside[aria-labelledby="additional-information"]';
// Height of the side menu header ("Content Manager", 56px) plus its 1px line.
const TOP_BAR_HEIGHT = '57px';
const EDIT_VIEW_CSS = `
div:has(> div > div > ${SIDE}) > div {
  grid-column: 1 / -1 !important;
}
/* At rest the toolbar is a card on a band of the page background. Once it
   reaches the top (data-plainsea-stuck, set by EntryBar.jsx) it becomes the
   same bar as on list pages: full width from the side menu to the right edge
   (56px is the page\'s side padding), flush with the top, as tall as the side
   menu header, with a line below. The bottom margin keeps the space the card
   took, so the form does not jump. Colours come from syncBarColors(). */
div:has(> div > ${SIDE}) {
  order: -1;
  position: sticky;
  top: 0;
  z-index: 3;
  margin-top: -1.2rem;
  padding: 1.2rem 0;
  background: var(--plainsea-page-bg, transparent);
}
div:has(> div > ${SIDE})[data-plainsea-stuck] {
  /* Grid items are capped at 100% wide, which would stop the bar 56px short of the right edge. */
  max-width: none !important;
  box-sizing: border-box;
  height: ${TOP_BAR_HEIGHT};
  margin: -1.2rem -56px calc(var(--plainsea-rest-height, ${TOP_BAR_HEIGHT}) - ${TOP_BAR_HEIGHT});
  padding: 0 24px;
  justify-content: center !important;
  /* Slightly see-through with the form blurred behind it (like the site\'s
     mobile menu), and a soft shadow, so it reads as a layer above the content. */
  background: var(--plainsea-bar-glass);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--plainsea-bar-border);
  box-shadow: var(--plainsea-bar-shadow);
  /* Shadow below only, so it does not spill onto the side menu on the left. */
  clip-path: inset(0 0 -32px 0);
}
div:has(> div > ${SIDE})[data-plainsea-stuck] ${SIDE} {
  padding: 0 !important;
  background: none !important;
  border: 0 !important;
  box-shadow: none !important;
}
div:has(> ${SIDE}) {
  flex-direction: row !important;
  flex-wrap: wrap;
}
${SIDE} {
  flex: 1 1 auto;
  flex-direction: row !important;
  align-items: center !important;
  padding: 1rem 1.6rem !important;
  box-shadow: var(--plainsea-bar-shadow) !important;
}
${SIDE} > h2 {
  display: none;
}
${SIDE} > div {
  flex-direction: row !important;
  align-items: center !important;
  gap: 1.6rem !important;
}
${SIDE} > div > div:first-child {
  flex-direction: row-reverse !important;
  align-items: center !important;
  width: auto !important;
  flex: 0 0 auto;
}
${SIDE} [data-plainsea-entry-bar] {
  order: -1;
  flex: 1 1 auto;
}
/* Buttons other plugins add here (such as Purge Entity Cache) keep their own
   size at the right end instead of stretching across the bar. */
${SIDE} > div > :not(:first-child):not([data-plainsea-entry-bar]),
${SIDE} > div > :not(:first-child):not([data-plainsea-entry-bar]) button {
  flex: 0 0 auto !important;
  width: auto !important;
}
body:has(${SIDE}) [data-strapi-header-sticky] {
  display: none !important;
}
/* Strapi\'s top bar on list pages, shown once scrolled: as tall as the
   "Content Manager" header in the side menu (56px plus its 1px line), with
   the same kind of line below instead of a shadow, so the two line up. */
[data-strapi-header-sticky] {
  box-sizing: border-box;
  height: ${TOP_BAR_HEIGHT};
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--plainsea-bar-border) !important;
  /* The same see-through, blurred look as the edit toolbar once it sticks. */
  background: var(--plainsea-bar-glass) !important;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: var(--plainsea-bar-shadow) !important;
  /* Shadow below only, so it does not spill onto the side menu on the left. */
  clip-path: inset(0 0 -32px 0);
}
[data-strapi-header-sticky] > * {
  width: 100%;
}
`;

// Colours the CSS above needs from the active theme. The admin keeps the
// choice (light, dark or system) in localStorage and does not expose it in
// the page, so it is read from there and re-checked as the page changes.
const BAR_COLORS = {
  light: {
    page: '#f6f6f9',
    bar: '#ffffff',
    glass: 'rgba(255, 255, 255, 0.82)',
    border: '#eaeaef',
    shadow: '0 4px 16px rgba(33, 33, 52, 0.12)',
  },
  dark: {
    page: '#0c1729',
    bar: '#13223a',
    glass: 'rgba(19, 34, 58, 0.82)',
    border: '#22324a',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
  },
};

function syncBarColors() {
  let choice = 'system';
  try {
    choice = window.localStorage.getItem('STRAPI_THEME') || 'system';
  } catch {
    // Storage blocked: follow the system setting.
  }
  const dark = choice === 'dark' || (choice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const colors = BAR_COLORS[dark ? 'dark' : 'light'];
  const root = document.documentElement.style;
  for (const [name, value] of Object.entries({
    '--plainsea-page-bg': colors.page,
    '--plainsea-bar-bg': colors.bar,
    '--plainsea-bar-glass': colors.glass,
    '--plainsea-bar-border': colors.border,
    '--plainsea-bar-shadow': colors.shadow,
  })) {
    if (root.getPropertyValue(name) !== value) root.setProperty(name, value);
  }
}

// Content Manager tables show search as a magnifier button that has to be
// clicked before the search field appears. On every table page we open it
// straight away, so the field is always there. Strapi focuses the field when it
// opens; that focus is dropped again so the page does not jump to the search
// box (or pop up the keyboard on a phone) without anyone asking for it.
const LIST_VIEW = /\/content-manager\/collection-types\/[^/]+\/?$/;

// Each magnifier button is clicked at most once, so nothing can loop if the
// admin ever changes what that button does.
const clicked = new WeakSet();

function openListSearch() {
  if (!LIST_VIEW.test(window.location.pathname)) return;

  const button = [...document.querySelectorAll('main button')].find(
    (b) => !b.disabled && !clicked.has(b) && b.querySelector('svg') && b.textContent.trim() === 'Search'
  );
  if (!button) return;

  clicked.add(button);
  button.click();
  window.setTimeout(() => {
    const active = document.activeElement;
    if (active instanceof HTMLInputElement && active.name === 'search' && !active.value) active.blur();
  });
}

function keepListSearchOpen() {
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    window.setTimeout(() => {
      queued = false;
      openListSearch();
      syncBarColors();
    });
  }).observe(document.body, { childList: true, subtree: true });
}

// "Content Manager" in the main menu goes to /content-manager, which Strapi
// redirects to the first content type in alphabetical order: About. That one
// redirect is sent to the article list instead. The click itself is left to
// Strapi, so the menu still shows as active on every content type and the
// "unsaved changes" warning still appears when leaving an edited entry.
const CONTENT_MANAGER_HOME = '/content-manager/collection-types/api::article.article';
const CONTENT_MANAGER_ROOT = /\/content-manager\/?$/;
const CONTENT_TYPE_PAGE = /\/content-manager\/(single|collection)-types\/[^/]+\/?$/;

function openArticlesFromContentManagerLink() {
  let lastPath = window.location.pathname;
  const replaceState = window.history.replaceState.bind(window.history);
  const pushState = window.history.pushState.bind(window.history);

  window.history.pushState = (state, title, url) => {
    lastPath = window.location.pathname;
    pushState(state, title, url);
  };

  window.history.replaceState = (state, title, url) => {
    const from = window.location.pathname;
    replaceState(state, title, url);
    const to = window.location.pathname;
    // Strapi just turned /content-manager into the first content type.
    if ((CONTENT_MANAGER_ROOT.test(from) || CONTENT_MANAGER_ROOT.test(lastPath)) && CONTENT_TYPE_PAGE.test(to) && !to.endsWith(CONTENT_MANAGER_HOME)) {
      lastPath = to;
      const home = to.replace(CONTENT_TYPE_PAGE, CONTENT_MANAGER_HOME);
      window.setTimeout(() => {
        replaceState(window.history.state, '', home);
        // The admin's router follows the address on popstate.
        window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
      });
    }
  };
}

const HOME_ORDER = [
  'global::content-overview',
  'global::recently-published',
  'global::needs-attention',
  'global::waiting-to-publish',
  'global::quick-actions',
];
const HIDDEN = ['plugin::content-manager.last-edited-entries', 'plugin::content-manager.last-published-entries'];

function arrangeHomeWidgets(app) {
  const store = app.widgets?.widgets;
  if (!store) return;
  const rest = Object.keys(store).filter(
    (uid) => !HOME_ORDER.includes(uid) && !HIDDEN.includes(uid)
  );
  const ordered = Object.fromEntries(
    [...HOME_ORDER, ...rest].filter((uid) => store[uid]).map((uid) => [uid, store[uid]])
  );
  for (const uid of Object.keys(store)) delete store[uid];
  Object.assign(store, ordered);
}

const TEAL_FOCUS = (rgb) =>
  ['inset 2px 0px 0px', 'inset 0px 2px 0px', 'inset -2px 0px 0px', 'inset 0px -2px 0px'].map((s) => `${s} rgb(${rgb})`).join(', ');

const BRAND = {
  light: {
    colors: {
      primary100: '#f0fdfa',
      primary200: '#ccfbf1',
      primary500: '#14b8a6',
      primary600: '#0f766e',
      primary700: '#115e59',
      buttonPrimary500: '#0d9488',
      buttonPrimary600: '#0f766e',
    },
    shadows: { focus: TEAL_FOCUS('15, 118, 110'), focusShadow: '0px 0px 6px rgba(20, 184, 166, 0.75)' },
  },
  dark: {
    colors: {
      // Surfaces: page, panels, borders (the site's navy, #0c1729).
      neutral100: '#0c1729',
      neutral0: '#13223a',
      neutral150: '#22324a',
      neutral200: '#34465f',
      neutral300: '#56677f',
      neutral400: '#94a3b8',
      neutral500: '#a8b4c6',
      neutral600: '#94a3b8',
      neutral700: '#e2e8f0',
      // Tinted backgrounds of badges and alerts, on navy.
      alternative100: '#0c1729',
      alternative200: '#34465f',
      danger100: '#0c1729',
      danger200: '#34465f',
      secondary100: '#0c1729',
      secondary200: '#34465f',
      success100: '#0c1729',
      success200: '#34465f',
      warning100: '#0c1729',
      warning200: '#34465f',
      // Teal.
      primary100: '#0f2f36',
      primary200: '#1d4f55',
      primary500: '#14b8a6',
      primary600: '#2dd4bf',
      primary700: '#5eead4',
      buttonPrimary500: '#0d9488',
      buttonPrimary600: '#0f766e',
    },
    shadows: { focus: TEAL_FOCUS('20, 184, 166'), focusShadow: '0px 0px 6px rgba(20, 184, 166, 0.75)' },
  },
};

export default {
  config: {
    locales: [],
    theme: BRAND,
    // The Plainsea mark (the lighthouse from the site) in place of Strapi's logo.
    auth: { logo },
    menu: { logo },
    head: { favicon },
    translations: {
      en: {
        'Auth.form.welcome.title': 'Welcome to Plainsea',
        'Auth.form.welcome.subtitle': 'Log in to manage the website content',
      },
    },
  },

  register(app) {
    const widgets = () => import('./dashboard/widgets.jsx');
    app.widgets.register([
      {
        id: 'content-overview',
        icon: ChartPie,
        title: { id: 'plainsea.widget.content-overview', defaultMessage: 'Content overview' },
        component: async () => (await widgets()).ContentOverview,
      },
      {
        id: 'needs-attention',
        icon: WarningCircle,
        title: { id: 'plainsea.widget.needs-attention', defaultMessage: 'Needs attention' },
        component: async () => (await widgets()).NeedsAttention,
      },
      {
        id: 'recently-published',
        icon: Clock,
        title: { id: 'plainsea.widget.recently-published', defaultMessage: 'Recently published' },
        component: async () => (await widgets()).RecentlyPublished,
      },
      {
        id: 'quick-actions',
        icon: Lightning,
        title: { id: 'plainsea.widget.quick-actions', defaultMessage: 'Quick actions' },
        component: async () => (await widgets()).QuickActions,
      },
      {
        id: 'waiting-to-publish',
        icon: Pencil,
        title: { id: 'plainsea.widget.waiting-to-publish', defaultMessage: 'Waiting to publish' },
        component: async () => (await widgets()).WaitingToPublish,
      },
    ]);

    arrangeHomeWidgets(app);
  },
  bootstrap(app) {
    app.getPlugin('content-manager').injectComponent('editView', 'right-links', {
      name: 'plainsea-entry-bar',
      Component: EntryBar,
    });

    const style = document.createElement('style');
    style.setAttribute('data-plainsea', 'dropdown-height');
    style.textContent = DROPDOWN_CSS + KPI_ROW_CSS + EDIT_VIEW_CSS;
    document.head.appendChild(style);

    syncBarColors();
    keepListSearchOpen();
    openArticlesFromContentManagerLink();
  },
};
