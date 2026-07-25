alter table public.projects
  add constraint projects_status_check
  check (status in ('draft', 'published'));

alter policy "anon reads public columns of all projects"
  on public.projects
  using (status = 'published');

revoke select on public.projects from anon;
revoke select (
  id,
  user_id,
  template_id,
  name,
  content,
  status,
  vercel_project_id,
  deployment_url,
  deploy_status,
  deploy_error,
  deployed_content_hash,
  last_deployed_at,
  created_at,
  updated_at
) on public.projects from anon;

grant select (id, content, status) on public.projects to anon;
