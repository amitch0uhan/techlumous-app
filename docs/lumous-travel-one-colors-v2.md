# Lumous Travel One — colour system v2 reset

`lumous-travel-one` replaced its 17 flat colour roles (`design.colors.canvas`,
`accentPrimary`, …) with nested surface and component groups
(`design.colors.page.background`, `design.colors.buttonPrimary.background`, …).
See the template README, "Colour system".

Decision: saved designs are **reset to the new defaults**, not mapped. The code
already tolerates old data — `designSchema` strips the retired keys and fills
every leaf default, and the renderer falls back per leaf — so this SQL only
keeps the catalog row and the editor's starting state tidy.

Run it by hand, in order, only after the code is deployed. Review the target
rows first.

```sql
-- 0. Inspect what will change.
select id, slug, default_design
from public.templates
where slug = 'lumous-travel-one';

select p.id, p.draft_design is not null as has_draft,
       p.published_design is not null as has_published
from public.projects p
join public.templates t on t.id = p.template_id
where t.slug = 'lumous-travel-one';

-- 1. Catalog default = code `defaultDesign` (designSchema.parse({})).
update public.templates
set default_design = '{"colors":{"buttonPrimary":{"background":"#3AAE7E","foreground":"#06120D","hoverBackground":"#40BF8B","glow":"#3AAE7E"},"buttonSecondary":{"foreground":"#FFFFFF","border":"#FFFFFF","hoverForeground":"#3AAE7E","hoverBorder":"#3AAE7E"},"page":{"background":"#07080A","heading":"#FFFFFF","foreground":"#E8E6DF","mutedForeground":"#B4B1A7","border":"#FFFFFF"},"header":{"background":"#0F0F12","foreground":"#FFFFFF"},"section":{"background":"#213633","heading":"#FFFFFF","foreground":"#FFFFFF","mutedForeground":"#B4B1A7","border":"#FFFFFF"},"photo":{"overlay":"#07080A","foreground":"#FFFFFF"},"footer":{"background":"#07080A","foreground":"#807D75","border":"#FFFFFF"},"buttonHeader":{"background":"#FFFFFF","foreground":"#0A0A0B","hoverBackground":"#F2F2F2"},"arrowButton":{"foreground":"#FFFFFF","border":"#FFFFFF","activeBackground":"#3AAE7E","activeForeground":"#06120D"},"heroArrow":{"background":"#FFFFFF","foreground":"#FFFFFF","border":"#FFFFFF"},"heroProgress":{"track":"#FFFFFF","fill":"#FFFFFF","label":"#FFFFFF"},"tag":{"background":"#FFFFFF","foreground":"#FFFFFF","border":"#FFFFFF"},"tripCard":{"foreground":"#FFFFFF","mutedForeground":"#FFFFFF","border":"#FFFFFF"},"testimonialCard":{"background":"#131317","heading":"#FFFFFF","foreground":"#E8E6DF","mutedForeground":"#807D75","border":"#FFFFFF"},"packageCard":{"overlay":"#07080A","foreground":"#FFFFFF","mutedForeground":"#FFFFFF"},"accordion":{"number":"#FFFFFF","title":"#FFFFFF","body":"#FFFFFF","divider":"#FFFFFF","icon":"#FFFFFF","iconBorder":"#FFFFFF"},"regionPicker":{"activeForeground":"#FFFFFF","inactiveForeground":"#FFFFFF"},"link":{"foreground":"#807D75","hoverForeground":"#3AAE7E"},"effects":{"ring":"#3AAE7E","shadow":"#000000"}}}'::jsonb
where slug = 'lumous-travel-one';

-- 2. Reset existing projects' designs to that default.
update public.projects p
set draft_design = t.default_design,
    published_design = case
      when p.published_design is null then null
      else t.default_design
    end
from public.templates t
where t.id = p.template_id
  and t.slug = 'lumous-travel-one';
```

Afterwards refresh the catalog cache. A live site shows the new colours only
after a redeploy (source change); republishing alone picks up the reset design
through ISR.

Regenerate the JSON above whenever `DEFAULT_COLORS` changes; it must equal
`defaultDesign` exactly.
