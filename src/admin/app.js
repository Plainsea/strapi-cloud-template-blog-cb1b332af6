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

export default {
  config: {
    locales: [],
  },
  bootstrap() {
    const style = document.createElement('style');
    style.setAttribute('data-plainsea', 'dropdown-height');
    style.textContent = DROPDOWN_CSS;
    document.head.appendChild(style);

    keepListSearchOpen();
  },
};
