import React from 'react'
import { Button, ButtonProps } from '@mui/material'

export type BaseButtonProps = ButtonProps & {
  label: string
}

export default function BaseButton({
  label,
  variant,
  sx,
  ...props
}: BaseButtonProps) {
  return (
    <Button
      variant={variant}
      fullWidth
      disableElevation
      sx={{
        borderRadius: (theme) => theme.spacing(5),
        typography: 'body-l',
        textTransform: 'capitalize',
        fontWeight: 'bold',
        height: (theme) => theme.spacing(10),
        ...sx,
      }}
      {...props}
    >
      {label}
    </Button>
  )
}
