'use client'

import React, { useState } from 'react'
import BoardTopBar from '../ui/BoardTopBar'
import AddBoardDialog from '../ui/AddBoardDialog'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [openAddBoardDialog, setOpenAddBoardDialog] = useState(false)

  const handleOpenAddBoardDialog = () => {
    setOpenAddBoardDialog(true)
  }

  const handleCloseAddBoardDialog = () => {
    setOpenAddBoardDialog(false)
  }

  return (
    <>
      <BoardTopBar onCreateBoard={handleOpenAddBoardDialog} />
      {children}
      <AddBoardDialog
        open={openAddBoardDialog}
        onClose={handleCloseAddBoardDialog}
      />
    </>
  )
}
