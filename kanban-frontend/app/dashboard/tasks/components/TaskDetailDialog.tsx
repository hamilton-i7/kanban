'use client'

import React, { useEffect, useState } from 'react'
import Dialog from '@/app/components/Dialog'
import {
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  IconButton,
  Box,
  MenuItem,
  MenuList,
} from '@mui/material'
import { MoreVert } from '@mui/icons-material'
import SortableSubtaskItem, {
  SubtaskItem,
  SubtaskItemWrapper,
} from './SubtaskItem'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useGetBoardByTask, useGetTask } from '@/app/lib/hooks/task_hooks'
import { useGetRelatedColumns } from '@/app/lib/hooks/column_hooks'
import TaskMenu from './TaskMenu'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Subtask } from '@/app/lib/models'
import { createPortal } from 'react-dom'
import { SUBTASK_TYPE } from '@/app/lib/constants'

export default function TaskDetailDialog() {
  const params = useParams<{ taskId: string }>()
  const TASK_DETAIL_PATHNAME = `/dashboard/tasks/${params.taskId}`
  const pathname = usePathname()
  const router = useRouter()
  const {
    isPending: isTaskPending,
    isError: isTaskError,
    error: taskError,
    data: task,
  } = useGetTask(+params.taskId)

  const { data: board } = useGetBoardByTask(+params.taskId)

  const boardId = board?.id
  const columnId = task?.column

  const {
    isPending: isColumnsPending,
    isError: isColumnsError,
    error: columnsError,
    data: columns,
  } = useGetRelatedColumns(columnId)

  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [activeSubtask, setActiveSubtask] = useState<Subtask | null>(null)
  const completedSubtasks = subtasks.map((subtask) => subtask.status).length
  const totalSubtasks = subtasks.length

  const [selectedColumn] = useState(columnId)

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const openOptionsMenu = Boolean(anchorEl)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type !== SUBTASK_TYPE) return
    setActiveSubtask(active.data.current.subtask)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSubtask(null)

    const { active, over } = event
    if (!over) return
    if (active.id === over.id) return
    if (active.data.current?.type !== SUBTASK_TYPE) return

    setSubtasks((subtasks) => {
      const activeSubtaskIndex = subtasks.findIndex(
        ({ id }) => id.toString() === active.id
      )
      const overSubtaskIndex = subtasks.findIndex(
        ({ id }) => id.toString() === over.id
      )
      return arrayMove(subtasks, activeSubtaskIndex, overSubtaskIndex)
    })
  }

  const handleDragCancel = () => {
    setActiveSubtask(null)
  }

  const handleOptionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseOptionsMenu = () => {
    setAnchorEl(null)
  }

  const handleDialogClose = () => {
    router.push(`/dashboard/boards/${boardId}`)
  }

  useEffect(() => {
    if (!task) return
    setSubtasks(task.subtasks)
  }, [task])

  useEffect(() => {
    if (pathname === TASK_DETAIL_PATHNAME) {
      // Reset states
    }
  }, [pathname, TASK_DETAIL_PATHNAME])

  if (pathname !== TASK_DETAIL_PATHNAME) {
    return null
  }

  if (isTaskPending || isColumnsPending) {
    return <div>Loading...</div>
  }

  if (isTaskError || isColumnsError) {
    return (
      <>
        {taskError && <div>Error: {taskError.message}</div>}
        {columnsError && <div>Error: {columnsError.message}</div>}
      </>
    )
  }

  return (
    <Dialog open onClose={handleDialogClose}>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Box
          sx={{
            display: 'flex',
            gap: (theme) => theme.spacing(3),
            p: (theme) => theme.spacing(4, 6),
            pr: (theme) => theme.spacing(2),
            alignItems: 'baseline',
          }}
        >
          <DialogTitle
            variant="heading-l"
            component="h2"
            color="common.black"
            sx={{ p: 0, flex: 1 }}
          >
            {task.title}
          </DialogTitle>
          <IconButton
            id="task-menu-button"
            aria-haspopup="true"
            aria-controls={openOptionsMenu ? 'task-menu' : undefined}
            aria-expanded={openOptionsMenu ? 'true' : undefined}
            aria-label="More options"
            size="small"
            onClick={handleOptionsClick}
          >
            <MoreVert sx={{ color: (theme) => theme.palette.grey[500] }} />
          </IconButton>
          <TaskMenu
            anchorEl={anchorEl}
            open={openOptionsMenu}
            onClose={handleCloseOptionsMenu}
            MenuListProps={{
              'aria-labelledby': 'task-menu-button',
            }}
          />
        </Box>
        <DialogContent
          sx={{
            '&.MuiDialogContent-root': { pb: (theme) => theme.spacing(8) },
          }}
        >
          {task.description && (
            <Typography
              paragraph
              variant="body-l"
              color="grey.500"
              sx={{ mb: (theme) => theme.spacing(6) }}
            >
              {task.description}
            </Typography>
          )}
          {/* TODO: Conditionally render subtasks */}
          <Typography
            variant="body-m"
            component="h3"
            color="grey.500"
            sx={{ mb: (theme) => theme.spacing(4) }}
          >
            Subtasks ({completedSubtasks} of {totalSubtasks})
          </Typography>
          <MenuList
            sx={{
              mb: (theme) => theme.spacing(6),
              gap: (theme) => theme.spacing(2),
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SortableContext
              items={subtasks.map(({ id }) => id.toString())}
              strategy={verticalListSortingStrategy}
            >
              {subtasks.map((subtask) => (
                <SortableSubtaskItem key={subtask.id} subtask={subtask} />
              ))}
            </SortableContext>
          </MenuList>
          <Typography
            variant="body-m"
            component="label"
            htmlFor="task-column"
            display="block"
            color="grey.500"
            sx={{
              mb: (theme) => theme.spacing(2),
              textTransform: 'capitalize',
            }}
          >
            Current column
          </Typography>
          <TextField
            id="task-column"
            variant="outlined"
            size="small"
            fullWidth
            select
            value={selectedColumn ?? ''}
            InputProps={{
              sx: { typography: 'body-l', color: 'common.black' },
            }}
          >
            {columns.map((column) => (
              <MenuItem key={column.id} value={column.id}>
                {column.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        {createPortal(
          <DragOverlay>
            {activeSubtask ? (
              <SubtaskItemWrapper>
                <SubtaskItem subtask={activeSubtask} />
              </SubtaskItemWrapper>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </Dialog>
  )
}
