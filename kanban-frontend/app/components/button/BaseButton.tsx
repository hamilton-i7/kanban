import { Button, styled } from '@mui/material'

const BaseButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(5),
  typography: 'body-l',
  textTransform: 'capitalize',
  fontWeight: 'bold',
  height: theme.spacing(10),
}))

export default BaseButton
