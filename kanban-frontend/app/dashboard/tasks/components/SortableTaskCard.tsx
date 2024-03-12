import { TASK_TYPE } from '@/app/lib/constants'
import { TaskBoardContext } from '@/app/lib/models'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  styled,
} from '@mui/material'
import Link from 'next/link'
import React from 'react'

export const TaskCardWrapper = styled(Card)(({ theme }) => ({
  '&.MuiCard-root': {
    width: theme.spacing(70),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
  },
})) as typeof Card

type TaskCardProps = {
  task: TaskBoardContext
}

export function TaskCard({ task }: TaskCardProps) {
  const totalSubtasks = task.subtasks.length
  const completedSubtasks = task.subtasks.filter(({ status }) => status).length

  return (
    <>
      <CardActionArea href={`/dashboard/tasks/${task.id}`} LinkComponent={Link}>
        <CardContent sx={{ p: (theme) => theme.spacing(6, 4) }}>
          <Typography
            gutterBottom
            variant="heading-m"
            component="h3"
            color="common.black"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical',
            }}
          >
            {task.title}
          </Typography>
          <Typography variant="body-m" color="grey.500">
            {completedSubtasks} of {totalSubtasks} subtasks
          </Typography>
        </CardContent>
      </CardActionArea>
    </>
  )
}

export default function SortableTaskCard({ task }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id.toString(),
    data: {
      type: TASK_TYPE,
      task,
    },
  })

  if (isDragging) {
    return (
      <TaskCardWrapper
        ref={setNodeRef}
        sx={{
          opacity: 0.25,
          transition,
          transform: CSS.Transform.toString(transform),
        }}
      >
        <TaskCard task={task} />
      </TaskCardWrapper>
    )
  }

  return (
    <TaskCardWrapper
      component="article"
      elevation={1}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      sx={{
        touchAction: 'manipulation',
        transition,
        transform: CSS.Transform.toString(transform),
      }}
    >
      <TaskCard task={task} />
    </TaskCardWrapper>
  )
}
