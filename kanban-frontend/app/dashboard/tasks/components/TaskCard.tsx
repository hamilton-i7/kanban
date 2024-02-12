import { Card, CardActionArea, CardContent, Typography } from '@mui/material'
import Link from 'next/link'
import React from 'react'

type TaskCardProps = {
  id: number
  title: string
  totalSubtasks: number
  completedSubtasks: number
}

export default function TaskCard({
  id,
  title,
  totalSubtasks,
  completedSubtasks,
}: TaskCardProps) {
  return (
    <Card
      component="article"
      elevation={1}
      sx={{
        width: (theme) => theme.spacing(70),
        borderRadius: (theme) => theme.spacing(2),
        bgcolor: 'common.white',
      }}
    >
      <CardActionArea href={`/dashboard/tasks/${id}`} LinkComponent={Link}>
        <CardContent sx={{ p: (theme) => theme.spacing(6, 4) }}>
          <Typography
            gutterBottom
            variant="heading-m"
            component="h3"
            color="common.black"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </Typography>
          <Typography variant="body-m" color="grey.500">
            {completedSubtasks} of {totalSubtasks} subtasks
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
