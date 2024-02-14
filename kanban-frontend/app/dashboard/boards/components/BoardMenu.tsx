import React from 'react'
import Menu from '@/app/components/Menu'
import {
  ListItemButton,
  ListItemText,
  MenuItem,
  MenuProps,
} from '@mui/material'
import Link from 'next/link'

type BoardMenuProps = MenuProps & {
  boardId: number
  onEditBoardClick?: () => void
  onDeleteBoardClick?: () => void
}

export default function BoardMenu({
  anchorEl,
  open,
  onClose,
  boardId,
  onEditBoardClick,
  onDeleteBoardClick,
  ...props
}: BoardMenuProps) {
  return (
    <Menu
      id="board-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      elevation={2}
      sx={{
        minWidth: (theme) => theme.spacing(48),
        '& .MuiPaper-root': {
          backgroundColor: 'common.white',
          minWidth: (theme) => theme.spacing(48),
          borderRadius: (theme) => theme.spacing(2),
        },
      }}
      {...props}
    >
      <MenuItem onClick={onEditBoardClick} disableGutters>
        <ListItemButton
          LinkComponent={Link}
          href={`/dashboard/boards/${boardId}/edit`}
        >
          <ListItemText
            disableTypography
            sx={{ typography: 'body-l', color: 'grey.500' }}
          >
            Edit board
          </ListItemText>
        </ListItemButton>
      </MenuItem>
      <MenuItem onClick={onDeleteBoardClick}>
        <ListItemText
          disableTypography
          sx={{
            typography: 'body-l',
            color: 'error.main',
          }}
        >
          Delete board
        </ListItemText>
      </MenuItem>
    </Menu>
  )
}
