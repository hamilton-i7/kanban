import React, { useEffect, useState } from 'react'
import { useEditBoard } from '@/app/lib/hooks/board_hooks'
import { EditBoard, DetailedBoard } from '@/app/lib/models'
import BoardForm from './BoardForm'

type EditBoardDialogProps = {
  open: boolean
  onClose: () => void
  board: DetailedBoard
}

export default function EditBoardDialog({
  open,
  onClose,
  board,
}: EditBoardDialogProps) {
  const { isPending, mutate: editBoard } = useEditBoard(board.id)

  const [boardName, setBoardName] = useState(board.name)
  const [columns, setColumns] = useState<string[]>(
    board.columns.map((column) => column.name)
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

  const handleEditBoard = () => {
    const updatedBoard: EditBoard = {
      name: boardName,
      columns: columns.map((column) => ({ name: column })),
    }
    editBoard(updatedBoard, {
      onSuccess: () => {
        onClose()
      },
      onError: (error) => {
        console.log(error)
      },
    })
  }

  useEffect(() => {
    if (open) {
      // Reset state when opening the dialog
      setBoardName(board.name)
      setColumns(board.columns.map((column) => column.name))
    }
  }, [open, board.name, board.columns])

  return (
    <BoardForm
      variant="edit"
      open={open}
      onClose={onClose}
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
