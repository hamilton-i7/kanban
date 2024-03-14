import React from 'react'
import AddTaskDialog from '../../../../tasks/components/AddTaskDialog'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import { SINGLE_BOARD_KEY } from '@/app/lib/constants'
import { getBoard } from '@/app/lib/api/board_api'
import Board from '../../../components/Board'

export default async function CreateTaskPage({
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
      <Board />
      <AddTaskDialog />
    </HydrationBoundary>
  )
}
