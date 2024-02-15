import React from 'react'
import EditBoardDialog from '../../components/EditBoardDialog'
import { getBoard } from '@/app/lib/api/board_api'
import { SINGLE_BOARD_KEY } from '@/app/lib/constants'
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from '@tanstack/react-query'
import Board from '../../components/Board'

export default async function EditBoardPage({
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
      <EditBoardDialog boardId={+params.boardId} />
    </HydrationBoundary>
  )
}
