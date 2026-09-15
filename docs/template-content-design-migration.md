# Template content/design migration

Status: **applied** on 2026-09-15 to the remote Supabase project as the tracked
migration `separate_template_design`. The existing rows were test data, so no
legacy compatibility is kept: colors now live only in the design columns, and
`published_content` no longer carries `colors`, `primaryColor`, `secondaryColor`
or `onPrimaryColor`.

## Column meanings

| Table       | Column              | Purpose                                                       |
| ----------- | ------------------- | ------------------------------------------------------------- |
| `templates` | `default_content`   | Template default content (text, images, links, visibility)    |
| `templates` | `default_design`    | Template default editable colors; `{}` when there are none    |
| `projects`  | `draft_content`     | Saved editable content                                        |
| `projects`  | `draft_design`      | Saved editable colors; `null` = never saved                   |
| `projects`  | `published_content` | Currently published content                                   |
| `projects`  | `published_design`  | Currently published colors; `null` = never published          |

`deployed_content_hash` is unchanged; the application computes it from both
content and design. No tables, foreign keys or RLS policies changed.

## Applied SQL

```sql
alter table public.templates
  add column default_design jsonb not null default '{}'::jsonb;
alter table public.projects add column draft_design jsonb;
alter table public.projects add column published_design jsonb;

alter table public.templates
  add constraint templates_default_design_object
  check (jsonb_typeof(default_design) = 'object');
alter table public.projects
  add constraint projects_draft_design_object
  check (draft_design is null or jsonb_typeof(draft_design) = 'object');
alter table public.projects
  add constraint projects_published_design_object
  check (published_design is null or jsonb_typeof(published_design) = 'object');

-- Catalog: move lumous-travel-one colors from default_content into default_design.
update public.templates
set default_design = jsonb_build_object('colors', default_content -> 'colors'),
    default_content = default_content - 'colors' - 'primaryColor' - 'secondaryColor' - 'onPrimaryColor'
where slug = 'lumous-travel-one'
  and jsonb_typeof(default_content -> 'colors') = 'object';

-- lumous-travel-one projects: move draft/published colors into the design
-- columns (template defaults fill any missing color), then strip them from content.
update public.projects p
set draft_design = case
      when p.draft_content is null or p.draft_content = '{}'::jsonb then null
      else jsonb_build_object('colors',
        coalesce(t.default_design -> 'colors', '{}'::jsonb)
        || case when jsonb_typeof(p.draft_content -> 'colors') = 'object'
                then p.draft_content -> 'colors' else '{}'::jsonb end)
    end,
    published_design = case
      when p.published_content is null or p.published_content = '{}'::jsonb then null
      else jsonb_build_object('colors',
        coalesce(t.default_design -> 'colors', '{}'::jsonb)
        || case when jsonb_typeof(p.published_content -> 'colors') = 'object'
                then p.published_content -> 'colors' else '{}'::jsonb end)
    end,
    draft_content = p.draft_content - 'colors' - 'primaryColor' - 'secondaryColor' - 'onPrimaryColor',
    published_content = p.published_content - 'colors' - 'primaryColor' - 'secondaryColor' - 'onPrimaryColor'
from public.templates t
where t.id = p.template_id and t.slug = 'lumous-travel-one';

-- Templates without design controls: existing snapshots get an intentionally
-- empty design; absent snapshots stay null.
update public.projects p
set draft_design = case
      when p.draft_content is not null and p.draft_content <> '{}'::jsonb then '{}'::jsonb
    end,
    published_design = case
      when p.published_content is not null and p.published_content <> '{}'::jsonb then '{}'::jsonb
    end
from public.templates t
where t.id = p.template_id and t.slug <> 'lumous-travel-one';

grant select (published_design) on public.projects to anon;
```

An empty content snapshot (`'{}'`, the existing column default) counts as
absent, matching the application's `Object.keys(...).length > 0` checks.

## Permissions

Deployed template renderers read with the anon key. `anon` has no table-level
SELECT on `projects`; it holds column grants for `id`, `name`, `status`,
`published_content` and now `published_design`. It cannot read `draft_content`
or `draft_design`, and RLS still limits it to rows with `status = 'published'`.

`authenticated` holds table-level privileges, so the new columns are covered
without extra grants; the existing owner-scoped RLS policies apply to the whole
row. Only `authenticated` can read `templates`, including `default_design`.

## Verification (run 2026-09-15)

```sql
-- Constraints and columns exist.
select conrelid::regclass, conname, pg_get_constraintdef(oid) from pg_constraint
where conname in ('templates_default_design_object',
  'projects_draft_design_object', 'projects_published_design_object');

-- No colors left in content; design holds them.
select t.slug, p.id,
  p.draft_content ?| array['colors','primaryColor','secondaryColor','onPrimaryColor'] as draft_has_colors,
  p.published_content ?| array['colors','primaryColor','secondaryColor','onPrimaryColor'] as published_has_colors,
  p.draft_design, p.published_design
from public.projects p join public.templates t on t.id = p.template_id;

-- Column access.
select r, c, has_column_privilege(r, 'public.projects', c, 'SELECT') as can_read
from unnest(array['anon','authenticated']) r
cross join unnest(array['published_content','published_design','draft_content','draft_design']) c;
```

Results: all three constraints present; no content column contains colors;
`lumous-travel-one` has 17 colors in `default_design`, `draft_design` and
`published_design`; `lumous-mark-one` has `{}`. As `anon`, selecting the
published columns returns published rows and selecting `draft_design` fails with
`permission denied`.

## Rollback

```sql
revoke select (published_design) on public.projects from anon;
alter table public.projects drop constraint projects_published_design_object;
alter table public.projects drop constraint projects_draft_design_object;
alter table public.templates drop constraint templates_default_design_object;
alter table public.projects drop column published_design;
alter table public.projects drop column draft_design;
alter table public.templates drop column default_design;
```

Dropping the columns discards design data. To keep it for the old content-only
code, first copy `design -> 'colors'` back into each matching content column's
`colors` key.
