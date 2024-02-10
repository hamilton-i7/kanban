import React from 'react'
import BaseButton, { BaseButtonProps } from './BaseButton'
import { alpha } from '@mui/material'

type TonalButtonProps = BaseButtonProps

export default function TonalButton({
  label,
  onClick,
  ...props
}: TonalButtonProps) {
  return (
    <BaseButton
      label={label}
      variant="contained"
      onClick={onClick}
      sx={{
        color: 'primary.main',
        '&.MuiButtonBase-root': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
        },
      }}
      {...props}
    />
  )
}
