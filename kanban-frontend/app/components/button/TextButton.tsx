import { ButtonProps } from '@mui/material'
import BaseButton from './BaseButton'

export default function TextButton({ children, ...props }: ButtonProps) {
  return (
    <BaseButton variant="text" {...props}>
      {children}
    </BaseButton>
  )
}
