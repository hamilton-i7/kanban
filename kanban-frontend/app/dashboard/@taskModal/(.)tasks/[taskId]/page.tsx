import React from 'react'
import TaskDetailDialog from '@/app/dashboard/tasks/components/TaskDetailDialog'
import { getTask } from '@/app/lib/api/task_api'
import { SINGLE_TASK_KEY } from '@/app/lib/constants'
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from '@tanstack/react-query'

export default async function TaskDetailModalPage({
  params,
}: {
  params: { taskId: string }
}) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: [SINGLE_TASK_KEY, +params.taskId],
    queryFn: () => getTask(+params.taskId),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TaskDetailDialog />
    </HydrationBoundary>
  )
}
