'use client'

import React from 'react'
import TaskDetailDialog from '../components/TaskDetailDialog'
import Board from '../../boards/components/Board'
import { useGetBoardByTask } from '@/app/lib/hooks/task_hooks'

export default function TaskPage({ params }: { params: { taskId: string } }) {
  const {
    isPending,
    isError,
    error,
    data: board,
  } = useGetBoardByTask(+params.taskId)

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <>
      <Board boardId={board.id} />
      <TaskDetailDialog />
    </>
  )
}
