'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import logoMobile from '../../public/logo-mobile.svg'
import { AppBar, Button, IconButton, Toolbar, alpha } from '@mui/material'
import { Add, ExpandMore, MoreVert } from '@mui/icons-material'
import detailedBoards from '../lib/detailed_boards.json'
import SelectBoardDialog from './SelectBoardDialog'
import BoardMenu from './BoardMenu'

function getBoard(boardId: number) {
  const board = detailedBoards.find(
    (currentBoard) => currentBoard.id === boardId
  )
  return board
}

export default function BoardTopBar() {
  const params = useParams<{ id: string }>()
  const board = getBoard(+params.id)

  const [openSelectBoardMenu, setOpenSelectBoardMenu] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const openOptionsMenu = Boolean(anchorEl)

  const handleOpenSelectBoardMenu = () => {
    setOpenSelectBoardMenu(true)
  }

  const handleCloseSelectBoardMenu = () => {
    setOpenSelectBoardMenu(false)
  }

  const handleOptionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleOptionsClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(null)
  }

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'common.white' }}>
      <Toolbar
        sx={{
          px: (theme) => theme.spacing(4),
          height: (theme) => theme.spacing(16),
        }}
      >
        <Image src={logoMobile} alt="Kanban logo" />
        <Button
          endIcon={<ExpandMore color="primary" />}
          onClick={handleOpenSelectBoardMenu}
          sx={{
            ml: (theme) => theme.spacing(2),
            mr: 'auto',
            color: 'common.black',
            textTransform: 'capitalize',
            typography: 'heading-l',
          }}
        >
          {board?.name}
        </Button>
        <Button
          variant="contained"
          aria-label="Add new task"
          disabled={board?.columns.length === 0 ?? false}
          disableElevation
          sx={{
            borderRadius: (theme) => theme.spacing(6),
            p: (theme) => theme.spacing(1, 2),
            minWidth: (theme) => theme.spacing(12),
            mr: (theme) => theme.spacing(1),
            '&:disabled': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.25),
            },
          }}
        >
          <Add sx={{ color: 'common.white' }} />
        </Button>
        <IconButton
          id="board-menu-button"
          aria-label="More options"
          aria-controls={openOptionsMenu ? 'board-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openOptionsMenu ? 'true' : undefined}
          onClick={handleOptionsClick}
        >
          <MoreVert />
        </IconButton>
        <BoardMenu
          anchorEl={anchorEl}
          open={openOptionsMenu}
          onClose={handleOptionsClose}
          MenuListProps={{
            'aria-labelledby': 'board-menu-button',
          }}
        />
        <SelectBoardDialog
          open={openSelectBoardMenu}
          onClose={handleCloseSelectBoardMenu}
          selectedBoard={board?.id ?? 0}
        />
      </Toolbar>
    </AppBar>
  )
}
