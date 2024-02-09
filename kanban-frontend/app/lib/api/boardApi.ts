import {
  BoardPreview,
  BoardWithColumns,
  CreateBoard,
  DetailedBoard,
} from '../models'
import axiosInstance from './axiosInstance'

export const getBoards = async () => {
  const response = await axiosInstance.get<BoardPreview[]>('/tasks/boards/')
  return response.data
}

export const getBoard = async (id: number) => {
  const response = await axiosInstance.get<DetailedBoard>(
    `/tasks/boards/${id}/`
  )
  return response.data
}

export const createBoard = async (board: CreateBoard) => {
  const response = await axiosInstance.post<BoardWithColumns>(
    '/tasks/boards/',
    board
  )
  return response.data
}
