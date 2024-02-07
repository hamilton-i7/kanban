import {
  ListItemText,
  Menu,
  MenuItem,
  MenuProps,
  Typography,
} from '@mui/material'
import React from 'react'

type BoardMenuProps = MenuProps & {
  onEditBoardClick?: () => void
  onDeleteBoardClick?: () => void
}

export default function BoardMenu({
  anchorEl,
  open,
  onClose,
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
      <MenuItem onClick={onEditBoardClick}>
        <ListItemText disableTypography>
          <Typography variant="body-l">Edit board</Typography>
        </ListItemText>
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
