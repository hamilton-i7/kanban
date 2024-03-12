export type Board = {
  id: number
  name: string
  created_at: string
  last_modified: string
}

export type BoardPreview = Pick<Board, 'id' | 'name'>

export type DetailedBoard = Board & {
  columns: ColumnBoardContext[]
}

export type CreateBoard = Pick<Board, 'name'> & {
  columns?: Pick<Column, 'name'>[]
}

export type EditBoard = Partial<Pick<Board, 'name'>> & {
  columns?: Partial<Pick<Column, 'id' | 'name'>>[]
}

export type BoardWithColumns = Board & {
  columns: Column[]
}

export type Column = {
  id: number
  name: string
  created_at: string
  last_modified: string
}

export type ColumnPreview = {
  id: number
  name: string
}

export type ColumnBoardContext = Omit<Column, 'board_id'> & {
  tasks: TaskBoardContext[]
}

export type Task = {
  id: number
  title: string
  description: string
  column: number
  created_at: string
  last_modified: string
}

export type TaskBoardContext = Pick<Task, 'id' | 'title' | 'column'> & {
  subtasks: Pick<Subtask, 'id' | 'title' | 'status'>[]
}

export type DetailedTask = Task & {
  subtasks: Subtask[]
}

export type Subtask = {
  id: number
  title: string
  status: boolean
  created_at: string
  last_modified: string
}
