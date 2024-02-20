import {
  BoardPreview,
  BoardWithColumns,
  Column,
  CreateBoard,
  DetailedBoard,
  EditBoard,
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

export const editBoard = async (id: number, board: EditBoard) => {
  const response = await axiosInstance.patch<DetailedBoard>(
    `/tasks/boards/${id}/`,
    board
  )
  return response.data
}

export const deleteBoard = async (id: number) => {
  const response = await axiosInstance.delete<{ msg: string }>(
    `/tasks/boards/${id}/`
  )
  return response.data
}

export const reorderColumns = async (
  id: number,
  columns: Pick<Column, 'id'>[]
) => {
  const response = await axiosInstance.patch<DetailedBoard>(
    `/tasks/boards/${id}/columns/reorder/`,
    columns
  )
  return response.data
}
