import "server-only"

import { headers } from "next/headers"
import { userAgentFromString } from "next/server"

import { deviceCapabilitiesForDeviceType } from "@/lib/device-capabilities"

export async function getRequestDeviceCapabilities() {
  const userAgentHeader = (await headers()).get("user-agent") ?? undefined
  const { device } = userAgentFromString(userAgentHeader)

  return deviceCapabilitiesForDeviceType(device.type)
}
