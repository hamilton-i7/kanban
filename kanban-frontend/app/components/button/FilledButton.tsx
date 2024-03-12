import React from 'react'
import BaseButton from './BaseButton'
import { ButtonProps } from '@mui/material'

export default function FilledButton({
  onClick,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton variant="contained" onClick={onClick} {...props}>
      {children}
    </BaseButton>
  )
}
