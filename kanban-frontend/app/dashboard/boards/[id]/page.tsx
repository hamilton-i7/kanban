import React from 'react'
import Image from 'next/image'
import iconAdd from '../../../../public/icon-add-task-mobile.svg'
import detailedBoards from '../../../lib/detailed_boards.json'
import TaskCard from '@/app/ui/TaskCard'

export default function Page() {
  const noColumns = detailedBoards[0].columns.length === 0

  return (
    <div className="bg-gray-100 h-[calc(100vh-var(--top-bar-height))] px-4">
      {noColumns && EmptyContent()}
      <main className="flex gap-6 py-6 overflow-x-scroll h-full">
        {detailedBoards[0].columns.map((column) => (
          <div key={column.id} className="">
            <h2 className="font-bold text-xs text-gray-300 uppercase mb-6 tracking-[0.2em]">
              {column.name} ({column.tasks.length})
            </h2>
            <div className="flex flex-col gap-5">
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
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

function EmptyContent() {
  return (
    <main className="w-full flex flex-col items-center gap-6">
      <p className="text-center text-lg font-bold text-gray-300">
        This board is empty. Create a new column to get started.
      </p>
      <button className="h-12 px-4 flex items-center gap-2 text-sm font-bold text-white rounded-3xl bg-purple capitalize">
        <Image src={iconAdd} alt="Plus icon" />
        Add new column
      </button>
    </main>
  )
}
