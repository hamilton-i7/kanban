import { useMutation, useQuery } from '@tanstack/react-query'
import { SINGLE_BOARD_KEY, SINGLE_TASK_KEY } from '../constants'
import { createTask, getBoardByTaskId, getTask } from '../api/task_api'
import { CreateTask } from '../models'

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

export { useGetTask, useGetBoardByTask, useCreateTask }
