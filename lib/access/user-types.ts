export const USER_TYPES = ["free", "pro", "admin"] as const

export type UserType = (typeof USER_TYPES)[number]

export const DEFAULT_USER_TYPE: UserType = "free"

export function isUserType(value: unknown): value is UserType {
  return (USER_TYPES as readonly unknown[]).includes(value)
}

export function toUserType(value: unknown): UserType {
  return isUserType(value) ? value : DEFAULT_USER_TYPE
}

export type UserAccess = {
  maxProjects: number
}

export const ACCESS: Record<UserType, UserAccess> = {
  free: { maxProjects: 1 },
  pro: { maxProjects: 5 },
  admin: { maxProjects: Infinity },
}
