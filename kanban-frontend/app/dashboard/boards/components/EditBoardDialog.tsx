'use client'

import React, { useEffect, useState } from 'react'
import { useEditBoard, useGetBoard } from '@/app/lib/hooks/board_hooks'
import { Column, EditBoard } from '@/app/lib/models'
import BoardForm from './BoardForm'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { COLUMN_FIELD_TYPE } from '@/app/lib/constants'
import { arrayMove } from '@dnd-kit/sortable'

export default function EditBoardDialog() {
  const params = useParams<{ boardId: string }>()
  const EDIT_BOARD_PATHNAME = `/dashboard/boards/${params.boardId}/edit`
  const pathname = usePathname()
  const router = useRouter()

  const { data: board } = useGetBoard(+params.boardId)
  const { mutate: editBoard } = useEditBoard(+params.boardId)

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
    router.push(`/dashboard/boards/${+params.boardId}`)
  }

  const handleEditBoard = () => {
    const updatedBoard: EditBoard = {
      name: boardName,
      columns: columnFields.map(({ id, name }) => {
        const col = board?.columns.find((c) => c.id === id)
        if (col) {
          return { id: col.id, name }
        }
        return { name }
      }),
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
      setBoardName(board.name)
      setColumnFields(board.columns)
      setTempId(Math.max(...board.columns.map((col) => col.id)) + 1)
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
      columnFields={columnFields}
      activeColumnField={activeColumnField}
      onColumnAdd={handleAddColumn}
      onColumnUpdate={handleUpdateColumn}
      onColumnDelete={handleDeleteColumn}
      onConfirmClick={handleEditBoard}
      onColumnFieldDragStart={handleDragStart}
      onColumnFieldDragEnd={handleDragEnd}
    />
  )
}
