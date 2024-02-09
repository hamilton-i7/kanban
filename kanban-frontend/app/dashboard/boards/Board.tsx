'use client'

import React from 'react'
import EmptyBoard from './EmptyBoard'
import TaskCard from '@/app/dashboard/tasks/TaskCard'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { useGetBoard } from '@/app/lib/hooks/board'
import { useParams } from 'next/navigation'
import { Add } from '@mui/icons-material'

export default function Board() {
  const params = useParams<{ id: string }>()
  const { isPending, isError, error, data: board } = useGetBoard(+params.id)

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
            <Box
              key={column.id}
              sx={{ minWidth: (theme) => theme.spacing(70) }}
            >
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
          <Card
            elevation={0}
            sx={{
              minWidth: (theme) => theme.spacing(70),
              background: (theme) =>
                `linear-gradient(to bottom, ${theme.palette.grey[300]}, ${alpha(theme.palette.grey[300], 0.5)})`,
              borderRadius: (theme) => theme.spacing(1.5),
              '&.MuiPaper-root': {
                mt: (theme) => theme.spacing(9.75),
              },
            }}
          >
            <CardActionArea
              sx={{
                height: '100%',
                color: 'grey.500',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Add />
                <Typography
                  variant="heading-xl"
                  component="h2"
                  sx={{ textTransform: 'capitalize' }}
                >
                  New column
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Stack>
      )}
    </Box>
  )
}
