import React from 'react'

type DashboardLayoutProps = {
  children: React.ReactNode
  modal: React.ReactNode
}

export default function DashboardLayout({
  children,
  modal,
}: DashboardLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
