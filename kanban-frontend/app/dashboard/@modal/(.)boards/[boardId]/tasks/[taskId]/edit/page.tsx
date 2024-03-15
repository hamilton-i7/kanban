import Board from '@/app/dashboard/boards/components/Board'
import EditTaskDialog from '@/app/dashboard/tasks/components/EditTaskDialog'
import { getBoard } from '@/app/lib/api/board_api'
import { getTask } from '@/app/lib/api/task_api'
import { SINGLE_BOARD_KEY, SINGLE_TASK_KEY } from '@/app/lib/constants'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import React from 'react'

export default async function EditTaskPageModalPage({
  params,
}: {
  params: { boardId: string; taskId: string }
}) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: [SINGLE_BOARD_KEY, +params.boardId],
    queryFn: () => getBoard(+params.boardId),
  })

  await queryClient.prefetchQuery({
    queryKey: [SINGLE_TASK_KEY, +params.taskId],
    queryFn: () => getTask(+params.taskId),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditTaskDialog />
    </HydrationBoundary>
  )
}
