import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import logoMobile from '../../public/logo-mobile.svg'
import iconArrowDown from '../../public/icon-chevron-down.svg'
import iconAdd from '../../public/icon-add-task-mobile.svg'
import iconMenu from '../../public/icon-vertical-ellipsis.svg'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      <nav className="w-full h-16 bg-white px-4 flex items-center">
        <Image src={logoMobile} alt="Kanban logo" />
        <button
          type="button"
          className="ml-4 flex items-center gap-2 overflow-hidden mr-auto"
        >
          <span className="font-bold text-lg truncate text-black">
            Platform Launch
          </span>
          <Image src={iconArrowDown} alt="Show all boards" />
        </button>
        <Link
          href="/"
          className="h-8 w-12 flex-shrink-0 ml-2 bg-purple flex items-center justify-center rounded-3xl"
        >
          <Image src={iconAdd} alt="Add new task" />
        </Link>
        <button type="button" aria-label="Open menu" className="ml-4">
          <Image src={iconMenu} alt="Menu icon" height={16} />
        </button>
      </nav>
      {children}
    </section>
  )
}
