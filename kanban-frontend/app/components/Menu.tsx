import { Menu as MuiMenu } from '@mui/material'
import { styled } from '@mui/material/styles'

const Menu = styled(MuiMenu)(({ theme }) => ({
  minWidth: theme.spacing(48),
  '& .MuiPaper-root': {
    backgroundColor: theme.palette.common.white,
    minWidth: theme.spacing(48),
    borderRadius: theme.spacing(2),
  },
}))

export default Menu
