'use client'

import { SUBTASK_FIELD_TYPE } from '@/app/lib/constants'
import { useCreateTask } from '@/app/lib/hooks/task_hooks'
import { CreateTask, Subtask } from '@/app/lib/models'
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import TaskForm from './TaskForm'
import { useGetRelatedColumns } from '@/app/lib/hooks/column_hooks'
import { useGetBoard } from '@/app/lib/hooks/board_hooks'

export default function AddTaskDialog() {
  const params = useParams<{ boardId: string }>()
  const ADD_TASK_PATHNAME = `/dashboard/boards/${params.boardId}/tasks/new`
  const pathname = usePathname()
  const router = useRouter()

  const { mutate: createTask } = useCreateTask()

  const { data: board } = useGetBoard(+params.boardId)
  const {
    isPending: isColumnsPending,
    isError: isColumnsError,
    error: columnsError,
    data: columns,
  } = useGetRelatedColumns(board?.columns[0].id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColumnId, setSelectedColumnId] = useState('')
  const [subtaskFields, setSubtaskFields] = useState<
    Pick<Subtask, 'id' | 'title'>[]
  >([])
  const [tempId, setTempId] = useState(0)

  const [activeSubtaskField, setActiveSubtaskField] = useState<Pick<
    Subtask,
    'id' | 'title'
  > | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type !== SUBTASK_FIELD_TYPE) return
    setActiveSubtaskField(event.active.data.current.column)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSubtaskField(null)

    const { active, over } = event
    if (!over) return

    if (active.id === over.id) return

    setSubtaskFields((subs) => {
      const activeSubtaskFieldIndex = subs.findIndex(
        ({ id }) => id.toString() === active.id
      )
      const overSubtaskFieldIndex = subs.findIndex(
        ({ id }) => id.toString() === over.id
      )
      return arrayMove(subs, activeSubtaskFieldIndex, overSubtaskFieldIndex)
    })
  }

  const handleTitleChange = (title: string) => {
    setTitle(title)
  }

  const handleDescriptionChange = (description: string) => {
    setDescription(description)
  }

  const handleColumnChange = (columnId: string) => {
    setSelectedColumnId(columnId)
  }

  const handleAddSubtask = () => {
    setSubtaskFields((subs) => [...subs, { id: tempId, title: '' }])
    setTempId((id) => id + 1)
  }

  const handleUpdateSubtask = (subtaskId: number, title: string) => {
    setSubtaskFields((cols) => {
      const updatedSubtasks = [...cols]
      const subtaskToUpdateIndex = updatedSubtasks.findIndex(
        ({ id }) => id === subtaskId
      )
      updatedSubtasks[subtaskToUpdateIndex] = {
        ...updatedSubtasks[subtaskToUpdateIndex],
        title,
      }
      return updatedSubtasks
    })
  }

  const handleDeleteSubtask = (subtaskId: number) => {
    setSubtaskFields((subs) => subs.filter(({ id }) => id !== subtaskId))
  }

  const handleDialogClose = () => {
    router.push(`/dashboard/boards/${params.boardId}`)
  }

  const handleCreateTask = () => {
    const task: CreateTask = {
      title,
      description,
      column: +selectedColumnId,
      subtasks: subtaskFields.map(({ title }) => ({ title })),
    }
    createTask(task, {
      onSuccess: () => {
        router.push(`/dashboard/boards/${params.boardId}`)
      },
      onError: (error) => {
        console.log(error)
      },
    })
  }

  useEffect(() => {
    if (!board) return
    setSelectedColumnId(board.columns[0].id.toString())
  }, [board])

  if (pathname !== ADD_TASK_PATHNAME) {
    return null
  }

  if (isColumnsPending) {
    return <div>Loading...</div>
  }

  if (isColumnsError) {
    return <>{columnsError && <div>Error: {columnsError.message}</div>}</>
  }

  return (
    <TaskForm
      open
      onClose={handleDialogClose}
      title={title}
      description={description}
      columns={columns}
      onColumnChange={handleColumnChange}
      selectedColumnId={selectedColumnId}
      onTitleChange={handleTitleChange}
      onDescriptionChange={handleDescriptionChange}
      subtaskFields={subtaskFields}
      activeSubtaskField={activeSubtaskField}
      onSubtaskAdd={handleAddSubtask}
      onSubtaskUpdate={handleUpdateSubtask}
      onSubtaskDelete={handleDeleteSubtask}
      onConfirmClick={handleCreateTask}
      onSubtaskFieldDragStart={handleDragStart}
      onSubtaskFieldDragEnd={handleDragEnd}
    />
  )
}
