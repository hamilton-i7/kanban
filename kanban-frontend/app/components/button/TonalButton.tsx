import BaseButton from './BaseButton'
import { alpha, styled } from '@mui/material'

const TonalButton = styled(BaseButton)(({ theme }) => ({
  color: 'primary.main',
  '&.MuiButtonBase-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}))

export default TonalButton
