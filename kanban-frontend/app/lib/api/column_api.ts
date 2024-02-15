import { ColumnPreview } from '../models'
import axiosInstance from './axiosInstance'

export const getRelatedColumnsById = async (columnId: number) => {
  const response = await axiosInstance.get<ColumnPreview[]>(
    `/tasks/columns/${columnId}/`
  )
  return response.data
}
