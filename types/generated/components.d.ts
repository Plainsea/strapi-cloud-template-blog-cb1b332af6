import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCards extends Struct.ComponentSchema {
  collectionName: 'components_blocks_cards';
  info: {
    description: 'A grid of icon cards';
    displayName: 'Cards';
    icon: 'dashboard';
  };
  attributes: {
    cards: Schema.Attribute.Component<'elements.card', true>;
    columns: Schema.Attribute.Enumeration<['auto', 'two', 'three']> &
      Schema.Attribute.DefaultTo<'auto'>;
    eyebrow: Schema.Attribute.String;
    iconPosition: Schema.Attribute.Enumeration<
      ['beside-title', 'above-title']
    > &
      Schema.Attribute.DefaultTo<'beside-title'>;
    intro: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface BlocksChecklist extends Struct.ComponentSchema {
  collectionName: 'components_blocks_checklist';
  info: {
    description: 'A list of points with check marks';
    displayName: 'Checklist';
    icon: 'check';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    eyebrow: Schema.Attribute.String;
    items: Schema.Attribute.Component<'elements.checklist-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_cta';
  info: {
    description: 'A closing call to action with one button';
    displayName: 'Call to action';
    icon: 'cursor';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    buttonLink: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksFeaturePanel extends Struct.ComponentSchema {
  collectionName: 'components_blocks_feature_panel';
  info: {
    description: 'One panel: heading, text, a checklist and a button on the left, short facts on the right';
    displayName: 'Feature panel';
    icon: 'star';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    buttonLink: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    facts: Schema.Attribute.Component<'elements.fact', true>;
    items: Schema.Attribute.Component<'elements.checklist-item', true>;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_hero';
  info: {
    description: 'Page header with title, text, image and buttons (for pages without their own header)';
    displayName: 'Hero';
    icon: 'layout';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    primaryButtonLabel: Schema.Attribute.String;
    primaryButtonLink: Schema.Attribute.String;
    secondaryButtonLabel: Schema.Attribute.String;
    secondaryButtonLink: Schema.Attribute.String;
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksImageText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_image_text';
  info: {
    description: 'An image next to Markdown text';
    displayName: 'Image and text';
    icon: 'picture';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    framed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    imagePosition: Schema.Attribute.Enumeration<['right', 'left']> &
      Schema.Attribute.DefaultTo<'right'>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksMetrics extends Struct.ComponentSchema {
  collectionName: 'components_blocks_metrics';
  info: {
    description: 'A strip of headline numbers';
    displayName: 'Metrics';
    icon: 'chartCircle';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    eyebrow: Schema.Attribute.String;
    items: Schema.Attribute.Component<'elements.metric', true>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rich_text';
  info: {
    description: 'A heading with Markdown text, and an optional wide image under them';
    displayName: 'Rich text';
    icon: 'feather';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    framed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    image: Schema.Attribute.Media<'images'>;
    layout: Schema.Attribute.Enumeration<
      ['heading-left', 'heading-right', 'centered']
    > &
      Schema.Attribute.DefaultTo<'heading-left'>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksTabs extends Struct.ComponentSchema {
  collectionName: 'components_blocks_tabs';
  info: {
    description: "A list of tabs on the left; the selected tab's text shows on the right";
    displayName: 'Tabs';
    icon: 'layer';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    intro: Schema.Attribute.Text;
    tabs: Schema.Attribute.Component<'elements.tab', true>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksTestimonial extends Struct.ComponentSchema {
  collectionName: 'components_blocks_testimonial';
  info: {
    description: 'One testimonial from the Testimonials collection';
    displayName: 'Testimonial';
    icon: 'quote';
  };
  attributes: {
    testimonial: Schema.Attribute.Relation<
      'oneToOne',
      'api::testimonial.testimonial'
    >;
  };
}

export interface BlocksTextList extends Struct.ComponentSchema {
  collectionName: 'components_blocks_text_list';
  info: {
    description: 'A heading and Markdown text on the left, a column of linked items on the right';
    displayName: 'Text and list';
    icon: 'bulletList';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    items: Schema.Attribute.Component<'elements.list-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_card';
  info: {
    description: 'A card with an icon, title and text';
    displayName: 'Card';
    icon: 'dashboard';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Text &
      Schema.Attribute.CustomField<
        'plugin::icons-field.icon',
        {
          outputFormat: 'name';
          selection: 'phosphor';
          showIconLabel: true;
        }
      >;
    image: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsChecklistItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_checklist_item';
  info: {
    description: 'One line with a check mark';
    displayName: 'Checklist item';
    icon: 'check';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsFact extends Struct.ComponentSchema {
  collectionName: 'components_elements_fact';
  info: {
    description: 'A short labelled fact, e.g. Compliance: SOC 2 Type II';
    displayName: 'Fact';
    icon: 'information';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsListItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_list_item';
  info: {
    description: 'An item with an icon, title, text and link';
    displayName: 'List item';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Text &
      Schema.Attribute.CustomField<
        'plugin::icons-field.icon',
        {
          outputFormat: 'name';
          selection: 'phosphor';
          showIconLabel: true;
        }
      >;
    link: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsMetric extends Struct.ComponentSchema {
  collectionName: 'components_elements_metric';
  info: {
    description: 'A headline number, e.g. 80% / less exploitable risk';
    displayName: 'Metric';
    icon: 'chartCircle';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsTab extends Struct.ComponentSchema {
  collectionName: 'components_elements_tab';
  info: {
    description: 'One tab: its label and icon, and the text shown when it is selected';
    displayName: 'Tab';
    icon: 'layer';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    highlight: Schema.Attribute.String;
    icon: Schema.Attribute.Text &
      Schema.Attribute.CustomField<
        'plugin::icons-field.icon',
        {
          outputFormat: 'name';
          selection: 'phosphor';
          showIconLabel: true;
        }
      >;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.cards': BlocksCards;
      'blocks.checklist': BlocksChecklist;
      'blocks.cta': BlocksCta;
      'blocks.feature-panel': BlocksFeaturePanel;
      'blocks.hero': BlocksHero;
      'blocks.image-text': BlocksImageText;
      'blocks.metrics': BlocksMetrics;
      'blocks.rich-text': BlocksRichText;
      'blocks.tabs': BlocksTabs;
      'blocks.testimonial': BlocksTestimonial;
      'blocks.text-list': BlocksTextList;
      'elements.card': ElementsCard;
      'elements.checklist-item': ElementsChecklistItem;
      'elements.fact': ElementsFact;
      'elements.list-item': ElementsListItem;
      'elements.metric': ElementsMetric;
      'elements.tab': ElementsTab;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}
