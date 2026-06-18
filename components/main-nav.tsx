"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  EyeIcon,
  FolderIcon,
  LayoutIcon,
  PuzzlePieceIcon,
} from "@phosphor-icons/react/ssr"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const navItems = [
  { label: "Projects", href: "/", icon: FolderIcon },
  { label: "Templates", href: "/templates", icon: LayoutIcon },
  { label: "Preview", href: "/preview", icon: EyeIcon },
  { label: "Integration", href: "/integration", icon: PuzzlePieceIcon },
] as const

export function MainNav() {
  const pathname = usePathname()
  const activeHref =
    navItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    )?.href ?? navItems[0].href

  return (
    <Tabs value={activeHref}>
      <TabsList className="h-9 rounded-full bg-secondary px-1">
        {navItems.map(({ label, href, icon: Icon }) => (
          <TabsTrigger
            key={href}
            value={href}
            nativeButton={false}
            render={<Link href={href} />}
            className="rounded-full px-3 py-1.5 text-sm tab:px-4 data-active:bg-primary/80 data-active:text-white dark:data-active:bg-primary/80"
          >
            <Icon className="size-4.5 tab:hidden" />
            <span className="hidden tab:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
