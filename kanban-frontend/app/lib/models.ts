export type Board = {
  id: number
  name: string
  created_at: string
  last_modified: string
}

export type BoardPreview = Pick<Board, 'id' | 'name'>

export type DetailedBoard = Board & {
  columns: (Omit<Column, 'board_id'> & {
    tasks: (Pick<Task, 'id' | 'title'> & {
      subtasks: Pick<Subtask, 'id' | 'title' | 'status'>[]
    })[]
  })[]
}

export type CreateBoard = Pick<Board, 'name'> & {
  columns?: Pick<Column, 'name'>[]
}

export type EditBoard = Partial<CreateBoard>

export type BoardWithColumns = Board & {
  columns: Column[]
}

export type Column = {
  id: number
  name: string
  board_id: string
  created_at: string
  last_modified: string
}

export type Task = {
  id: number
  title: string
  description: string
  column_id: string
  created_at: string
  last_modified: string
}

export type Subtask = {
  id: number
  title: string
  task_id: string
  status: boolean
  created_at: string
  last_modified: string
}
