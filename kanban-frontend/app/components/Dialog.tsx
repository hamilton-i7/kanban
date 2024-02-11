import { Dialog as MuiDialog } from '@mui/material'
import { styled } from '@mui/material/styles'

const Dialog = styled(MuiDialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: '100%',
    maxWidth: theme.spacing(120),
    borderRadius: theme.spacing(1.5),
    bgcolor: 'common.white',
    m: theme.spacing(4),
  },
  '& .MuiDialogContent-root': {
    p: theme.spacing(0, 6),
  },
  '& .MuiDialogActions-root': {
    flexDirection: 'column',
    p: theme.spacing(6),
    gap: theme.spacing(4),
    '& > .MuiButtonBase-root': { ml: 0 },
  },
}))

export default Dialog
