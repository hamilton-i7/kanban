import { useQuery } from '@tanstack/react-query'
import { SINGLE_TASK_KEY } from '../constants'
import { getTask } from '../api/task_api'

const useGetTask = (taskId: number) => {
  return useQuery({
    queryKey: [SINGLE_TASK_KEY, taskId],
    queryFn: () => getTask(taskId),
  })
}

export { useGetTask }
