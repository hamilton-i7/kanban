import { useQuery } from '@tanstack/react-query'
import { COLUMNS_KEY } from '../constants'
import { getRelatedColumnsById } from '../api/column_api'

const useGetRelatedColumns = (columnId: number | undefined) => {
  return useQuery({
    queryKey: [COLUMNS_KEY, columnId],
    queryFn: () => {
      if (!columnId) return []
      return getRelatedColumnsById(columnId)
    },
    enabled: !!columnId,
  })
}

export { useGetRelatedColumns }
