import React from 'react'

type DashboardLayoutProps = {
  children: React.ReactNode
  taskModal: React.ReactNode
}

export default function DashboardLayout({
  children,
  taskModal,
}: DashboardLayoutProps) {
  return (
    <>
      {children}
      {taskModal}
    </>
  )
}
