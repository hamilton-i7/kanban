import React from 'react'
import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { DetailedBoard } from '@/app/lib/models'
import TonalButton from '@/app/components/button/TonalButton'
import FilledButton from '@/app/components/button/FilledButton'
import { useDeleteBoard } from '@/app/lib/hooks/board_hooks'
import { useRouter } from 'next/navigation'
import Dialog from '@/app/components/Dialog'

type DeleteBoardDialogProps = {
  open: boolean
  onClose: () => void
  board: DetailedBoard
}

export default function DeleteBoardDialog({
  open,
  onClose,
  board,
}: DeleteBoardDialogProps) {
  const router = useRouter()
  const { isPending, mutate: deleteBoard } = useDeleteBoard()

  const handleDeleteBoard = () => {
    deleteBoard(board.id, {
      onSuccess: () => {
        onClose()
        router.push('/') // TODO: Add navigation to boards page
      },
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-board-dialog-title"
      aria-describedby="delete-board-dialog-description"
    >
      <DialogTitle
        id="delete-board-dialog-title"
        variant="heading-l"
        component="h2"
        color="error.main"
        sx={{ p: (theme) => theme.spacing(6) }}
      >
        Delete this board?
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="delete-board-dialog-description"
          color="grey.500"
          variant="body-l"
        >
          Are you sure you want to delete the &apos;{board.name}&apos; board?
          This action will remove all columns and tasks and cannot be reversed.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <FilledButton
          onClick={handleDeleteBoard}
          sx={{
            bgcolor: 'error.main',
          }}
        >
          Delete
        </FilledButton>
        <TonalButton autoFocus onClick={onClose}>
          Cancel
        </TonalButton>
      </DialogActions>
    </Dialog>
  )
}
