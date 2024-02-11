import React from 'react'
import { Close } from '@mui/icons-material'
import {
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  Stack,
  Box,
  IconButton,
  DialogActions,
} from '@mui/material'
import FilledButton from '@/app/components/button/FilledButton'
import TonalButton from '@/app/components/button/TonalButton'
import Dialog from '@/app/components/Dialog'

type BoardFormProps = {
  open: boolean
  onClose: () => void
  boardName?: string
  onBoardNameChange?: (name: string) => void
  columns?: string[]
  onColumnUpdate?: (index: number, name: string) => void
  onColumnAdd?: () => void
  onColumnDelete?: (index: number) => void
  onConfirmClick?: () => void
  variant?: 'create' | 'edit'
}

export default function BoardForm({
  open,
  onClose,
  boardName = '',
  onBoardNameChange = () => {},
  columns = [],
  onColumnUpdate = () => {},
  onColumnAdd = () => {},
  onColumnDelete = () => {},
  onConfirmClick,
  variant = 'create',
}: BoardFormProps) {
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
        {variant === 'create' ? 'Add new board' : 'Edit board'}
      </DialogTitle>
      <DialogContent sx={{ p: (theme) => theme.spacing(0, 6) }}>
        <Typography
          variant="body-m"
          component="label"
          htmlFor="board-name-input"
          display="block"
          color="grey.500"
          sx={{ mb: (theme) => theme.spacing(2) }}
        >
          Board name
        </Typography>
        <TextField
          id="board-name-input"
          variant="outlined"
          placeholder="e.g. Web Design"
          size="small"
          fullWidth
          value={boardName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onBoardNameChange(event.target.value)
          }
          InputProps={{
            sx: { typography: 'body-l', color: 'common.black' },
          }}
        />

        {columns.length > 0 && (
          <>
            <Typography
              variant="body-m"
              component="label"
              display="block"
              color="grey.500"
              sx={{ m: (theme) => theme.spacing(6, 0, 2) }}
            >
              Board columns
            </Typography>
            <Stack spacing={3}>
              {columns.map((name, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      onColumnUpdate(index, event.target.value)
                    }
                    InputProps={{
                      sx: { typography: 'body-l', color: 'common.black' },
                    }}
                  />
                  <IconButton
                    aria-label="Delete column"
                    onClick={() => onColumnDelete(index)}
                    sx={{ ml: (theme) => theme.spacing(1) }}
                  >
                    <Close sx={{ color: 'grey.500' }} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: 'column',
          p: (theme) => theme.spacing(6),
          gap: (theme) => theme.spacing(4),
          '& > .MuiButtonBase-root': { ml: 0 },
        }}
      >
        <TonalButton label="Add new column" onClick={onColumnAdd} />
        <FilledButton
          label={variant === 'create' ? 'Create new board' : 'Save changes'}
          onClick={onConfirmClick}
        />
      </DialogActions>
    </Dialog>
  )
}
