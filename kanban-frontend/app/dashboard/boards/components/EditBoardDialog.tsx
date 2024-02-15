'use client'

import React, { useEffect, useState } from 'react'
import { useEditBoard, useGetBoard } from '@/app/lib/hooks/board_hooks'
import { EditBoard } from '@/app/lib/models'
import BoardForm from './BoardForm'
import { usePathname, useRouter } from 'next/navigation'

type EditBoardDialogProps = {
  boardId: number
}

export default function EditBoardDialog({ boardId }: EditBoardDialogProps) {
  const EDIT_BOARD_PATHNAME = `/dashboard/boards/${boardId}/edit`
  const pathname = usePathname()
  const router = useRouter()
  const { isPending, isError, error, data: board } = useGetBoard(boardId)
  const { mutate: editBoard } = useEditBoard(boardId)

  const [boardName, setBoardName] = useState('')
  const [columns, setColumns] = useState<string[]>([])

  const handleBoardNameChange = (name: string) => {
    setBoardName(name)
  }

  const handleAddColumn = () => {
    setColumns((currentColumns) => [...currentColumns, ''])
  }

  const handleUpdateColumn = (index: number, column: string) => {
    const updatedColumns = [...columns]
    updatedColumns[index] = column
    setColumns(updatedColumns)
  }

  const handleDeleteColumn = (index: number) => {
    const updatedColumns = columns.filter((_, i) => i !== index)
    setColumns(updatedColumns)
  }

  const handleDialogClose = () => {
    router.push(`/dashboard/boards/${boardId}`)
  }

  const handleEditBoard = () => {
    const updatedBoard: EditBoard = {
      name: boardName,
      columns: columns.map((column) => ({ name: column })),
    }
    editBoard(updatedBoard, {
      onSuccess: () => {
        handleDialogClose()
      },
      onError: (error) => {
        console.log(error)
      },
    })
  }

  useEffect(() => {
    if (pathname === EDIT_BOARD_PATHNAME) {
      if (!board) return
      // Reset state when navigating to the edit page (or modal)
      setBoardName(board.name)
      setColumns(board.columns.map((column) => column.name))
    }
  }, [pathname, EDIT_BOARD_PATHNAME, board])

  if (pathname !== EDIT_BOARD_PATHNAME) {
    return null
  }

  return (
    <BoardForm
      variant="edit"
      open
      onClose={handleDialogClose}
      boardName={boardName}
      onBoardNameChange={handleBoardNameChange}
      columns={columns}
      onColumnAdd={handleAddColumn}
      onColumnUpdate={handleUpdateColumn}
      onColumnDelete={handleDeleteColumn}
      onConfirmClick={handleEditBoard}
    />
  )
}
