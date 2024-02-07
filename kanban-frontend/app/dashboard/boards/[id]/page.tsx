'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import detailedBoards from '../../../lib/detailed_boards.json'
import TaskCard from '@/app/ui/TaskCard'
import { Box, Button, Stack, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'

export default function Page() {
  const params = useParams<{ id: string }>()
  const board = detailedBoards.find((board) => board.id === +params.id)

  return (
    <Box
      sx={{
        height: 'calc(100vh - var(--top-bar-height))',
        bgcolor: 'background.default',
        px: (theme) => theme.spacing(4),
      }}
    >
      {board!.columns.length === 0 && EmptyContent()}
      {board!.columns.length > 0 && (
        <Stack
          direction="row"
          component="main"
          spacing={6}
          sx={{
            py: (theme) => theme.spacing(6),
            overflowX: 'scroll',
            height: '100%',
          }}
        >
          {board!.columns.map((column) => (
            <Box key={column.id}>
              <Typography
                component="h2"
                variant="heading-s"
                color="grey.500"
                sx={{
                  textTransform: 'uppercase',
                  mb: (theme) => theme.spacing(6),
                }}
              >
                {column.name} ({column.tasks.length})
              </Typography>
              <Stack spacing={5}>
                {column.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    totalSubtasks={task.subtasks.length}
                    completedSubtasks={
                      task.subtasks.filter((subtask) => subtask.status).length
                    }
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}

function EmptyContent() {
  return (
    <Stack
      component="main"
      spacing={6}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <Typography paragraph align="center" variant="heading-l" color="grey.500">
        This board is empty. Create a new column to get started.
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        sx={{
          textTransform: 'capitalize',
          borderRadius: (theme) => theme.spacing(6),
          height: (theme) => theme.spacing(12),
        }}
      >
        Add new column
      </Button>
    </Stack>
  )
}
