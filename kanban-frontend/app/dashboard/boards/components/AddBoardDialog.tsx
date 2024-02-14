'use client'

import React, { useState } from 'react'
import { useCreateBoard } from '../../../lib/hooks/board_hooks'
import { CreateBoard } from '../../../lib/models'
import { useRouter } from 'next/navigation'
import BoardForm from './BoardForm'

export default function AddBoardDialog() {
  const router = useRouter()
  const { isPending, mutate: createBoard } = useCreateBoard()

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
    router.back()
  }

  const handleCreateBoard = () => {
    const board: CreateBoard = {
      name: boardName,
      columns: columns.map((column) => ({ name: column })),
    }
    createBoard(board, {
      onSuccess: (data) => {
        router.push(`/dashboard/boards/${data.id}`)
      },
      onError: (error) => {
        console.log(error)
      },
    })
  }

  return (
    <BoardForm
      open
      onClose={handleDialogClose}
      boardName={boardName}
      onBoardNameChange={handleBoardNameChange}
      columns={columns}
      onColumnAdd={handleAddColumn}
      onColumnUpdate={handleUpdateColumn}
      onColumnDelete={handleDeleteColumn}
      onConfirmClick={handleCreateBoard}
    />
  )
}
