import { BoardPreview, DetailedBoard } from '../models'
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
