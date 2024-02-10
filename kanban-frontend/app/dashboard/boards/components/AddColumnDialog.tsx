import React, { useEffect, useState } from 'react'
import FilledButton from '@/app/components/button/FilledButton'
import TonalButton from '@/app/components/button/TonalButton'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  DialogActions,
} from '@mui/material'
import { DetailedBoard, EditBoard } from '@/app/lib/models'
import { useEditBoard } from '@/app/lib/hooks/board_hooks'

type AddColumnDialogProps = {
  open: boolean
  onClose: () => void
  board: DetailedBoard
}

export default function AddColumnDialog({
  open,
  onClose,
  board,
}: AddColumnDialogProps) {
  const { isPending, mutate: editBoard } = useEditBoard(board.id)
  const [columnName, setColumnName] = useState('')

  const handleColumnNameChange = (name: string) => {
    setColumnName(name)
  }

  const handleCreateColumn = () => {
    const updatedBoard: EditBoard = {
      columns: [
        // Only send the ID of existing columns because they're not being updated
        ...board.columns.map((column) => ({ id: column.id })),
        { name: columnName },
      ],
    }
    editBoard(updatedBoard, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  useEffect(() => {
    if (open) {
      // Reset state when opening the dialog
      setColumnName('')
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ component: 'form' }}
      sx={{
        '& .MuiPaper-root': {
          width: '100%',
          maxWidth: (theme) => theme.spacing(120),
          borderRadius: (theme) => theme.spacing(1.5),
          bgcolor: 'common.white',
          m: (theme) => theme.spacing(4),
        },
      }}
    >
      <DialogTitle
        variant="heading-l"
        component="h2"
        sx={{ textTransform: 'capitalize', color: 'common.black' }}
      >
        Add new column
      </DialogTitle>
      <DialogContent sx={{ p: (theme) => theme.spacing(0, 6) }}>
        <Typography
          variant="body-m"
          component="label"
          htmlFor="column-name-input"
          display="block"
          color="grey.500"
          sx={{ mb: (theme) => theme.spacing(2) }}
        >
          Column name
        </Typography>
        <TextField
          id="column-name-input"
          variant="outlined"
          size="small"
          fullWidth
          value={columnName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleColumnNameChange(event.target.value)
          }
          InputProps={{
            sx: { typography: 'body-l', color: 'common.black' },
          }}
        />
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: 'column',
          p: (theme) => theme.spacing(6),
          gap: (theme) => theme.spacing(4),
          '& > .MuiButtonBase-root': { ml: 0 },
        }}
      >
        <TonalButton label="Cancel" onClick={onClose} />
        <FilledButton label="Create" onClick={handleCreateColumn} />
      </DialogActions>
    </Dialog>
  )
}
