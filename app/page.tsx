import { Logo } from "@/components/logo"

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex items-center gap-3">
        <Logo size={56} />
        <span className="font-heading text-5xl tracking-tight text-primary">
          Techlumous
        </span>
      </div>
    </div>
  )
}
