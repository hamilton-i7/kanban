import React from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material'
import BoardIcon from './BoardIcon'
import { useBoards } from '../lib/hooks/board'

type SelectBoardDialogProps = {
  open: boolean
  onClose: () => void
  onCreateBoard?: () => void
  selectedBoard: number
}

export default function SelectBoardDialog({
  open,
  onClose,
  onCreateBoard,
  selectedBoard,
}: SelectBoardDialogProps) {
  const { isPending, isError, error, data: boards } = useBoards()

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <Dialog
      onClose={onClose}
      open={open}
      sx={{
        '& .MuiPaper-root': {
          width: (theme) => theme.spacing(66),
          borderRadius: (theme) => theme.spacing(2),
          bgcolor: 'common.white',
        },
      }}
    >
      <DialogTitle
        variant="heading-s"
        sx={{ textTransform: 'uppercase', color: 'grey.500' }}
      >
        All boards ({boards.length})
      </DialogTitle>
      <List>
        {boards.map((board) => (
          <ListItem
            key={board.id}
            disablePadding
            sx={{ height: (theme) => theme.spacing(12) }}
          >
            <ListItemButton
              href={`/dashboard/boards/${board.id}`}
              onClick={onClose}
              LinkComponent={Link}
              sx={{
                p: (theme) => theme.spacing(0, 6),
                mr: (theme) => theme.spacing(6),
                height: '100%',
                borderTopRightRadius: (theme) => theme.spacing(25),
                borderBottomRightRadius: (theme) => theme.spacing(25),
                color: 'grey.500',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                },
                '& .MuiTouchRipple-root span': {
                  bgcolor: 'primary.light',
                },
                ...(selectedBoard === board.id && {
                  bgcolor: 'primary.main',
                  color: 'common.white',
                  '&.Mui-focusVisible': {
                    bgcolor: 'primary.light',
                  },
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'common.white',
                  },
                  '& .MuiTouchRipple-root span': {
                    bgcolor: 'primary.dark',
                  },
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 'unset',
                  mr: (theme) => theme.spacing(3),
                  color: 'inherit',
                }}
              >
                <BoardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={board.name}
                primaryTypographyProps={{
                  variant: 'heading-m',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding sx={{ height: (theme) => theme.spacing(12) }}>
          <ListItemButton
            autoFocus
            onClick={onCreateBoard}
            sx={{
              p: (theme) => theme.spacing(0, 6),
              mr: (theme) => theme.spacing(6),
              height: '100%',
              borderTopRightRadius: (theme) => theme.spacing(25),
              borderBottomRightRadius: (theme) => theme.spacing(25),
              color: 'primary.main',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              },
              '& .MuiTouchRipple-root span': {
                bgcolor: 'primary.light',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 'unset',
                mr: (theme) => theme.spacing(3),
                color: 'inherit',
              }}
            >
              <BoardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Create new board"
              primaryTypographyProps={{
                variant: 'heading-m',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Dialog>
  )
}
