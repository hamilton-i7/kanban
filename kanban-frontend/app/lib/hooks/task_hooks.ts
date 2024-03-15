import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SINGLE_BOARD_KEY, SINGLE_TASK_KEY } from '../constants'
import {
  createTask,
  deleteTask,
  editTask,
  getBoardByTaskId,
  getTask,
} from '../api/task_api'
import { CreateTask, EditTask } from '../models'

const useGetTask = (taskId: number) => {
  return useQuery({
    queryKey: [SINGLE_TASK_KEY, taskId],
    queryFn: () => getTask(taskId),
  })
}

const useGetBoardByTask = (taskId: number) => {
  return useQuery({
    queryKey: [SINGLE_TASK_KEY, taskId, SINGLE_BOARD_KEY],
    queryFn: () => getBoardByTaskId(taskId),
  })
}

const useCreateTask = () => {
  return useMutation({
    mutationFn: (task: CreateTask) => createTask(task),
  })
}

const useEditTask = (taskId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (task: EditTask) => editTask(taskId, task),
    onSuccess: (data) => {
      queryClient.setQueryData([SINGLE_TASK_KEY, taskId], data)
    },
  })
}

const useDeleteTask = () => {
  return useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
  })
}

export {
  useGetTask,
  useGetBoardByTask,
  useCreateTask,
  useEditTask,
  useDeleteTask,
}
