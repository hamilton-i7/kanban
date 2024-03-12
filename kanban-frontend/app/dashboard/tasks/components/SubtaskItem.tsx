import React from 'react'
import {
  CardActionArea,
  CardContent,
  Checkbox,
  MenuItem,
  Typography,
  alpha,
  styled,
} from '@mui/material'
import { Subtask } from '@/app/lib/models'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SUBTASK_TYPE } from '@/app/lib/constants'

export const SubtaskItemWrapper = styled(MenuItem)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  width: '100%',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.25),
  },
})) as typeof MenuItem

type SubtaskItemProps = {
  subtask: Subtask
  onStatusChange?: () => void
}

export function SubtaskItem({ subtask, onStatusChange }: SubtaskItemProps) {
  return (
    <>
      <Checkbox
        checked={subtask.status}
        onClick={(e) => e.stopPropagation()}
        onChange={onStatusChange}
        disableRipple
        inputProps={{
          'aria-label': subtask.status
            ? 'Mark as incomplete'
            : 'Mark as completed',
        }}
      />
      <Typography
        component="h4"
        variant="body-m"
        sx={{
          color: 'common.black',
          ...(subtask.status && {
            color: (theme) => alpha(theme.palette.common.black, 0.5),
            textDecoration: 'line-through',
          }),
        }}
      >
        {subtask.title}
      </Typography>
    </>
  )
}

export default function SortableSubtaskItem({
  subtask,
  onStatusChange,
}: SubtaskItemProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: subtask.id.toString(),
    data: {
      type: SUBTASK_TYPE,
      subtask,
    },
  })

  if (isDragging) {
    return (
      <SubtaskItemWrapper
        disableGutters
        ref={setNodeRef}
        sx={{
          opacity: 0.25,
          transition,
          transform: CSS.Transform.toString(transform),
        }}
      >
        <SubtaskItem subtask={subtask} />
      </SubtaskItemWrapper>
    )
  }

  return (
    <SubtaskItemWrapper
      disableGutters
      onClick={onStatusChange}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      sx={{
        touchAction: 'manipulation',
        transition,
        transform: CSS.Transform.toString(transform),
      }}
    >
      <SubtaskItem subtask={subtask} onStatusChange={onStatusChange} />{' '}
    </SubtaskItemWrapper>
  )
}
