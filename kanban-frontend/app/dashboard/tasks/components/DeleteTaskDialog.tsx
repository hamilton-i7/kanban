import FilledButton from '@/app/components/button/FilledButton'
import TonalButton from '@/app/components/button/TonalButton'
import { SINGLE_BOARD_KEY } from '@/app/lib/constants'
import { useDeleteTask } from '@/app/lib/hooks/task_hooks'
import { Task } from '@/app/lib/models'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import React from 'react'

type DeleteTaskDialogProps = {
  open: boolean
  onClose: () => void
  task: Task
  boardId: number
}

export default function DeleteTaskDialog({
  open,
  onClose,
  task,
  boardId,
}: DeleteTaskDialogProps) {
  const queryClient = useQueryClient()
  const { mutate: deleteTask } = useDeleteTask()

  const handleDeleteTask = () => {
    deleteTask(task.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [SINGLE_BOARD_KEY, boardId] })
        onClose()
      },
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-task-dialog-title"
      aria-describedby="delete-task-dialog-description"
    >
      <DialogTitle
        id="delete-task-dialog-title"
        variant="heading-l"
        component="h2"
        color="error.main"
        sx={{ p: (theme) => theme.spacing(6) }}
      >
        Delete this task?
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="delete-task-dialog-description"
          color="grey.500"
          variant="body-l"
        >
          Are you sure you want to delete the &apos;{task.title}&apos; task and
          its subtasks? This action cannot be reversed.
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: (theme) => theme.spacing(4),
          p: (theme) => theme.spacing(0, 6, 6),
        }}
      >
        <FilledButton
          onClick={handleDeleteTask}
          fullWidth
          sx={{
            bgcolor: 'error.main',
          }}
        >
          Delete
        </FilledButton>
        <TonalButton autoFocus fullWidth onClick={onClose}>
          Cancel
        </TonalButton>
      </DialogActions>
    </Dialog>
  )
}
