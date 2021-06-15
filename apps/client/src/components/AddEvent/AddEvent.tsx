import React, {useContext, useState} from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from "@material-ui/core";
import { useHistory } from "react-router-dom"
import {ActionsContext} from "../Storage/Storage";

const AddEvent = () => {
  const [name, setName] = useState('')

  const actions = useContext(ActionsContext)
  const history = useHistory()
  const handleClose = () => {
    history.push('/')
  }


  const handleSubmit = () => {
    const event = actions?.addEvent(name)
    if (event) {
      history.push(`/events/${event.id}`)
    }
  }
  return (
    <Dialog
      open
      keepMounted
      onClose={handleClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title">Create a new event</DialogTitle>
      <DialogContent>
        <TextField id="standard-basic" label="Name" onChange={e => setName(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} color="primary">
          Create
        </Button>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddEvent
