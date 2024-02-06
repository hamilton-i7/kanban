import React from 'react'

type TaskCardProps = {
  title: string
  totalSubtasks: number
  completedSubtasks: number
}

export default function TaskCard({
  title,
  totalSubtasks,
  completedSubtasks,
}: TaskCardProps) {
  return (
    <article
      className="group w-[17.5rem] rounded-lg bg-white px-4 py-6 cursor-pointer focus:outline-none"
      tabIndex={0}
    >
      <h3 className="font-bold text-sm text-black group-focus:text-purple group-hover:text-purple">
        {title}
      </h3>
      <p className="font-bold text-xs text-gray-300">
        {completedSubtasks} of {totalSubtasks} subtasks
      </p>
    </article>
  )
}
