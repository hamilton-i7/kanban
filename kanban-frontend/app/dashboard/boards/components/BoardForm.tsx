import React from 'react'
import {
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  Stack,
  DialogActions,
} from '@mui/material'
import FilledButton from '@/app/components/button/FilledButton'
import TonalButton from '@/app/components/button/TonalButton'
import Dialog from '@/app/components/Dialog'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers'
import { Column } from '@/app/lib/models'
import SortableColumnField, {
  ColumnField,
  ColumnFieldWrapper,
} from './SortableColumnField'
import { createPortal } from 'react-dom'

type BoardFormProps = {
  open: boolean
  onClose: () => void
  boardName?: string
  onBoardNameChange?: (name: string) => void
  columnFields?: Pick<Column, 'id' | 'name'>[]
  activeColumnField: Pick<Column, 'id' | 'name'> | null
  onColumnUpdate?: (columnId: number, name: string) => void
  onColumnAdd?: () => void
  onColumnDelete?: (columnId: number) => void
  onConfirmClick?: () => void
  variant?: 'create' | 'edit'
  onColumnFieldDragStart?: (event: DragStartEvent) => void
  onColumnFieldDragEnd?: (event: DragEndEvent) => void
}

export default function BoardForm({
  open,
  onClose,
  boardName = '',
  onBoardNameChange = () => {},
  columnFields = [],
  activeColumnField,
  onColumnUpdate = () => {},
  onColumnAdd = () => {},
  onColumnDelete = () => {},
  onConfirmClick,
  variant = 'create',
  onColumnFieldDragStart,
  onColumnFieldDragEnd,
}: BoardFormProps) {
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form' }}>
      <DialogTitle
        variant="heading-l"
        component="h2"
        sx={{ textTransform: 'capitalize', color: 'common.black' }}
      >
        {variant === 'create' ? 'Add new board' : 'Edit board'}
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body-m"
          component="label"
          htmlFor="board-name-input"
          display="block"
          color="grey.500"
          sx={{ mb: (theme) => theme.spacing(2) }}
        >
          Board name
        </Typography>
        <TextField
          id="board-name-input"
          variant="outlined"
          placeholder="e.g. Web Design"
          size="small"
          fullWidth
          value={boardName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onBoardNameChange(event.target.value)
          }
          InputProps={{
            sx: { typography: 'body-l', color: 'common.black' },
          }}
        />

        {columnFields.length > 0 && (
          <>
            <Typography
              variant="body-m"
              component="label"
              display="block"
              color="grey.500"
              sx={{ m: (theme) => theme.spacing(6, 0, 2) }}
            >
              Board columns
            </Typography>
            <Stack spacing={3}>
              <DndContext
                collisionDetection={closestCenter}
                sensors={sensors}
                onDragStart={onColumnFieldDragStart}
                onDragEnd={onColumnFieldDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={columnFields.map((columnField) =>
                    columnField.id.toString()
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  {columnFields.map((columnField) => (
                    <SortableColumnField
                      key={columnField.id}
                      column={columnField}
                      onNameChange={onColumnUpdate}
                      onColumnDelete={onColumnDelete}
                    />
                  ))}
                </SortableContext>
                {createPortal(
                  <DragOverlay modifiers={[restrictToParentElement]}>
                    {activeColumnField ? (
                      <ColumnFieldWrapper>
                        <ColumnField column={activeColumnField} />
                      </ColumnFieldWrapper>
                    ) : null}
                  </DragOverlay>,
                  document.body
                )}
              </DndContext>
            </Stack>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <TonalButton onClick={onColumnAdd}>Add new column</TonalButton>
        <FilledButton onClick={onConfirmClick}>
          {variant === 'create' ? 'Create new board' : 'Save changes'}
        </FilledButton>
      </DialogActions>
    </Dialog>
  )
}
