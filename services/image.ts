"use client"

import { createClient } from "@/lib/supabase/client"

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET ?? "project-images"

export async function uploadImage(file: File): Promise<string> {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("You must be authenticated to upload an image")
  }

  const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
  const path = `${user.id}/${fileName}`
  const { data: uploadData, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    })

  console.log("uploadData", uploadData)

  if (error) throw new Error(`Failed to upload image: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return data.publicUrl
}
