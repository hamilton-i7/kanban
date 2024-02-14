'use client'

import React, { useState } from 'react'
import { useEditBoard, useGetBoard } from '@/app/lib/hooks/board_hooks'
import { EditBoard } from '@/app/lib/models'
import BoardForm from './BoardForm'
import { useRouter } from 'next/navigation'

type EditBoardDialogProps = {
  boardId: number
}

export default function EditBoardDialog({ boardId }: EditBoardDialogProps) {
  const router = useRouter()
  const { isPending, isError, error, data: board } = useGetBoard(boardId)
  const { mutate: editBoard } = useEditBoard(boardId)

  const [boardName, setBoardName] = useState(board?.name ?? '')
  const [columns, setColumns] = useState<string[]>(
    board?.columns.map((column) => column.name) ?? []
  )

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
    router.back()
    // router.push(`/dashboard/boards/${boardId}`)
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
