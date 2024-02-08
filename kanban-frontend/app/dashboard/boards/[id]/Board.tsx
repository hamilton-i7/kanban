'use client'

import React from 'react'
import EmptyBoard from './EmptyBoard'
import TaskCard from '@/app/ui/TaskCard'
import { Box, Stack, Typography } from '@mui/material'
import { useBoard } from '@/app/lib/hooks/board'
import { useParams } from 'next/navigation'

export default function Board() {
  const params = useParams<{ id: string }>()
  const { isPending, isError, error, data: board } = useBoard(+params.id)

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - var(--top-bar-height))',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {board.columns.length === 0 && <EmptyBoard />}
      {board.columns.length > 0 && (
        <Stack
          direction="row"
          component="main"
          spacing={6}
          sx={{
            p: (theme) => theme.spacing(6, 4),
            overflowX: 'scroll',
            flex: 1,
          }}
        >
          {board.columns.map((column) => (
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
