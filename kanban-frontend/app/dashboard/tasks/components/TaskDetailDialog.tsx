'use client'

import React, { useState } from 'react'
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
import SubtaskItem from './SubtaskItem'
import { useParams, useRouter } from 'next/navigation'
import { useGetTask } from '@/app/lib/hooks/task_hooks'
import { useGetRelatedColumns } from '@/app/lib/hooks/column_hooks'
import TaskMenu from './TaskMenu'

export default function TaskDetailDialog() {
  const router = useRouter()
  const params = useParams<{ taskId: string }>()
  const {
    isPending: isTaskPending,
    isError: isTaskError,
    error: taskError,
    data: task,
  } = useGetTask(+params.taskId)
  const columnId = task?.column

  const {
    isPending: isColumnsPending,
    isError: isColumnsError,
    error: columnsError,
    data: columns,
  } = useGetRelatedColumns(columnId)

  const completedSubtasks =
    task?.subtasks.map((subtask) => subtask.status).length ?? 0
  const totalSubtasks = task?.subtasks.length ?? 0

  const [selectedColumn, setSelectedColumn] = useState(columnId)

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const openOptionsMenu = Boolean(anchorEl)

  const handleOptionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseOptionsMenu = () => {
    setAnchorEl(null)
  }

  const handleDialogClose = () => {
    router.back()
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
        sx={{ '&.MuiDialogContent-root': { pb: (theme) => theme.spacing(8) } }}
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
        <Typography
          variant="body-m"
          component="h3"
          color="grey.500"
          sx={{ mb: (theme) => theme.spacing(4) }}
        >
          Subtasks ({completedSubtasks} of {totalSubtasks})
        </Typography>
        <MenuList sx={{ mb: (theme) => theme.spacing(6) }}>
          {task.subtasks.map((subtask) => (
            <SubtaskItem key={subtask.id} subtask={subtask} />
          ))}
        </MenuList>
        <Typography
          variant="body-m"
          component="label"
          htmlFor="task-column"
          display="block"
          color="grey.500"
          sx={{ mb: (theme) => theme.spacing(2), textTransform: 'capitalize' }}
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
    </Dialog>
  )
}
