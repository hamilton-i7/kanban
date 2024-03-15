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
import {
  useEditTask,
  useGetBoardByTask,
  useGetTask,
} from '@/app/lib/hooks/task_hooks'
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
import { EditTask, Subtask } from '@/app/lib/models'
import { createPortal } from 'react-dom'
import { SINGLE_BOARD_KEY, SUBTASK_TYPE } from '@/app/lib/constants'
import { useQueryClient } from '@tanstack/react-query'
import DeleteTaskDialog from './DeleteTaskDialog'

export default function TaskDetailDialog() {
  const params = useParams<{ taskId: string }>()
  const TASK_DETAIL_PATHNAME = `/dashboard/tasks/${params.taskId}`
  const pathname = usePathname()
  const router = useRouter()

  const queryClient = useQueryClient()
  const {
    isPending: isTaskPending,
    isError: isTaskError,
    error: taskError,
    data: task,
  } = useGetTask(+params.taskId)

  const {
    data: board,
    isPending: isBoardPending,
    isError: isBoardError,
  } = useGetBoardByTask(+params.taskId)
  const { mutate: editTask } = useEditTask(+params.taskId)

  const {
    isPending: isColumnsPending,
    isError: isColumnsError,
    error: columnsError,
    data: columns,
  } = useGetRelatedColumns(task?.column)

  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [activeSubtask, setActiveSubtask] = useState<Subtask | null>(null)
  const completedSubtasks = subtasks.filter(({ status }) => status).length
  const totalSubtasks = subtasks.length

  const [selectedColumnId, setSelectedColumnId] = useState('')

  const [openDialog, setOpenDialog] = useState(true)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const openOptionsMenu = Boolean(anchorEl)
  const [openDeleteTaskDialog, setOpenDeleteTaskDialog] = useState(false)

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

  const handleSubtaskChange = (subtaskId: number) => {
    setSubtasks((subs) => {
      const subtaskToUpdateIndex = subs.findIndex(({ id }) => id === subtaskId)
      const subtaskToUpdate = subs[subtaskToUpdateIndex]
      return subs.toSpliced(subtaskToUpdateIndex, 1, {
        ...subtaskToUpdate,
        status: !subtaskToUpdate.status,
      })
    })
  }

  const handleColumnChange = (columnId: string) => {
    setSelectedColumnId(columnId)
  }

  const handleOpenDeleteTaskDialog = () => {
    setOpenDeleteTaskDialog(true)
    setOpenDialog(false)
  }

  const handleCloseDeleteTaskDialog = () => {
    setOpenDeleteTaskDialog(false)
    router.push(`/dashboard/boards/${board!.id}`)
  }

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
    const updatedTask: EditTask = {
      column: +selectedColumnId,
      subtasks: subtasks.map(({ id, status }) => ({ id, status })),
    }
    editTask(updatedTask, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [SINGLE_BOARD_KEY, board!.id],
        })
      },
      onError: (error) => {
        console.error(error)
      },
    })

    router.push(`/dashboard/boards/${board!.id}`)
  }

  useEffect(() => {
    if (!task) return
    if (pathname !== TASK_DETAIL_PATHNAME) return

    // Reset states
    setOpenDialog(true)
    setSubtasks(task.subtasks)
    setSelectedColumnId(task.column.toString())
    setAnchorEl(null)
  }, [task, pathname, TASK_DETAIL_PATHNAME])

  if (pathname !== TASK_DETAIL_PATHNAME) {
    return null
  }

  if (isTaskPending || isColumnsPending || isBoardPending) {
    return <div>Loading...</div>
  }

  if (isTaskError || isColumnsError || isBoardError) {
    return (
      <>
        {taskError && <div>Error: {taskError.message}</div>}
        {columnsError && <div>Error: {columnsError.message}</div>}
      </>
    )
  }

  if (openDeleteTaskDialog) {
    return (
      <DeleteTaskDialog
        open
        onClose={handleCloseDeleteTaskDialog}
        task={task}
        boardId={board.id}
      />
    )
  }

  return (
    <Dialog open={openDialog} onClose={handleDialogClose}>
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
            boardId={board.id}
            taskId={task.id}
            onClose={handleCloseOptionsMenu}
            onEditTaskClick={handleCloseOptionsMenu}
            onDeleteTaskClick={handleOpenDeleteTaskDialog}
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
          {subtasks.length > 0 && (
            <>
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
                    <SortableSubtaskItem
                      key={subtask.id}
                      subtask={subtask}
                      onStatusChange={handleSubtaskChange}
                    />
                  ))}
                </SortableContext>
              </MenuList>
            </>
          )}
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
            value={selectedColumnId}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleColumnChange(event.target.value)
            }
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
