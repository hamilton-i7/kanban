import React from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material'
import data from '../lib/boards.json'
import BoardIcon from './BoardIcon'

type SelectBoardDialogProps = {
  open: boolean
  onClose: () => void
  onCreateBoard?: () => void
}

export default function SelectBoardDialog({
  open,
  onClose,
  onCreateBoard,
}: SelectBoardDialogProps) {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>All boards ({data.length})</DialogTitle>
      <List>
        {data.map((board) => (
          <ListItem disableGutters key={board.id}>
            <BoardIcon />
            <Link href={`/dashboard/boards/${board.id}`}>{board.name}</Link>
          </ListItem>
        ))}
        <ListItem disableGutters>
          <ListItemButton autoFocus onClick={onCreateBoard}>
            <BoardIcon />
            <ListItemText primary="Create new board" />
          </ListItemButton>
        </ListItem>
      </List>
    </Dialog>
  )
}
