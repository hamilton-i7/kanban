import React from 'react'
import BaseButton, { BaseButtonProps } from './BaseButton'

type FilledButtonProps = BaseButtonProps

export default function FilledButton({
  label,
  onClick,
  ...props
}: FilledButtonProps) {
  return (
    <BaseButton
      label={label}
      variant="contained"
      onClick={onClick}
      {...props}
    />
  )
}
