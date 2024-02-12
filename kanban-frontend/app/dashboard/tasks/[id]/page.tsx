import React from 'react'
import { SINGLE_TASK_KEY } from '@/app/lib/constants'
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from '@tanstack/react-query'
import { getTask } from '@/app/lib/api/task_api'
import TaskDetailDialog from '../components/TaskDetailDialog'

export default async function TaskPage({ params }: { params: { id: string } }) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: [SINGLE_TASK_KEY, +params.id],
    queryFn: () => getTask(+params.id),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TaskDetailDialog />
    </HydrationBoundary>
  )
}
