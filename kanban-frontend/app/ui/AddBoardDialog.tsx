import React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material'
import { Close } from '@mui/icons-material'

type AddBoardDialogProps = {
  open: boolean
  onClose: () => void
}

export default function AddBoardDialog({ open, onClose }: AddBoardDialogProps) {
  return (
    <Dialog
      onClose={onClose}
      open={open}
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
          InputProps={{
            sx: { typography: 'body-l', color: 'common.black' },
          }}
        />

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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField variant="outlined" size="small" fullWidth />
            <IconButton
              aria-label="Delete column"
              sx={{ ml: (theme) => theme.spacing(1) }}
            >
              <Close sx={{ color: 'grey.500' }} />
            </IconButton>
          </Box>
        </Stack>
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
          sx={{
            borderRadius: (theme) => theme.spacing(5),
            typography: 'body-l',
            textTransform: 'capitalize',
            fontWeight: 'bold',
            height: (theme) => theme.spacing(10),
          }}
        >
          Create new board
        </Button>
      </DialogActions>
    </Dialog>
  )
}
