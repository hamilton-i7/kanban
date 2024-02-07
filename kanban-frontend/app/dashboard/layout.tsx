import React from 'react'
import BoardTopBar from '../ui/BoardTopBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BoardTopBar />
      {children}
    </>
  )
}
