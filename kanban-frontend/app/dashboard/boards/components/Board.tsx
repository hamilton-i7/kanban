'use client'

import React, { useEffect, useState } from 'react'
import EmptyBoard from './EmptyBoard'
import SortableTaskCard, {
  TaskCard,
  TaskCardWrapper,
} from '@/app/dashboard/tasks/components/SortableTaskCard'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { useGetBoard, useReorderColumns } from '@/app/lib/hooks/board_hooks'
import { useParams } from 'next/navigation'
import { Add } from '@mui/icons-material'
import BoardTopBar from './BoardTopBar'
import DeleteBoardDialog from './DeleteBoardDialog'
import AddColumnDialog from './AddColumnDialog'
import {
  DndContext,
  closestCorners,
  useDroppable,
  useSensors,
  useSensor,
  TouchSensor,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  MouseSensor,
  DragOverEvent,
  DragCancelEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableColumn, { Column, ColumnWrapper } from './SortableColumn'
import { ColumnBoardContext, TaskBoardContext } from '@/app/lib/models'
import { COLUMN_TYPE, TASK_TYPE } from '@/app/lib/constants'
import { createPortal } from 'react-dom'
import TextButton from '@/app/components/button/TextButton'

type BoardProps = {
  boardId?: number
}

export default function Board({ boardId }: BoardProps) {
  const params = useParams<{ boardId: string }>()
  const {
    isPending,
    isError,
    error,
    data: board,
  } = useGetBoard(boardId ?? +params.boardId)
  const { mutate: reorderColumns } = useReorderColumns(
    boardId ?? +params.boardId
  )
  const { setNodeRef } = useDroppable({ id: boardId ?? +params.boardId })
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const [openDeleteBoardDialog, setOpenDeleteBoardDialog] = useState(false)
  const [openAddColumnDialog, setOpenAddColumnDialog] = useState(false)
  const [activeColumn, setActiveColumn] = useState<ColumnBoardContext | null>(
    null
  )
  const [columns, setColumns] = useState<ColumnBoardContext[]>([])
  const [tempColumnId, setTempColumnId] = useState(0)

  const [activeTask, setActiveTask] = useState<TaskBoardContext | null>(null)
  const [tasks, setTasks] = useState<{ [key: string]: TaskBoardContext[] }>({})
  const [activeTaskInitialPos, setActiveTaskInitialPosition] = useState(-1)

  const handleOpenDeleteBoardDialog = () => {
    setOpenDeleteBoardDialog(true)
  }

  const handleCloseDeleteBoardDialog = () => {
    setOpenDeleteBoardDialog(false)
  }

  const handleOpenAddColumnDialog = () => {
    setOpenAddColumnDialog(true)
  }

  const handleCloseAddColumnDialog = () => {
    setOpenAddColumnDialog(false)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === COLUMN_TYPE) {
      setActiveColumn(active.data.current.column)
      return
    }

    if (active.data.current?.type === TASK_TYPE) {
      setActiveTask(active.data.current.task)
      setActiveTaskInitialPosition(
        tasks[active.data.current.task.column].findIndex(
          ({ id }) => id.toString() === active.id
        )
      )
      setTempColumnId(active.data.current.task.column)
      return
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return
    if (active.id === over.id) return
    if (active.data.current?.type !== TASK_TYPE) return

    if (over.data.current?.type === TASK_TYPE) {
      const activeTaskColumn = active.data.current?.task?.column
      const overTaskColumn = over.data.current?.task?.column

      if (activeTaskColumn === overTaskColumn) return

      setTasks((tasks) => {
        const overIndex = tasks[overTaskColumn].findIndex(
          ({ id }) => id.toString() === over.id
        )

        return {
          ...tasks,
          [activeTaskColumn]: tasks[activeTaskColumn].filter(
            (task) => task.id.toString() !== active.id
          ),
          [overTaskColumn]: [
            ...tasks[overTaskColumn].slice(0, overIndex),
            {
              ...active.data.current?.task,
              column: over.data.current?.task?.column,
            },
            ...tasks[overTaskColumn].slice(overIndex),
          ],
        }
      })
      return
    }
    if (over.data.current?.type !== COLUMN_TYPE) return

    // Dropping over an empty column
    setTasks((tasks) => ({
      ...tasks,
      [active.data.current?.task?.column]: tasks[
        active.data.current?.task?.column
      ].filter((task) => task.id.toString() !== active.id),
      [+over.id]: [
        {
          ...active.data.current?.task,
          column: +over.id,
        },
      ],
    }))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null)
    setActiveTask(null)
    setActiveTaskInitialPosition(-1)
    setTempColumnId(0)

    const { active, over } = event

    if (!over) return
    if (active.id === over.id) return
    if (
      active.data.current?.type === COLUMN_TYPE &&
      over.data.current?.type === COLUMN_TYPE
    ) {
      const activeColumnIndex = columns.findIndex(
        ({ id }) => id.toString() === active.id
      )
      const overColumnIndex = columns.findIndex(
        ({ id }) => id.toString() === over.id
      )
      const updatedColumns = arrayMove(
        columns,
        activeColumnIndex,
        overColumnIndex
      )

      setColumns(updatedColumns)
      reorderColumns(updatedColumns)
    }

    if (
      active.data.current?.type === TASK_TYPE &&
      over.data.current?.type === TASK_TYPE
    ) {
      const activeTaskColumn = active.data.current?.task?.column
      const overTaskColumn = over.data.current?.task?.column

      if (activeTaskColumn !== overTaskColumn) return

      setTasks((tasks) => {
        const activeIndex = tasks[activeTaskColumn].findIndex(
          ({ id }) => id.toString() === active.id
        )
        const overIndex = tasks[overTaskColumn].findIndex(
          ({ id }) => id.toString() === over.id
        )
        return {
          ...tasks,
          [overTaskColumn]: arrayMove(
            tasks[overTaskColumn],
            activeIndex,
            overIndex
          ),
        }
      })
    }
  }

  const handleDragCancel = (event: DragCancelEvent) => {
    const { active } = event
    setActiveColumn(null)
    setActiveTask(null)

    if (active.data.current?.type !== TASK_TYPE) return
    if (active.data.current.task.column === tempColumnId) return

    setTasks((tasks) => ({
      ...tasks,
      [tempColumnId]: [
        ...tasks[tempColumnId].slice(0, activeTaskInitialPos),
        {
          ...active.data.current?.task,
          column: tempColumnId,
        },
        ...tasks[tempColumnId].slice(activeTaskInitialPos),
      ],
      [active.data.current!.task.column]: tasks[
        active.data.current!.task.column
      ].filter((task) => task.id.toString() !== active.id),
    }))
    setTempColumnId(0)
    setActiveTaskInitialPosition(-1)
  }

  useEffect(() => {
    if (!board) return
    setColumns(board.columns)
    // setTasks(board.columns.flatMap(({ tasks }) => tasks))
    setTasks(
      board.columns.reduce(
        (acc, curr) => ({ ...acc, [curr.id]: curr.tasks }),
        {}
      )
    )
  }, [board])
  // TODO: Reduce amount of api calls when sorting columns
  // useEffect(() => {
  //   if (!board) return
  //   if (JSON.stringify(board.columns) === JSON.stringify(debouncedColumns))
  //     return
  //   if (!debouncedColumns.length) return

  //   reorderColumns(debouncedColumns)
  // }, [board, debouncedColumns, reorderColumns])

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <>
      <BoardTopBar
        boardId={boardId}
        onDeleteBoard={handleOpenDeleteBoardDialog}
      />
      <Box
        sx={{
          minHeight: 'calc(100vh - var(--top-bar-height))',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {columns.length === 0 && <EmptyBoard />}
        {columns.length > 0 && (
          <DndContext
            collisionDetection={closestCorners}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            onDragOver={handleDragOver}
          >
            <Stack
              direction="row"
              component="main"
              spacing={4}
              ref={setNodeRef}
              sx={{
                p: (theme) => theme.spacing(6, 4),
                overflowX: 'scroll',
                flex: 1,
                alignItems: 'flex-start',
              }}
            >
              <SortableContext
                items={columns.map(({ id }) => id.toString())}
                strategy={horizontalListSortingStrategy}
              >
                {columns.map((column) => (
                  <SortableColumn key={column.id} column={column}>
                    {tasks[column.id].length > 0 && (
                      <SortableContext
                        items={tasks[column.id].map(({ id }) => id.toString())}
                        strategy={verticalListSortingStrategy}
                      >
                        {tasks[column.id].map((task) => (
                          <SortableTaskCard key={task.id} task={task} />
                        ))}
                      </SortableContext>
                    )}
                    <TextButton
                      startIcon={<Add />}
                      sx={{
                        color: (theme) => theme.palette.grey[500],
                        justifyContent: 'start',
                        borderRadius: (theme) => theme.spacing(1.5),
                      }}
                    >
                      Add new task
                    </TextButton>
                  </SortableColumn>
                ))}
              </SortableContext>
              <Card
                elevation={0}
                sx={{
                  minWidth: (theme) => theme.spacing(70),
                  alignSelf: 'stretch',
                  background: (theme) =>
                    `linear-gradient(to bottom, ${theme.palette.grey[300]}, ${alpha(theme.palette.grey[300], 0.5)})`,
                  borderRadius: (theme) => theme.spacing(1.5),
                }}
              >
                <CardActionArea
                  onClick={handleOpenAddColumnDialog}
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
            {createPortal(
              <DragOverlay>
                {activeColumn ? (
                  <ColumnWrapper>
                    <Column column={activeColumn}>
                      {tasks[activeColumn.id].length > 0 &&
                        tasks[activeColumn.id].map((task) => (
                          <SortableTaskCard key={task.id} task={task} />
                        ))}
                      <TextButton
                        startIcon={<Add />}
                        sx={{
                          color: (theme) => theme.palette.grey[500],
                          justifyContent: 'start',
                          borderRadius: (theme) => theme.spacing(1.5),
                        }}
                      >
                        Add new task
                      </TextButton>
                    </Column>
                  </ColumnWrapper>
                ) : null}
                {activeTask ? (
                  <TaskCardWrapper>
                    <TaskCard task={activeTask} />
                  </TaskCardWrapper>
                ) : null}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        )}
      </Box>
      <DeleteBoardDialog
        open={openDeleteBoardDialog}
        onClose={handleCloseDeleteBoardDialog}
        board={board}
      />
      <AddColumnDialog
        open={openAddColumnDialog}
        onClose={handleCloseAddColumnDialog}
        board={board}
      />
    </>
  )
}
