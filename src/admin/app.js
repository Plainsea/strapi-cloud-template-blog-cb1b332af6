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
    });
  }).observe(document.body, { childList: true, subtree: true });
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

export default {
  config: {
    locales: [],
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
  bootstrap() {
    const style = document.createElement('style');
    style.setAttribute('data-plainsea', 'dropdown-height');
    style.textContent = DROPDOWN_CSS + KPI_ROW_CSS;
    document.head.appendChild(style);

    keepListSearchOpen();
  },
};
