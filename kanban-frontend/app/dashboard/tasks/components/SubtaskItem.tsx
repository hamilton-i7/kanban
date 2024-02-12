import React from 'react'
import {
  CardActionArea,
  CardContent,
  Checkbox,
  MenuItem,
  Typography,
  alpha,
} from '@mui/material'
import { Subtask } from '@/app/lib/models'

type SubtaskItemProps = {
  subtask: Subtask
  onStatusChange?: () => void
}

export default function SubtaskItem({
  subtask,
  onStatusChange,
}: SubtaskItemProps) {
  return (
    <MenuItem
      disableGutters
      onClick={onStatusChange}
      sx={{
        borderRadius: (theme) => theme.spacing(1),
        width: '100%',
        bgcolor: 'background.default',
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.25),
        },
      }}
    >
      <Checkbox
        checked={subtask.status}
        onClick={(e) => e.stopPropagation()}
        onChange={onStatusChange}
        disableRipple
        inputProps={{
          'aria-label': subtask.status
            ? 'Mark as incomplete'
            : 'Mark as completed',
        }}
      />
      <Typography
        component="h4"
        variant="body-m"
        sx={{
          color: 'common.black',
          ...(subtask.status && {
            color: (theme) => alpha(theme.palette.common.black, 0.5),
            textDecoration: 'line-through',
          }),
        }}
      >
        {subtask.title}
      </Typography>
    </MenuItem>
  )
}
