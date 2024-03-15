import React from 'react'
import {
  MenuItem,
  ListItemText,
  Typography,
  MenuProps,
  ListItemButton,
} from '@mui/material'
import Menu from '@/app/components/Menu'
import Link from 'next/link'

type TaskMenuProps = MenuProps & {
  boardId: number
  taskId: number
  onEditTaskClick?: () => void
  onDeleteTaskClick?: () => void
}

export default function TaskMenu({
  anchorEl,
  open,
  boardId,
  taskId,
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
      <MenuItem onClick={onEditTaskClick} disableGutters>
        <ListItemButton
          LinkComponent={Link}
          href={`/dashboard/boards/${boardId}/tasks/${taskId}/edit`}
        >
          <ListItemText
            disableTypography
            sx={{ typography: 'body-l', color: 'grey.500' }}
          >
            Edit task
          </ListItemText>
        </ListItemButton>
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
