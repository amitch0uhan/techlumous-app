import { NextResponse, type NextRequest, userAgent } from "next/server"

import {
  deviceCapabilitiesForDeviceType,
  isProjectEditorPath,
} from "@/lib/device-capabilities"
import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
  const capabilities = deviceCapabilitiesForDeviceType(
    userAgent(request).device.type
  )

  if (
    isProjectEditorPath(request.nextUrl.pathname) &&
    !capabilities.canEditProjects
  ) {
    const projectsUrl = new URL("/", request.url)
    projectsUrl.searchParams.set("notice", "desktop-required")

    return NextResponse.redirect(projectsUrl)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
