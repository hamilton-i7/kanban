import { DetailedBoard, DetailedTask } from '../models'
import axiosInstance from './axiosInstance'

export const getTask = async (id: number) => {
  const response = await axiosInstance.get<DetailedTask>(`/tasks/items/${id}/`)
  return response.data
}

export const getBoardByTaskId = async (id: number) => {
  const response = await axiosInstance.get<DetailedBoard>(
    `/tasks/items/${id}/board/`
  )
  return response.data
}
