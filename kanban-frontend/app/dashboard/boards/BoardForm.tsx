'use client'

import React, { useState } from 'react'
import { Close } from '@mui/icons-material'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  Stack,
  Box,
  IconButton,
  DialogActions,
  Button,
  alpha,
} from '@mui/material'

type BoardFormProps = {
  open: boolean
  onClose: () => void
  onConfirmClick: () => void
  variant: 'create' | 'edit'
}

export default function BoardForm({
  open,
  onClose,
  onConfirmClick,
  variant = 'create',
}: BoardFormProps) {
  const [boardName, setBoardName] = useState('')
  const [columns, setColumns] = useState<string[]>([])

  const handleBoardNameChange = (name: string) => {
    setBoardName(name)
  }

  const handleAddColumn = () => {
    setColumns((currentColumns) => [...currentColumns, ''])
  }

  const handleUpdateColumn = (index: number, column: string) => {
    const updatedColumns = [...columns]
    updatedColumns[index] = column
    setColumns(updatedColumns)
  }

  const handleDeleteColumn = (index: number) => {
    const updatedColumns = columns.filter((_, i) => i !== index)
    setColumns(updatedColumns)
  }

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
        Add new board
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
            handleBoardNameChange(event.target.value)
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
                      handleUpdateColumn(index, event.target.value)
                    }
                    InputProps={{
                      sx: { typography: 'body-l', color: 'common.black' },
                    }}
                  />
                  <IconButton
                    aria-label="Delete column"
                    onClick={() => handleDeleteColumn(index)}
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
          p: (theme) => theme.spacing(3, 6, 6),
          gap: (theme) => theme.spacing(6),
          '& > .MuiButtonBase-root': { ml: 0 },
        }}
      >
        <Button
          fullWidth
          disableElevation
          onClick={handleAddColumn}
          sx={{
            borderRadius: (theme) => theme.spacing(5),
            color: 'primary.main',
            typography: 'body-l',
            textTransform: 'capitalize',
            fontWeight: 'bold',
            height: (theme) => theme.spacing(10),
            '&.MuiButtonBase-root': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          Add new column
        </Button>
        <Button
          variant="contained"
          fullWidth
          disableElevation
          onClick={onConfirmClick}
          sx={{
            borderRadius: (theme) => theme.spacing(5),
            typography: 'body-l',
            textTransform: 'capitalize',
            fontWeight: 'bold',
            height: (theme) => theme.spacing(10),
          }}
        >
          {variant === 'create' ? 'Create new board' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
