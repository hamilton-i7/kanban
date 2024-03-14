import Board from '@/app/dashboard/boards/components/Board'
import AddTaskDialog from '@/app/dashboard/tasks/components/AddTaskDialog'
import { getBoard } from '@/app/lib/api/board_api'
import { SINGLE_BOARD_KEY } from '@/app/lib/constants'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import React from 'react'

export default async function CreateTaskDialogModalPage({
  params,
}: {
  params: { boardId: string }
}) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: [SINGLE_BOARD_KEY, +params.boardId],
    queryFn: () => getBoard(+params.boardId),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AddTaskDialog />
    </HydrationBoundary>
  )
}
