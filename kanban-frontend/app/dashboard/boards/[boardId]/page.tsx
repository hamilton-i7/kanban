import React from 'react'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import { getBoard } from '@/app/lib/api/board_api'
import Board from '../components/Board'
import { SINGLE_BOARD_KEY } from '@/app/lib/constants'

export default async function BoardPage({
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
    </HydrationBoundary>
  )
}
