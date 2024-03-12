import FilledButton from '@/app/components/button/FilledButton'
import { Add } from '@mui/icons-material'
import { Stack, Typography, Button } from '@mui/material'
import React from 'react'

export default function EmptyBoard() {
  return (
    <Stack
      component="main"
      spacing={6}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flex: 1,
        px: (theme) => theme.spacing(4),
      }}
    >
      <Typography paragraph align="center" variant="heading-l" color="grey.500">
        This board is empty. Create a new column to get started.
      </Typography>
      <FilledButton startIcon={<Add />}>Add new column</FilledButton>
    </Stack>
  )
}
