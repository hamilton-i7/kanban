import { useQuery } from '@tanstack/react-query'
import { getBoard, getBoards } from '../api/boardApi'
import { BOARDS_KEY, SINGLE_BOARD_KEY } from '../constants'

const useBoards = () => {
  return useQuery({
    queryKey: [BOARDS_KEY],
    queryFn: () => getBoards(),
  })
}

const useBoard = (boardId: number) => {
  return useQuery({
    queryKey: [SINGLE_BOARD_KEY, boardId],
    queryFn: () => getBoard(boardId),
  })
}

export { useBoards, useBoard }
