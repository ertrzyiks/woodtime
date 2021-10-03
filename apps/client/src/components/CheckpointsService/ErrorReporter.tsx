import {CheckpointsStateContext} from "./CheckpointsService";
import {useContext, useEffect, useState} from "react";
import {Snackbar} from "@material-ui/core";

const ErrorReporter = () => {
  const { errored } = useContext(CheckpointsStateContext)
  const [open, setOpen] = useState(true)

  const errors = errored.map(item => `Error during saving point ${item.checkpoint.cpId}`)

  useEffect(() => {
    setOpen(true)
  }, [errored, setOpen])

  if (errors.length === 0) {
    return null
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      onClose={() => setOpen(false)}
      open={open}
      message={errors.map(message => (
        <div>{message}</div>
      ))}
      autoHideDuration={5000}
    />
  )
}

export default ErrorReporter
