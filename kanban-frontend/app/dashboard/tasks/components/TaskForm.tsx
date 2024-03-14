import React from 'react'
import { ColumnPreview, Subtask } from '@/app/lib/models'
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
import FilledButton from '@/app/components/button/FilledButton'
import TonalButton from '@/app/components/button/TonalButton'
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  Stack,
  MenuItem,
} from '@mui/material'
import { createPortal } from 'react-dom'
import SortableSubtaskField, {
  SubtaskField,
  SubtaskFieldWrapper,
} from './SortableSubtaskField'

type TaskFormProps = {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  selectedColumnId?: string
  onTitleChange?: (name: string) => void
  onDescriptionChange?: (description: string) => void
  columns?: ColumnPreview[]
  onColumnChange?: (columnId: string) => void
  subtaskFields?: Pick<Subtask, 'id' | 'title'>[]
  activeSubtaskField: Pick<Subtask, 'id' | 'title'> | null
  onSubtaskUpdate?: (columnId: number, name: string) => void
  onSubtaskAdd?: () => void
  onSubtaskDelete?: (columnId: number) => void
  onConfirmClick?: () => void
  variant?: 'create' | 'edit'
  onSubtaskFieldDragStart?: (event: DragStartEvent) => void
  onSubtaskFieldDragEnd?: (event: DragEndEvent) => void
}

export default function TaskForm({
  open,
  onClose,
  title = '',
  description = '',
  selectedColumnId = '',
  onTitleChange = () => {},
  onDescriptionChange = () => {},
  columns = [],
  onColumnChange = () => {},
  subtaskFields = [],
  activeSubtaskField,
  onSubtaskUpdate = () => {},
  onSubtaskAdd = () => {},
  onSubtaskDelete = () => {},
  onConfirmClick,
  variant = 'create',
  onSubtaskFieldDragStart,
  onSubtaskFieldDragEnd,
}: TaskFormProps) {
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        component: 'form',
        sx: {
          width: '100%',
          maxWidth: (theme) => theme.spacing(120),
        },
      }}
    >
      <DialogTitle
        variant="heading-l"
        component="h2"
        sx={{ textTransform: 'capitalize', color: 'common.black' }}
      >
        {variant === 'create' ? 'Add new task' : 'Edit task'}
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body-m"
          component="label"
          htmlFor="title-input"
          display="block"
          color="grey.500"
          sx={{ mb: (theme) => theme.spacing(2) }}
        >
          Title
        </Typography>
        <TextField
          id="title-input"
          variant="outlined"
          placeholder="e.g. Take coffee break"
          size="small"
          fullWidth
          value={title}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onTitleChange(event.target.value)
          }
          InputProps={{
            sx: { typography: 'body-l', color: 'common.black' },
          }}
        />

        <Typography
          variant="body-m"
          component="label"
          htmlFor="description-input"
          display="block"
          color="grey.500"
          sx={{
            mb: (theme) => theme.spacing(2),
            mt: (theme) => theme.spacing(6),
          }}
        >
          Description
        </Typography>
        <TextField
          id="description-input"
          variant="outlined"
          placeholder="e.g. It’s always good to take a break. This 15 minute break will 
          recharge the batteries a little."
          size="small"
          fullWidth
          multiline
          minRows={4}
          value={description}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onDescriptionChange(event.target.value)
          }
          InputProps={{
            sx: { typography: 'body-l', color: 'common.black' },
          }}
        />

        {subtaskFields.length > 0 && (
          <>
            <Typography
              variant="body-m"
              component="label"
              display="block"
              color="grey.500"
              sx={{ m: (theme) => theme.spacing(6, 0, 2) }}
            >
              Subtasks
            </Typography>
            <Stack spacing={3}>
              <DndContext
                collisionDetection={closestCenter}
                sensors={sensors}
                onDragStart={onSubtaskFieldDragStart}
                onDragEnd={onSubtaskFieldDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={subtaskFields.map(({ id }) => id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  {subtaskFields.map((subtaskField) => (
                    <SortableSubtaskField
                      key={subtaskField.id}
                      subtask={subtaskField}
                      onTitleChange={onSubtaskUpdate}
                      onSubtaskDelete={onSubtaskDelete}
                    />
                  ))}
                </SortableContext>
                {createPortal(
                  <DragOverlay modifiers={[restrictToParentElement]}>
                    {activeSubtaskField ? (
                      <SubtaskFieldWrapper>
                        <SubtaskField subtask={activeSubtaskField} />
                      </SubtaskFieldWrapper>
                    ) : null}
                  </DragOverlay>,
                  document.body
                )}
              </DndContext>
            </Stack>
          </>
        )}
        <TonalButton
          onClick={onSubtaskAdd}
          fullWidth
          sx={{ mt: (theme) => theme.spacing(6) }}
        >
          Add new subtask
        </TonalButton>
        <Typography
          variant="body-m"
          component="label"
          htmlFor="task-column"
          display="block"
          color="grey.500"
          sx={{
            mb: (theme) => theme.spacing(2),
            mt: (theme) =>
              subtaskFields.length > 0 ? theme.spacing(3) : theme.spacing(6),
            textTransform: 'capitalize',
          }}
        >
          Column
        </Typography>
        <TextField
          id="task-column"
          variant="outlined"
          size="small"
          fullWidth
          select
          value={selectedColumnId}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onColumnChange(event.target.value)
          }
          InputProps={{
            sx: { typography: 'body-l', color: 'common.black' },
          }}
        >
          {columns.map((column) => (
            <MenuItem key={column.id} value={column.id.toString()}>
              {column.name}
            </MenuItem>
          ))}
        </TextField>
        <FilledButton
          onClick={onConfirmClick}
          fullWidth
          sx={{ mt: (theme) => theme.spacing(6) }}
        >
          {variant === 'create' ? 'Create new task' : 'Save changes'}
        </FilledButton>
      </DialogContent>
    </Dialog>
  )
}
