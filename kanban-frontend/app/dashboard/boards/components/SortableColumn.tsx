import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BoxProps, Typography, styled } from '@mui/material'
import { Box, Stack } from '@mui/system'
import { ColumnBoardContext } from '@/app/lib/models'
import { COLUMN_TYPE } from '@/app/lib/constants'

type SortableColumnProps = {
  column: ColumnBoardContext
  children: React.ReactNode
}

type ColumnProps = SortableColumnProps

export const ColumnWrapper = styled(Box)(({ theme }) => ({
  '&.MuiBox-root': {
    minWidth: theme.spacing(70),
  },
}))

export function Column({ column, children }: ColumnProps) {
  const tasksAmount = column.tasks.length

  return (
    <>
      <Typography
        component="h2"
        variant="heading-s"
        color="grey.500"
        sx={{
          textTransform: 'uppercase',
          mb: (theme) => theme.spacing(6),
        }}
      >
        {column.name} ({tasksAmount})
      </Typography>
      <Stack spacing={5}>{children}</Stack>
    </>
  )
}

export default function SortableColumn({
  column,
  children,
}: SortableColumnProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id.toString(),
    data: {
      type: COLUMN_TYPE,
      column,
    },
  })

  if (isDragging) {
    return (
      <ColumnWrapper
        sx={{
          opacity: 0.25,
          transition,
          transform: CSS.Transform.toString(transform),
        }}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
      >
        <Column column={column}>{children}</Column>
      </ColumnWrapper>
    )
  }

  return (
    <ColumnWrapper
      sx={{
        touchAction: 'manipulation',
        transition,
        transform: CSS.Transform.toString(transform),
        cursor: 'grab',
      }}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <Column column={column}>{children}</Column>
    </ColumnWrapper>
  )
}
