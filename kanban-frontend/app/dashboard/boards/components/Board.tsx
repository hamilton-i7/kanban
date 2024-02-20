'use client'

import React, { useEffect, useState } from 'react'
import EmptyBoard from './EmptyBoard'
import TaskCard from '@/app/dashboard/tasks/components/TaskCard'
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
  closestCenter,
  useDroppable,
  useSensors,
  useSensor,
  TouchSensor,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  MouseSensor,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableColumn, { Column, ColumnWrapper } from './SortableColumn'
import { ColumnBoardContext } from '@/app/lib/models'
import { COLUMN_TYPE, REORDER_TIMEOUT_MILLIS } from '@/app/lib/constants'
import { createPortal } from 'react-dom'
import { useDebounce } from '@uidotdev/usehooks'

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
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

  const [openDeleteBoardDialog, setOpenDeleteBoardDialog] = useState(false)
  const [openAddColumnDialog, setOpenAddColumnDialog] = useState(false)
  const [activeColumn, setActiveColumn] = useState<ColumnBoardContext | null>(
    null
  )
  const [columns, setColumns] = useState<ColumnBoardContext[]>([])

  const debouncedColumns = useDebounce(columns, REORDER_TIMEOUT_MILLIS)

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
    if (event.active.data.current?.type !== COLUMN_TYPE) return
    setActiveColumn(event.active.data.current.column)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null)

    const { active, over } = event
    if (!over) return

    if (active.id === over.id) return

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

  useEffect(() => {
    if (!board) return
    setColumns(board.columns)
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
            collisionDetection={closestCenter}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <Stack
              direction="row"
              component="main"
              spacing={6}
              ref={setNodeRef}
              sx={{
                p: (theme) => theme.spacing(6, 4),
                overflowX: 'scroll',
                flex: 1,
                alignItems: 'flex-start',
              }}
            >
              <SortableContext
                items={columns.map((column) => column.id.toString())}
                strategy={horizontalListSortingStrategy}
              >
                {columns.map((column) => (
                  <SortableColumn key={column.id} column={column}>
                    {column.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        totalSubtasks={task.subtasks.length}
                        completedSubtasks={
                          task.subtasks.filter((subtask) => subtask.status)
                            .length
                        }
                      />
                    ))}
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
                  '&.MuiPaper-root': {
                    mt: (theme) => theme.spacing(9.75),
                  },
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
                      {activeColumn.tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          id={task.id}
                          title={task.title}
                          totalSubtasks={task.subtasks.length}
                          completedSubtasks={
                            task.subtasks.filter((subtask) => subtask.status)
                              .length
                          }
                        />
                      ))}
                    </Column>
                  </ColumnWrapper>
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
