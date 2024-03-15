import {
  CreateTask,
  DetailedBoard,
  DetailedTask,
  EditTask,
  TaskWithSubtasks,
} from '../models'
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

export const createTask = async (task: CreateTask) => {
  const response = await axiosInstance.post<TaskWithSubtasks>(
    '/tasks/items/',
    task
  )
  return response.data
}

export const editTask = async (id: number, task: EditTask) => {
  const response = await axiosInstance.patch<TaskWithSubtasks>(
    `/tasks/items/${id}/`,
    task
  )
  return response.data
}

export const deleteTask = async (id: number) => {
  const response = await axiosInstance.delete<{ msg: string }>(
    `/tasks/items/${id}/`
  )
  return response.data
}
