'use client'

import React, { useEffect, useState } from 'react'
import TaskForm from './TaskForm'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useEditTask, useGetTask } from '@/app/lib/hooks/task_hooks'
import { useGetRelatedColumns } from '@/app/lib/hooks/column_hooks'
import { SUBTASK_FIELD_TYPE } from '@/app/lib/constants'
import { Subtask, EditTask } from '@/app/lib/models'
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

export default function EditTaskDialog() {
  const params = useParams<{ boardId: string; taskId: string }>()
  const EDIT_TASK_PATHNAME = `/dashboard/boards/${params.boardId}/tasks/${params.taskId}/edit`
  const pathname = usePathname()
  const router = useRouter()

  const { data: task } = useGetTask(+params.taskId)
  const { mutate: editTask } = useEditTask(+params.taskId)
  const {
    isPending: isColumnsPending,
    isError: isColumnsError,
    error: columnsError,
    data: columns,
  } = useGetRelatedColumns(task?.column)

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
    setSubtaskFields((subs) => {
      const updatedSubtasks = [...subs]
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

  const handleEditTask = () => {
    const updatedTask: EditTask = {
      title,
      description,
      column: +selectedColumnId,
      subtasks: subtaskFields.map(({ id, title }) => {
        const sub = task!.subtasks.find((s) => s.id === id)
        if (sub) {
          return { id, title }
        }
        return { title }
      }),
    }
    editTask(updatedTask, {
      onSuccess: () => {
        router.push(`/dashboard/boards/${params.boardId}`)
      },
      onError: (error) => {
        console.log(error)
      },
    })
  }

  useEffect(() => {
    if (!task) return
    setSelectedColumnId(task.column.toString())
  }, [task])

  useEffect(() => {
    if (pathname !== EDIT_TASK_PATHNAME) return
    if (!task) return
    setTitle(task.title)
    setDescription(task.description)
    setSubtaskFields(task.subtasks)
    setSelectedColumnId(task.column.toString())
    setTempId(Math.max(...task.subtasks.map(({ id }) => id)) + 1)
  }, [pathname, EDIT_TASK_PATHNAME, task])

  if (pathname !== EDIT_TASK_PATHNAME) {
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
      variant="edit"
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
      onConfirmClick={handleEditTask}
      onSubtaskFieldDragStart={handleDragStart}
      onSubtaskFieldDragEnd={handleDragEnd}
    />
  )
}
