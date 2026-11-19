import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFetchClient } from '@strapi/strapi/admin';
import { Box, Button, Flex, Grid, LinkButton, Loader, TextInput, Typography } from '@strapi/design-system';
import { ExternalLink, Plus, Search } from '@strapi/icons';
import { useTheme } from 'styled-components';

let request = null;

function useDashboard() {
  const { get } = useFetchClient();
  const [state, setState] = useState({ data: null, error: false });

  useEffect(() => {
    let alive = true;
    if (!request) {
      request = get('/plainsea/home-dashboard').then((res) => res.data);

      request.finally(() => setTimeout(() => (request = null), 10000));
    }
    request
      .then((data) => alive && setState({ data, error: false }))
      .catch(() => alive && setState({ data: null, error: true }));
    return () => {
      alive = false;
    };
  }, [get]);

  return state;
}

function Loading({ state, children }) {
  if (state.error) {
    return (
      <Typography textColor="danger600" variant="pi">
        Could not load the dashboard data.
      </Typography>
    );
  }
  if (!state.data) {
    return (
      <Flex justifyContent="center" padding={6}>
        <Loader small>Loading</Loader>
      </Flex>
    );
  }
  return children(state.data);
}


const TONES = { Blog: 'success', News: 'warning', Glossary: 'primary', 'Use case': 'secondary' };

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const ago = (date) => {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${plural(Math.floor(days / 7), 'week')} ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const listUrl = (uid) => `/content-manager/collection-types/${uid}`;
const createUrl = (uid) => `${listUrl(uid)}/create`;

const UIDS = {
  article: 'api::article.article',
  glossary: 'api::glossary-term.glossary-term',
  useCase: 'api::use-case.use-case',
  testimonial: 'api::testimonial.testimonial',
};


function SectionTag({ section }) {
  const { colors } = useTheme();
  const tone = TONES[section] ?? 'neutral';
  return (
    <span
      style={{
        background: colors[`${tone}100`],
        color: colors[`${tone}700`],
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 4,
        whiteSpace: 'nowrap',
      }}
    >
      {section}
    </span>
  );
}


function SiteLink({ href }) {
  const { colors } = useTheme();
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Open on plainsea.com"
      aria-label="Open on plainsea.com"
      onClick={(e) => e.stopPropagation()}
      style={{ display: 'inline-flex', color: colors.neutral500, flexShrink: 0 }}
    >
      <ExternalLink width="1.2rem" height="1.2rem" />
    </a>
  );
}


function EntryRow({ item, note, noteColor, showTag = true, last }) {
  return (
    <Flex
      gap={2}
      paddingTop={2}
      paddingBottom={2}
      borderColor="neutral150"
      style={{ borderWidth: 0, borderBottomWidth: last ? 0 : 1, borderStyle: 'solid' }}
    >
      {showTag && <SectionTag section={item.section} />}
      <RouterLink to={item.url} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
        <Typography textColor="neutral800" ellipsis>
          {item.title}
        </Typography>
      </RouterLink>
      <SiteLink href={item.siteUrl} />
      {note && (
        <Typography variant="pi" textColor={noteColor ?? 'neutral500'} style={{ whiteSpace: 'nowrap' }}>
          {note}
        </Typography>
      )}
    </Flex>
  );
}

function Empty({ children }) {
  return <Typography textColor="neutral500">{children}</Typography>;
}



function SearchAll({ index }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const q = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      q
        ? index
            .filter((item) => item.title.toLowerCase().includes(q) || item.abbreviation?.toLowerCase().includes(q))
            .map((item) => (item.abbreviation ? { ...item, title: `${item.title} (${item.abbreviation})` } : item))
            .slice(0, 8)
        : [],
    [index, q]
  );

  return (
    <Box position="relative">
      <TextInput
        aria-label="Search all content"
        placeholder="Search by title or abbreviation"
        startAction={<Search fill="neutral500" />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setQuery('');
          if (e.key === 'Enter' && results[0]) navigate(results[0].url);
        }}
      />
      {q && (
        <Box
          position="absolute"
          left={0}
          right={0}
          zIndex={2}
          marginTop={1}
          background="neutral0"
          borderColor="neutral150"
          shadow="popupShadow"
          hasRadius
          paddingLeft={4}
          paddingRight={4}
          paddingTop={1}
          paddingBottom={1}
        >
          {results.length ? (
            results.map((item, i) => (
              <EntryRow
                key={item.url}
                item={item}
                note={item.status === 'draft' ? 'Draft' : null}
                noteColor="warning600"
                last={i === results.length - 1}
              />
            ))
          ) : (
            <Box paddingTop={2} paddingBottom={2}>
              <Empty>Nothing matches "{query.trim()}".</Empty>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}


function KpiCard({ label, value, lines, to }) {
  return (
    <Box background="neutral0" borderColor="neutral150" shadow="tableShadow" hasRadius padding={5} height="100%">
      <RouterLink to={to} style={{ textDecoration: 'none' }}>
        <Typography variant="sigma" textColor="neutral500" tag="p">
          {label}
        </Typography>
      </RouterLink>
      <Box paddingTop={2} paddingBottom={2}>
        <Typography variant="alpha" tag="p">
          {value}
        </Typography>
      </Box>
      {lines.map(([text, color], i) => (
        <Typography key={i} variant="omega" textColor={color ?? 'neutral600'} tag="p" ellipsis>
          {text}
        </Typography>
      ))}
    </Box>
  );
}


const articlesIn = (category) =>
  `${listUrl(UIDS.article)}?${new URLSearchParams({
    page: '1',
    'filters[$and][0][category][slug][$eq]': category,
  })}`;


function ArticleSections({ bySection }) {
  return ['Blog', 'News'].map((section, i) => (
    <span key={section}>
      {i > 0 && ' · '}
      <RouterLink to={articlesIn(section.toLowerCase())} style={{ color: 'inherit' }} title={`Show ${section} articles`}>
        {section} {bySection[section] ?? 0}
      </RouterLink>
    </span>
  ));
}


function addedThisMonthUrl(uid) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [field, value] =
    uid === UIDS.article ? ['dateAdded', start.toISOString().slice(0, 10)] : ['createdAt', start.toISOString()];
  return `${listUrl(uid)}?${new URLSearchParams({ page: '1', [`filters[$and][0][${field}][$gte]`]: value })}`;
}

const draftsUrl = (uid, ids) =>
  `${listUrl(uid)}?${new URLSearchParams([
    ['page', '1'],
    ...ids.map((id, i) => [`filters[$and][0][documentId][$in][${i}]`, id]),
  ])}`;

const draftsLine = ({ drafts, draftIds }, uid) =>
  drafts > 0
    ? [
        <RouterLink to={draftsUrl(uid, draftIds)} style={{ color: 'inherit' }} title="Show these drafts">
          {plural(drafts, 'draft')}
        </RouterLink>,
      ]
    : [plural(drafts, 'draft')];

const added = (n, uid) =>
  n > 0
    ? [
        <RouterLink to={addedThisMonthUrl(uid)} style={{ color: 'inherit' }} title="Show what was added this month">
          +{n} this month
        </RouterLink>,
        'success600',
      ]
    : ['None added this month'];

export function ContentOverview() {
  const state = useDashboard();
  return (
    <Box data-plainsea-kpi-row="">
      <Loading state={state}>
        {({ counts, index, showUseCases }) => {
          const { article, glossary, useCase, testimonial } = counts;
          const all = Object.values(counts);
          const drafts = all.reduce((sum, c) => sum + c.drafts, 0);
          const oldest = Math.max(0, ...all.map((c) => c.oldestDraftDays));
          const cards = [
            {
              label: 'Articles',
              to: listUrl(UIDS.article),
              value: article.published,
              lines: [
                [<ArticleSections bySection={article.bySection} />],
                added(article.addedThisMonth, UIDS.article),
              ],
            },
            {
              label: 'Glossary terms',
              to: listUrl(UIDS.glossary),
              value: glossary.published,
              lines: [[plural(glossary.pillars, 'key topic')], added(glossary.addedThisMonth, UIDS.glossary)],
            },
            showUseCases && {
              label: 'Use cases',
              to: listUrl(UIDS.useCase),
              value: useCase.published,
              lines: [
                draftsLine(useCase, UIDS.useCase),
                useCase.published === 0 ? ['Solutions menu hidden', 'warning600'] : added(useCase.addedThisMonth, UIDS.useCase),
              ],
            },
            {
              label: 'Testimonials',
              to: listUrl(UIDS.testimonial),
              value: testimonial.published,
              lines: [draftsLine(testimonial, UIDS.testimonial), added(testimonial.addedThisMonth, UIDS.testimonial)],
            },
            {
              label: 'Drafts',
              to: listUrl(UIDS.article),
              value: drafts,
              lines: [['All types'], [drafts ? `Oldest ${plural(oldest, 'day')}` : 'Nothing waiting']],
            },
          ].filter(Boolean);
          return (
            <Flex direction="column" alignItems="stretch" gap={5}>
              <SearchAll index={index} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(17rem, 1fr))', gap: '2rem' }}>
                {cards.map((card) => (
                  <KpiCard key={card.label} {...card} />
                ))}
              </div>
            </Flex>
          );
        }}
      </Loading>
    </Box>
  );
}

export function RecentlyPublished() {
  const state = useDashboard();
  return (
    <Loading state={state}>
      {({ recent }) =>
        recent.length ? (
          <Flex direction="column" alignItems="stretch">
            {recent.map((item, i) => (
              <EntryRow key={item.url} item={item} note={ago(item.publishedAt)} last={i === recent.length - 1} />
            ))}
          </Flex>
        ) : (
          <Empty>Nothing published yet.</Empty>
        )
      }
    </Loading>
  );
}

export function WaitingToPublish() {
  const state = useDashboard();
  return (
    <Loading state={state}>
      {({ waiting }) =>
        waiting.length ? (
          <Flex direction="column" alignItems="stretch">
            {waiting.map((item, i) => (
              <EntryRow
                key={`${item.url}-${item.state}`}
                item={item}
                note={`${item.state} · ${ago(item.updatedAt)}`}
                noteColor={item.state === 'Draft' ? 'neutral500' : 'warning600'}
                last={i === waiting.length - 1}
              />
            ))}
          </Flex>
        ) : (
          <Empty>Everything is published. No drafts or unpublished changes.</Empty>
        )
      }
    </Loading>
  );
}

const CHECKS = [
  ['seoMissing', () => 'Missing SEO title or description'],
  ['seoDescriptionTooLong', (l) => `SEO description over ${l.seoDescriptionMax} characters`],
  ['seoTitleTooLong', (l) => `SEO title over ${l.seoTitleMax} characters`],
  ['longDash', () => 'Long dash in the text'],
  ['articleWithoutCover', () => 'Article without a cover image'],
  ['staleDraft', (l) => `Draft older than ${l.staleDraftDays} days`],
  ['bannedWords', () => 'Words we do not use (compliant, retest...)', true],
  ['termWithoutRelated', () => 'Glossary term without related terms', true],
  ['termWithoutFaq', () => 'Glossary term without FAQ', true],
  ['termWithoutCover', () => 'Glossary term without a cover image', true],
  ['termWithoutTopic', () => 'Glossary term not linked to a key topic', true],
];

const ADVANCED_KEY = 'plainsea.dashboard.showAdvanced';

function useStoredFlag(key) {
  const [value, setValue] = useState(() => {
    try {
      return window.localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  });
  const update = (next) => {
    setValue(next);
    try {
      window.localStorage.setItem(key, next ? '1' : '0');
    } catch {
      // Not remembered; the toggle still works for this visit.
    }
  };
  return [value, update];
}

function useWidgetHeader(ref) {
  const [header, setHeader] = useState(null);
  useEffect(() => {
    setHeader(ref.current?.closest('section')?.querySelector(':scope > header') ?? null);
  }, [ref]);
  return header;
}

function CheckRow({ label, items, open, onToggle }) {
  return (
    <Box>
      <Flex
        tag="button"
        type="button"
        onClick={onToggle}
        justifyContent="space-between"
        width="100%"
        paddingTop={2}
        paddingBottom={2}
        style={{ background: 'none', border: 0, cursor: 'pointer' }}
        aria-expanded={open}
      >
        <Typography textColor="neutral800">{label}</Typography>
        <Typography fontWeight="bold" textColor="warning600">
          {items.length}
        </Typography>
      </Flex>
      {open && (
        <Box paddingLeft={3} paddingBottom={2}>
          {items.map((item, i) => (
            <EntryRow key={item.url} item={item} note={item.detail} last={i === items.length - 1} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export function NeedsAttention() {
  const state = useDashboard();
  const [open, setOpen] = useState(null);
  const [showAdvanced, setShowAdvanced] = useStoredFlag(ADVANCED_KEY);
  const ref = useRef(null);
  const header = useWidgetHeader(ref);
  const checks = state.data?.checks;
  const hiddenIssues = checks
    ? CHECKS.filter(([, , advanced]) => advanced).reduce((sum, [key]) => sum + checks[key].length, 0)
    : 0;

  return (
    <Box ref={ref}>
      {header &&
        createPortal(
          <Button variant="ghost" size="S" onClick={() => setShowAdvanced(!showAdvanced)} aria-pressed={showAdvanced}>
            {showAdvanced ? 'Hide advanced' : hiddenIssues ? `Show advanced (${hiddenIssues})` : 'Show advanced'}
          </Button>,
          header
        )}
      <Loading state={state}>
        {({ checks, limits }) => {
          const shown = CHECKS.filter(([, , advanced]) => showAdvanced || !advanced);
          const failing = shown.filter(([key]) => checks[key].length);
          const passing = shown.filter(([key]) => !checks[key].length);
          const toggle = (key) => setOpen(open === key ? null : key);
          return (
            <Flex direction="column" alignItems="stretch">
              {failing.map(([key, label]) => (
                <CheckRow key={key} label={label(limits)} items={checks[key]} open={open === key} onToggle={() => toggle(key)} />
              ))}
              {passing.length > 0 && (
                <Box>
                  <Flex
                    tag="button"
                    type="button"
                    onClick={() => toggle('passing')}
                    justifyContent="space-between"
                    width="100%"
                    paddingTop={2}
                    paddingBottom={2}
                    style={{ background: 'none', border: 0, cursor: 'pointer' }}
                    aria-expanded={open === 'passing'}
                  >
                    <Typography textColor="neutral500">{plural(passing.length, 'check')} with nothing to fix</Typography>
                    <Typography fontWeight="bold" textColor="success600">
                      OK
                    </Typography>
                  </Flex>
                  {open === 'passing' &&
                    passing.map(([key, label]) => (
                      <Box key={key} paddingLeft={3} paddingBottom={1}>
                        <Typography variant="pi" textColor="neutral500">
                          {label(limits)}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              )}
            </Flex>
          );
        }}
      </Loading>
    </Box>
  );
}

const CREATE = [
  ['Article', UIDS.article],
  ['Glossary term', UIDS.glossary],
  ['Use case', UIDS.useCase],
  ['Testimonial', UIDS.testimonial],
];

const LISTS = [
  ['Articles', listUrl(UIDS.article)],
  ['Glossary', listUrl(UIDS.glossary)],
  ['Use cases', listUrl(UIDS.useCase)],
  ['Testimonials', listUrl(UIDS.testimonial)],
  ['Media Library', '/plugins/upload'],
];

const SITE_PAGES = [
  ['Home', '/'],
  ['Blog', '/blog'],
  ['News', '/news'],
  ['Glossary', '/glossary'],
  ['Sitemap', '/sitemap.xml'],
  ['llms.txt', '/llms.txt'],
];

function Heading({ children }) {
  return (
    <Box paddingBottom={2}>
      <Typography variant="sigma" textColor="neutral500">
        {children}
      </Typography>
    </Box>
  );
}

export function QuickActions() {
  const state = useDashboard();
  const { colors } = useTheme();
  const siteUrl = state.data?.siteUrl ?? 'https://plainsea.com';
  const visible = (uid) => uid !== UIDS.useCase || state.data?.showUseCases;
  const create = CREATE.filter(([, uid]) => visible(uid));
  const lists = LISTS.filter(([, to]) => visible(to.replace('/content-manager/collection-types/', '')));
  return (
    <Grid.Root gap={6}>
      <Grid.Item col={6} xs={12} direction="column" alignItems="stretch">
        <Heading>Create</Heading>
        <Flex direction="column" alignItems="stretch" gap={2}>
          {create.map(([label, uid]) => (
            <LinkButton key={label} tag={RouterLink} to={createUrl(uid)} variant="tertiary" size="S" startIcon={<Plus />} fullWidth justifyContent="flex-start">
              {label}
            </LinkButton>
          ))}
        </Flex>
      </Grid.Item>
      <Grid.Item col={6} xs={12} direction="column" alignItems="stretch" gap={4}>
        <Box>
          <Heading>Open</Heading>
          <Flex gap={4} wrap="wrap">
            {lists.map(([label, to]) => (
              <RouterLink key={label} to={to} style={{ textDecoration: 'none' }}>
                <Typography textColor="primary600">{label}</Typography>
              </RouterLink>
            ))}
          </Flex>
        </Box>
        <Box>
          <Heading>On the site</Heading>
          <Flex gap={4} wrap="wrap">
            {SITE_PAGES.map(([label, path]) => (
              <a
                key={label}
                href={`${siteUrl}${path}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, color: colors.primary600 }}
              >
                <Typography textColor="primary600">{label}</Typography>
                <ExternalLink width="1rem" height="1rem" />
              </a>
            ))}
          </Flex>
        </Box>
      </Grid.Item>
    </Grid.Root>
  );
}
