/**
 * Default domain field schema templates + Zod validation.
 *
 * These are the seeds written to `emp_domain_field_templates` on first run.
 * Admins/Domain Heads can edit live schema in the admin UI; this file is
 * the fallback / seed source — do not add per-domain logic anywhere else.
 */
import { z } from 'zod';
import type { FieldDef } from '@/lib/supabase/types';

// ─── Zod schema for a single field definition ─────────────────────────────────

export const fieldDefSchema = z.object({
  key:      z.string().min(1),
  label:    z.string().min(1),
  type:     z.enum(['text', 'table', 'select', 'date', 'checklist', 'url', 'keyvalue', 'textarea', 'multiselect', 'number']),
  options:  z.array(z.string()).optional(),
  required: z.boolean().optional(),
  columns:  z.array(z.string()).optional(),
});

export const fieldSchemaArray = z.array(fieldDefSchema);

// ─── Per-domain default templates ─────────────────────────────────────────────

export const DOMAIN_FIELD_DEFAULTS: Record<string, FieldDef[]> = {
  outreach: [
    {
      key: 'contacts', label: 'Outreach Contacts', type: 'table',
      columns: ['Name', 'Organization', 'Role', 'Contact Info', 'Date Reached Out', 'Channel', 'Response', 'Status', 'Next Follow-up Date'],
    },
  ],
  social_media: [
    { key: 'platform',       label: 'Platform',       type: 'multiselect', options: ['Instagram','LinkedIn','Twitter/X','YouTube','Facebook','Threads'] },
    { key: 'post_type',      label: 'Post Type',      type: 'select',      options: ['Reel','Carousel','Static','Story','Thread','Video'] },
    { key: 'caption',        label: 'Caption',        type: 'textarea' },
    { key: 'hashtags',       label: 'Hashtags',       type: 'text' },
    { key: 'scheduled_at',   label: 'Scheduled Date/Time', type: 'date' },
    { key: 'live_link',      label: 'Live Link (post-publish)', type: 'url' },
    { key: 'likes',          label: 'Likes',          type: 'number' },
    { key: 'comments_count', label: 'Comments',       type: 'number' },
    { key: 'shares',         label: 'Shares',         type: 'number' },
  ],
  backend_dev: [
    { key: 'repo_link',    label: 'Repo Link',     type: 'url' },
    { key: 'branch',       label: 'Branch',        type: 'text' },
    { key: 'issue_ref',    label: 'Related Issue #', type: 'text' },
    { key: 'tech_stack',   label: 'Tech Stack Tags', type: 'text' },
    { key: 'environment',  label: 'Environment',   type: 'select',    options: ['Development','Staging','Production'] },
    { key: 'task_type',    label: 'Type',          type: 'select',    options: ['Feature','Bug Fix','Refactor','Infra','Security'] },
    {
      key: 'pre_submit_checklist', label: 'Pre-Submit Checklist', type: 'checklist',
      options: ['Tests written', 'Peer reviewed', 'No linter errors'],
      required: true,
    },
  ],
  website_dev: [
    { key: 'page_section',  label: 'Page / Section', type: 'text' },
    { key: 'staging_link',  label: 'Staging Link',   type: 'url' },
    { key: 'figma_link',    label: 'Figma Link',     type: 'url' },
    {
      key: 'browser_checklist', label: 'Browser / Device Checklist', type: 'checklist',
      options: ['Chrome Desktop', 'Firefox Desktop', 'Safari Desktop', 'Chrome Mobile', 'Safari iOS'],
    },
    { key: 'screenshot_before', label: 'Screenshot Before', type: 'url' },
    { key: 'screenshot_after',  label: 'Screenshot After',  type: 'url' },
  ],
  app_dev: [
    { key: 'platform',      label: 'Platform',      type: 'select',    options: ['iOS','Android','Both','Web'] },
    { key: 'build_version', label: 'Build / Version', type: 'text' },
    { key: 'feature_flag',  label: 'Feature Flag Name', type: 'text' },
    {
      key: 'device_matrix', label: 'Device Matrix Checklist', type: 'checklist',
      options: ['iPhone 14','iPhone SE','Pixel 7','Samsung S24','iPad'],
    },
    {
      key: 'store_checklist', label: 'Store Submission Checklist', type: 'checklist',
      options: ['App icon uploaded', 'Screenshots uploaded', 'Description updated', 'Privacy policy link added'],
    },
  ],
  ai_ml: [
    { key: 'dataset_link',    label: 'Dataset Link / Version', type: 'url' },
    { key: 'model_name',      label: 'Model Name / Version',   type: 'text' },
    { key: 'notebook_link',   label: 'Notebook Link',          type: 'url' },
    { key: 'metrics',         label: 'Key Metrics',            type: 'keyvalue' },
    { key: 'compute_used',    label: 'Compute Used',           type: 'text' },
  ],
  ui_ux: [
    { key: 'figma_link',       label: 'Figma Link',         type: 'url' },
    { key: 'design_version',   label: 'Design Version',     type: 'text' },
    { key: 'deliverable_type', label: 'Deliverable Type',   type: 'select', options: ['Wireframe','Prototype','High-fi','Design System','Handoff'] },
    {
      key: 'style_guide_checklist', label: 'Style Guide Checklist', type: 'checklist',
      options: ['Follows color tokens', 'Typography matches', 'Spacing consistent', 'Icons from approved set'],
    },
    { key: 'annotation_notes', label: 'Inline Annotation Notes', type: 'textarea' },
  ],
};

// ─── Domain slugs (match emp_domains.slug in the migration) ──────────────────

export const DOMAIN_SLUGS = [
  'outreach', 'social_media', 'backend_dev', 'website_dev', 'app_dev', 'ai_ml', 'ui_ux',
] as const;

export type DomainSlug = typeof DOMAIN_SLUGS[number];

/**
 * Returns the field schema for a given domain slug.
 * Falls back to empty array for unknown/custom domains.
 */
export function getFieldsForDomain(slug: string): FieldDef[] {
  return DOMAIN_FIELD_DEFAULTS[slug] ?? [];
}

/**
 * Returns true if a Backend Dev task's pre-submit checklist is fully checked.
 * Server-Action validates this before allowing submitted_for_review transition.
 */
export function backendChecklistComplete(customFields: Record<string, unknown>): boolean {
  const checklist = customFields['pre_submit_checklist'];
  if (!Array.isArray(checklist)) return false;
  const required = DOMAIN_FIELD_DEFAULTS.backend_dev
    .find(f => f.key === 'pre_submit_checklist')?.options ?? [];
  return required.every(item => checklist.includes(item));
}

// ─── Validate custom_fields JSON on form submit ───────────────────────────────

export function validateCustomFields(fields: unknown): { success: true; data: Record<string, unknown> } | { success: false; error: string } {
  if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) {
    return { success: false, error: 'custom_fields must be a plain object' };
  }
  return { success: true, data: fields as Record<string, unknown> };
}
