import { useMutation, useQuery } from '@tanstack/react-query'
import { createBoard, getBoard, getBoards } from '../api/boardApi'
import { BOARDS_KEY, SINGLE_BOARD_KEY } from '../constants'
import { CreateBoard } from '../models'

const useGetBoards = () => {
  return useQuery({
    queryKey: [BOARDS_KEY],
    queryFn: () => getBoards(),
  })
}

const useGetBoard = (boardId: number) => {
  return useQuery({
    queryKey: [SINGLE_BOARD_KEY, boardId],
    queryFn: () => getBoard(boardId),
  })
}

const useCreateBoard = () => {
  return useMutation({
    mutationFn: (board: CreateBoard) => createBoard(board),
  })
}

export { useGetBoards, useGetBoard, useCreateBoard }
