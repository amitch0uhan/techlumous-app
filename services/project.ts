"use server"

import { requireAuthenticatedUserId } from "@/lib/supabase/auth"
import { createAdminClient, createClient } from "@/lib/supabase/server"
import {
  insertProjectSchema,
  updateProjectSchema,
  type InsertProject,
  type Project,
  type UpdateProject,
} from "./project.schema"

const TABLE = "projects"

export async function createProject(input: InsertProject): Promise<Project> {
  const payload = insertProjectSchema.parse(input)
  const supabase = await createClient()

  // projects.user_id has no DB default, so it must come from the session.
  const userId = await requireAuthenticatedUserId(supabase)
  if (!userId) throw new Error("Failed to create project: not authenticated")

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...payload, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(`Failed to create project: ${error.message}`)

  return data
}

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to list projects: ${error.message}`)

  return data
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(`Failed to get project: ${error.message}`)

  return data
}

export async function updateProject(
  id: string,
  input: UpdateProject
): Promise<Project> {
  const userId = await requireAuthenticatedUserId()
  if (!userId) {
    throw new Error("Failed to update project: not authenticated")
  }

  const payload = updateProjectSchema.parse(input)
  const supabase = await createClient()

  // No DB trigger maintains updated_at, so set it here.
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(`${error.message}`)

  return data
}

export async function deleteProject(id: string, userId: string): Promise<void> {
  const authenticatedUserId = await requireAuthenticatedUserId()
  if (!authenticatedUserId || authenticatedUserId !== userId) {
    throw new Error("Failed to delete project: not authenticated")
  }

  const supabase = await createAdminClient()

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw new Error(`Failed to delete project: ${error.message}`)
}
