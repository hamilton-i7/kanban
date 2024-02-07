import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import logoMobile from '../../public/logo-mobile.svg'
import iconArrowDown from '../../public/icon-chevron-down.svg'
import iconAdd from '../../public/icon-add-task-mobile.svg'
import iconMenu from '../../public/icon-vertical-ellipsis.svg'

type TopBarProps = {
  boardName: string
  onBoardNameClick?: () => void
}

export default function TopBar({ boardName, onBoardNameClick }: TopBarProps) {
  const [openOptionsMenu, setOpenOptionsMenu] = useState(false)
  const optionsMenuRef = useRef<HTMLDivElement>(null)

  const handleToggleMenu = () => {
    setOpenOptionsMenu(!openOptionsMenu)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(e.target as Node)
      ) {
        console.log('TOP BAR')
        setOpenOptionsMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <nav className="w-full h-16 bg-white px-4 flex items-center">
      <Image src={logoMobile} alt="Kanban logo" />
      <button
        type="button"
        onClick={onBoardNameClick}
        className="ml-4 flex items-center gap-2 overflow-hidden mr-auto"
      >
        <span className="font-bold text-lg truncate text-black">
          {boardName}
        </span>
        <Image src={iconArrowDown} alt="Show all boards" />
      </button>
      <Link
        href="/"
        className="h-8 w-12 flex-shrink-0 ml-2 bg-purple flex items-center justify-center rounded-3xl"
      >
        <Image src={iconAdd} alt="Add new task" />
      </Link>
      <div ref={optionsMenuRef} className="relative">
        <button
          type="button"
          onClick={handleToggleMenu}
          aria-label="Open menu"
          className="ml-4"
        >
          <Image src={iconMenu} alt="Menu icon" height={16} />
        </button>
        {openOptionsMenu && (
          <menu className="w-48 py-2 rounded-lg bg-white absolute -bottom-28 right-0">
            <li className="h-10 flex items-center px-4 text-gray-300 capitalize text-xs font-medium">
              Edit board
            </li>
            <li className="h-10 flex items-center px-4 text-red capitalize text-xs font-medium">
              Delete board
            </li>
          </menu>
        )}
      </div>
    </nav>
  )
}
