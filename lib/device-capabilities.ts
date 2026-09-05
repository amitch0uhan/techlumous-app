export interface DeviceCapabilities {
  canEditProjects: boolean
  canResizePreview: boolean
}

const PROJECT_EDITOR_PATH = /^\/preview\/[^/]+\/edit\/?$/

export function deviceCapabilitiesForDeviceType(
  deviceType?: string
): DeviceCapabilities {
  const isMobile = deviceType === "mobile"

  return {
    canEditProjects: !isMobile,
    canResizePreview: !isMobile,
  }
}

export function isProjectEditorPath(pathname: string) {
  return PROJECT_EDITOR_PATH.test(pathname)
}
