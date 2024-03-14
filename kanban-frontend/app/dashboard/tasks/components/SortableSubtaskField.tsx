import React from 'react'
import { SUBTASK_FIELD_TYPE } from '@/app/lib/constants'
import { Subtask } from '@/app/lib/models'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { Close, DragHandle } from '@mui/icons-material'
import { Box, IconButton, TextField, styled } from '@mui/material'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'

export const SubtaskFieldWrapper = styled(Box)(() => ({
  '&.MuiBox-root': {
    display: 'flex',
    alignItems: 'center',
  },
}))

type SubtaskFieldProps = {
  subtask: Pick<Subtask, 'id' | 'title'>
  onTitleChange?: (subtaskId: number, title: string) => void
  onSubtaskDelete?: (subtaskId: number) => void
  setActivatorNodeRef?: (element: HTMLElement | null) => void
  listeners?: SyntheticListenerMap
}

export function SubtaskField({
  subtask,
  onTitleChange = () => {},
  onSubtaskDelete = () => {},
  setActivatorNodeRef,
  listeners,
}: SubtaskFieldProps) {
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
        value={subtask.title}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onTitleChange(subtask.id, event.target.value)
        }
        InputProps={{
          sx: { typography: 'body-l', color: 'common.black' },
        }}
      />
      <IconButton
        aria-label="Delete subtask"
        onClick={() => onSubtaskDelete(subtask.id)}
        sx={{ ml: (theme) => theme.spacing(1) }}
      >
        <Close sx={{ color: 'grey.500' }} />
      </IconButton>
    </>
  )
}

export default function SortableSubtaskField({
  subtask,
  onTitleChange,
  onSubtaskDelete,
}: SubtaskFieldProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({
    id: subtask.id.toString(),
    data: {
      type: SUBTASK_FIELD_TYPE,
      subtask,
    },
  })
  return (
    <SubtaskFieldWrapper
      sx={{
        touchAction: 'manipulation',
        transition,
        transform: CSS.Transform.toString(transform),
      }}
      ref={setNodeRef}
      {...attributes}
    >
      <SubtaskField
        subtask={subtask}
        onTitleChange={onTitleChange}
        onSubtaskDelete={onSubtaskDelete}
        setActivatorNodeRef={setActivatorNodeRef}
        listeners={listeners}
      />
    </SubtaskFieldWrapper>
  )
}
