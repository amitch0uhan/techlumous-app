"use client"

import Image from "next/image"

import { LoginForm } from "@/components/login-form"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh p-2 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-lg bg-muted lg:block">
        <Image
          src="/assets/glowing-bg-potrait.png"
          alt="Techlumous"
          fill
          priority
          sizes="50vw"
          quality={100}
          className="object-cover object-top"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Logo size={24} showName />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
