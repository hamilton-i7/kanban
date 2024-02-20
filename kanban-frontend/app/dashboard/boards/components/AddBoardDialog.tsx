'use client'

import React, { useState } from 'react'
import { useCreateBoard } from '@/app/lib/hooks/board_hooks'
import { Column, CreateBoard } from '@/app/lib/models'
import { useRouter } from 'next/navigation'
import BoardForm from './BoardForm'
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { COLUMN_FIELD_TYPE } from '@/app/lib/constants'
import { arrayMove } from '@dnd-kit/sortable'

export default function AddBoardDialog() {
  const router = useRouter()
  const { mutate: createBoard } = useCreateBoard()

  const [boardName, setBoardName] = useState('')
  const [columnFields, setColumnFields] = useState<
    Pick<Column, 'id' | 'name'>[]
  >([])
  const [tempId, setTempId] = useState(0)

  const [activeColumnField, setActiveColumnField] = useState<Pick<
    Column,
    'id' | 'name'
  > | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type !== COLUMN_FIELD_TYPE) return
    setActiveColumnField(event.active.data.current.column)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumnField(null)

    const { active, over } = event
    if (!over) return

    if (active.id === over.id) return

    setColumnFields((cols) => {
      const activeColumnFieldIndex = cols.findIndex(
        ({ id }) => id.toString() === active.id
      )
      const overColumnFieldIndex = cols.findIndex(
        ({ id }) => id.toString() === over.id
      )
      return arrayMove(cols, activeColumnFieldIndex, overColumnFieldIndex)
    })
  }

  const handleBoardNameChange = (name: string) => {
    setBoardName(name)
  }

  const handleAddColumn = () => {
    setColumnFields((cols) => [...cols, { id: tempId, name: '' }])
    setTempId((id) => id + 1)
  }

  const handleUpdateColumn = (columnId: number, name: string) => {
    setColumnFields((cols) => {
      const updatedColumns = [...cols]
      const columnToUpdateIndex = updatedColumns.findIndex(
        (col) => col.id === columnId
      )
      updatedColumns[columnToUpdateIndex] = {
        ...updatedColumns[columnToUpdateIndex],
        name,
      }
      return updatedColumns
    })
  }

  const handleDeleteColumn = (columnId: number) => {
    setColumnFields((cols) => cols.filter((col) => col.id !== columnId))
  }

  const handleDialogClose = () => {
    router.back() // TODO: Change implementatio to use router.push
  }

  const handleCreateBoard = () => {
    const board: CreateBoard = {
      name: boardName,
      columns: columnFields.map(({ name }) => ({ name })),
    }
    createBoard(board, {
      onSuccess: (data) => {
        router.push(`/dashboard/boards/${data.id}`)
        // TODO: Close dialog after navigation
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
      columnFields={columnFields}
      activeColumnField={activeColumnField}
      onColumnAdd={handleAddColumn}
      onColumnUpdate={handleUpdateColumn}
      onColumnDelete={handleDeleteColumn}
      onConfirmClick={handleCreateBoard}
      onColumnFieldDragStart={handleDragStart}
      onColumnFieldDragEnd={handleDragEnd}
    />
  )
}
