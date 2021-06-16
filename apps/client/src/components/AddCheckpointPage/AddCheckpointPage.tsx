import React, {useContext} from 'react'
import { Form, Field } from 'react-final-form'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { Button, TextField } from '@material-ui/core'
import {ActionsContext} from "../Storage/Storage";
import {useHistory, useParams } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      margin: theme.spacing(1),
    }
  }),
);

interface Values {
  id: string
  code?: string
}

const AddCheckpointPage = () => {
  const actions = useContext(ActionsContext)
  const { id: eventId } = useParams<{ id: string }>()

  const history = useHistory()

  const handleCheckpointSubmit = (checkpoint: Values) => {
    actions?.addCheckpoint({ eventId, ...checkpoint })
    history.push(`/events/${eventId}`)
  }

  const classes = useStyles()

  return (
    <Form<Values> onSubmit={handleCheckpointSubmit} render={({ handleSubmit }) => (
      <form onSubmit={handleSubmit}>
        <Field
          name="id"
          render={({ input, meta }) => (
            <div className={classes.margin}>
              <TextField {...input} label='Id' required />
              {meta.touched && meta.error && <span>{meta.error}</span>}
            </div>
          )}
        />

        <Field
          name="code"
          render={({ input, meta }) => (
            <div className={classes.margin}>
              <TextField {...input} label='Code' required />
              {meta.touched && meta.error && <span>{meta.error}</span>}
            </div>
          )}
        />

        <Button variant="contained" color="primary" type='submit'>
          Submit
        </Button>
      </form>
    )}/>
  )
}

export default AddCheckpointPage
