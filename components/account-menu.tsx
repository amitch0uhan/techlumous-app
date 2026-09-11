import { CaretDownIcon } from "@phosphor-icons/react/ssr"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { AccountMenuActions } from "./account-menu-actions"
import { createClient } from "@/lib/supabase/server"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export async function AccountMenu({ className }: { className?: string }) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  const name = user?.user_metadata?.name || user?.email || ""
  const email = user?.email || ""
  const avatarUrl = user?.user_metadata?.avatar_url || ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1 rounded-full bg-secondary p-1 text-left outline-none hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-primary/80",
          className
        )}
      >
        <Avatar size="sm">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium lg:inline-block">
          {name}
        </span>
        <CaretDownIcon className="mr-1 hidden size-3 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <AccountMenuActions />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
