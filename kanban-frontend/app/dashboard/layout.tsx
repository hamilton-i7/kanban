'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import data from '../lib/detailed_boards.json'
import TopBar from '../ui/TopBar'
import iconBoard from '../../public/icon-board.svg'

function getBoard(boardId: number) {
  const board = data.find((currentBoard) => currentBoard.id === boardId)
  return board
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams<{ id: string }>()
  const board = getBoard(+params.id)
  const [showSelectBoardMenu, setShowSelectBoardMenu] = useState(false)

  const selectBoardMenuRef = useRef<HTMLDivElement>(null)

  const handleToggleMenu = () => {
    setShowSelectBoardMenu(!showSelectBoardMenu)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        selectBoardMenuRef.current &&
        !selectBoardMenuRef.current.contains(e.target as Node)
      ) {
        console.log('LAYOUT')
        setShowSelectBoardMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <section className="relative">
      <TopBar
        boardName={board?.name ?? 'DOES NOT WORK'}
        onBoardNameClick={handleToggleMenu}
      />
      <div ref={selectBoardMenuRef}>
        {showSelectBoardMenu && (
          <div className="absolute w-full h-[calc(100vh-var(--top-bar-height))] bg-black/50 flex justify-center items-start">
            <aside className="w-[16.5rem] rounded-lg bg-white py-4 mt-4">
              <header className="uppercase tracking-[0.2em] text-gray-300 font-bold mb-5 ml-6">
                All boards (3)
              </header>
              <menu>
                <li className="h-12 flex items-center px-6">
                  <Image src={iconBoard} alt="Board icon" className="mr-3" />
                  <span className="text-md font-bold text-gray-300">
                    Platform launch
                  </span>
                </li>
              </menu>
            </aside>
          </div>
        )}
      </div>

      {children}
    </section>
  )
}
