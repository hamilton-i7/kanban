import React from 'react'
import { MenuItem, ListItemText, Typography, MenuProps } from '@mui/material'
import Menu from '@/app/components/Menu'

type TaskMenuProps = MenuProps & {
  onEditTaskClick?: () => void
  onDeleteTaskClick?: () => void
}

export default function TaskMenu({
  anchorEl,
  open,
  onClose,
  onEditTaskClick,
  onDeleteTaskClick,
  ...props
}: TaskMenuProps) {
  return (
    <Menu
      id="task-menu"
      anchorEl={anchorEl}
      open={open}
      MenuListProps={{
        component: 'menu',
      }}
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
      <MenuItem onClick={onEditTaskClick}>
        <ListItemText
          disableTypography
          sx={{ typography: 'body-l', color: 'grey.500' }}
        >
          Edit task
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={onDeleteTaskClick}>
        <ListItemText
          disableTypography
          sx={{
            typography: 'body-l',
            color: 'error.main',
          }}
        >
          Delete task
        </ListItemText>
      </MenuItem>
    </Menu>
  )
}
