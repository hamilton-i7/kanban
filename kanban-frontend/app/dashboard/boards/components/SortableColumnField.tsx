import React from 'react'
import { DragHandle, Close } from '@mui/icons-material'
import { IconButton, TextField, styled } from '@mui/material'
import { Box } from '@mui/system'
import { COLUMN_FIELD_TYPE } from '@/app/lib/constants'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Column } from '@/app/lib/models'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

export const ColumnFieldWrapper = styled(Box)(() => ({
  '&.MuiBox-root': {
    display: 'flex',
    alignItems: 'center',
  },
}))

type ColumnFieldProps = {
  column: Pick<Column, 'id' | 'name'>
  onNameChange?: (columnId: number, name: string) => void
  onColumnDelete?: (columnId: number) => void
  setActivatorNodeRef?: (element: HTMLElement | null) => void
  listeners?: SyntheticListenerMap
}

export function ColumnField({
  column,
  onNameChange = () => {},
  onColumnDelete = () => {},
  setActivatorNodeRef,
  listeners,
}: ColumnFieldProps) {
  return (
    <>
      <IconButton
        aria-label="Sort column"
        ref={setActivatorNodeRef}
        {...listeners}
        sx={{ mr: (theme) => theme.spacing(1), cursor: 'grab' }}
      >
        <DragHandle sx={{ color: 'grey.500' }} />
      </IconButton>
      <TextField
        variant="outlined"
        size="small"
        fullWidth
        value={column.name}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onNameChange(column.id, event.target.value)
        }
        InputProps={{
          sx: { typography: 'body-l', color: 'common.black' },
        }}
      />
      <IconButton
        aria-label="Delete column"
        onClick={() => onColumnDelete(column.id)}
        sx={{ ml: (theme) => theme.spacing(1) }}
      >
        <Close sx={{ color: 'grey.500' }} />
      </IconButton>
    </>
  )
}

type SortableColumnFieldProps = ColumnFieldProps

export default function SortableColumnField({
  column,
  onNameChange,
  onColumnDelete,
}: SortableColumnFieldProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({
    id: column.id.toString(),
    data: {
      type: COLUMN_FIELD_TYPE,
      column,
    },
  })
  return (
    <ColumnFieldWrapper
      sx={{
        touchAction: 'manipulation',
        transition,
        transform: CSS.Transform.toString(transform),
      }}
      ref={setNodeRef}
      {...attributes}
    >
      <ColumnField
        column={column}
        onNameChange={onNameChange}
        onColumnDelete={onColumnDelete}
        setActivatorNodeRef={setActivatorNodeRef}
        listeners={listeners}
      />
    </ColumnFieldWrapper>
  )
}
