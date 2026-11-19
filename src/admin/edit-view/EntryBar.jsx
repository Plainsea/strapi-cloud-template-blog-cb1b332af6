// Left side of the toolbar above the edit form (see EDIT_VIEW_CSS in ../app.js):
// status, the entry's name, its content type and when it was last saved. It is
// injected next to Save and Publish, and the CSS keeps the whole bar on screen
// while the form scrolls.
import { Component, useEffect, useRef } from 'react';
import { Flex, Typography } from '@strapi/design-system';
import { unstable_useContentManagerContext as useContentManagerContext, unstable_useDocument as useDocument } from '@strapi/content-manager/strapi-admin';
import { useTheme } from 'styled-components';

const STATUS = {
  new: ['New', 'neutral'],
  draft: ['Draft', 'secondary'],
  published: ['Published', 'success'],
  modified: ['Modified', 'warning'],
};

const STATUS_HINT = {
  new: 'Not saved yet',
  draft: 'Saved, not published',
  published: 'Live on the site',
  modified: 'Published, with changes that are not live yet',
};

function ago(date) {
  const minutes = Math.floor((Date.now() - new Date(date)) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Pill({ tone, children, title }) {
  const { colors } = useTheme();
  return (
    <span
      title={title}
      style={{
        background: colors[`${tone}100`],
        color: colors[`${tone}700`],
        border: `1px solid ${colors[`${tone}200`]}`,
        fontSize: 12,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 4,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

/**
 * Strapi wraps pages in a box with overflow-x: hidden, which stops
 * position: sticky from working inside it. overflow-x: clip looks the same
 * (nothing spills sideways) but keeps sticky working, so the toolbar's
 * wrappers are switched to it while the edit view is open.
 */
function useStickyFriendlyAncestors(ref) {
  useEffect(() => {
    const changed = [];
    for (let el = ref.current?.parentElement; el && el !== document.body; el = el.parentElement) {
      if (getComputedStyle(el).overflowX === 'hidden') {
        changed.push([el, el.style.overflowX]);
        el.style.overflowX = 'clip';
      }
    }
    return () => changed.forEach(([el, value]) => (el.style.overflowX = value));
  }, [ref]);
}

/**
 * Marks the toolbar row with data-plainsea-stuck once it reaches the top of
 * the window, so the CSS can turn the card into a full-width bar like the one
 * on list pages. The row's height at rest is kept in --plainsea-rest-height,
 * so the shorter bar leaves the same space and the form does not jump.
 */
function useStuckFlag(ref) {
  useEffect(() => {
    const row = ref.current?.closest('aside')?.parentElement?.parentElement;
    if (!row) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const stuck = row.getBoundingClientRect().top <= 0.5;
      if (stuck === row.hasAttribute('data-plainsea-stuck')) return;
      if (stuck) row.style.setProperty('--plainsea-rest-height', `${row.offsetHeight}px`);
      row.toggleAttribute('data-plainsea-stuck', stuck);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
      row.removeAttribute('data-plainsea-stuck');
    };
  }, [ref]);
}

function EntryInfo() {
  const ref = useRef(null);
  useStickyFriendlyAncestors(ref);
  useStuckFlag(ref);
  const { model, collectionType, id, isCreatingEntry, contentType, form, layout } = useContentManagerContext();
  const { document } = useDocument(
    { model, collectionType, documentId: isCreatingEntry ? undefined : id },
    { skip: isCreatingEntry || !id }
  );

  const mainField = layout?.edit?.settings?.mainField ?? 'title';
  const name = String(form?.values?.[mainField] ?? '').trim() || (isCreatingEntry ? 'New entry' : 'Untitled');
  const status = isCreatingEntry ? 'new' : document?.status ?? 'draft';
  const [label, tone] = STATUS[status] ?? STATUS.draft;
  const typeName = contentType?.info?.displayName;

  return (
    <Flex ref={ref} data-plainsea-entry-bar="" gap={3} minWidth={0}>
      <Pill tone={tone} title={STATUS_HINT[status]}>
        {label}
      </Pill>
      <Typography variant="delta" tag="p" ellipsis title={name}>
        {name}
      </Typography>
      {typeName && (
        <Typography variant="pi" textColor="neutral500" style={{ whiteSpace: 'nowrap' }}>
          {typeName}
        </Typography>
      )}
      {document?.updatedAt && (
        <Typography variant="pi" textColor="neutral500" style={{ whiteSpace: 'nowrap' }}>
          · Saved {ago(document.updatedAt)}
        </Typography>
      )}
      {form?.modified && (
        <Typography variant="pi" textColor="warning600" fontWeight="bold" style={{ whiteSpace: 'nowrap' }}>
          · Unsaved changes
        </Typography>
      )}
    </Flex>
  );
}

/**
 * If the info ever fails (for example after a Strapi update changes these
 * hooks), it is left out instead of taking Save and Publish down with it.
 */
class Guard extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('[plainsea] Entry toolbar info could not be shown', error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function EntryBar() {
  return (
    <Guard>
      <EntryInfo />
    </Guard>
  );
}
