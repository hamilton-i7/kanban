import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBoard,
  deleteBoard,
  editBoard,
  getBoard,
  getBoards,
  reorderColumns,
} from '../api/board_api'
import { BOARDS_KEY, SINGLE_BOARD_KEY } from '../constants'
import { Column, CreateBoard, EditBoard } from '../models'

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

const useEditBoard = (boardId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (board: EditBoard) => editBoard(boardId, board),
    onSuccess: (data) => {
      queryClient.setQueryData([SINGLE_BOARD_KEY, boardId], data)
    },
  })
}

const useDeleteBoard = () => {
  return useMutation({
    mutationFn: (boardId: number) => deleteBoard(boardId),
  })
}

const useReorderColumns = (boardId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (columns: Pick<Column, 'id'>[]) =>
      reorderColumns(boardId, columns),
    onSuccess: (data) => {
      queryClient.setQueryData([SINGLE_BOARD_KEY, boardId], data)
    },
  })
}

export {
  useGetBoards,
  useGetBoard,
  useCreateBoard,
  useEditBoard,
  useDeleteBoard,
  useReorderColumns,
}
