"use client"

import { useState } from "react"
import {
  DeviceMobileCameraIcon,
  DeviceTabletCameraIcon,
  MonitorIcon,
} from "@phosphor-icons/react"

import {
  DeploymentStatus,
  normalizeDeploymentUrl,
  resolveDeploymentState,
} from "@/components/deployment-status"
import { IconButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switcher, type SwitcherOption } from "@/components/ui/switcher"

const viewportOptions: readonly SwitcherOption[] = [
  {
    value: "desktop",
    icon: <MonitorIcon />,
    ariaLabel: "Desktop preview",
  },
  {
    value: "tablet",
    icon: <DeviceTabletCameraIcon />,
    ariaLabel: "Tablet preview",
  },
  {
    value: "mobile",
    icon: <DeviceMobileCameraIcon />,
    ariaLabel: "Mobile preview",
  },
]

interface EditorTopBarProps {
  projectName: string
  projectStatus: string
  liveUrl?: string | null
}

export function EditorTopBar({
  projectName,
  projectStatus,
  liveUrl,
}: EditorTopBarProps) {
  const [viewport, setViewport] = useState("desktop")
  const deploymentState = resolveDeploymentState(projectStatus)
  const normalizedLiveUrl = normalizeDeploymentUrl(liveUrl)
  const isLive = deploymentState === "ready" && normalizedLiveUrl

  return (
    <Card
      role="banner"
      className="relative flex min-h-12 w-full flex-row items-center justify-between gap-3 rounded-2xl bg-background px-4 py-0"
    >
      <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
        <span className="truncate">{projectName}</span>
        <DeploymentStatus status={projectStatus} className="shrink-0 py-0" />
      </div>

      <Switcher
        aria-label="Preview viewport"
        value={viewport}
        options={viewportOptions}
        onValueChange={setViewport}
        className="absolute left-1/2 -translate-x-1/2"
      />

      {isLive && (
        <IconButton
          render={
            <a
              href={normalizedLiveUrl}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
          // icon={ArrowSquareOutIcon}
          iconPosition="end"
          variant="outline"
          size="sm"
          className="shrink-0 rounded-full"
        >
          Visit website
        </IconButton>
      )}
    </Card>
  )
}
