import React, {useContext} from 'react'
import { Form, Field } from 'react-final-form'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { Box, Button, TextField } from '@material-ui/core'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
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
  skipped: boolean
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
    <Form<Values>
        onSubmit={handleCheckpointSubmit}
        initialValues={{ skipped: false }}
        render={({ values, handleSubmit }) => {
            if (values.skipped) {
                delete values.code
            }

           return (<form onSubmit={handleSubmit}>
                <Field
                    name="id"
                    render={({input, meta}) => (
                        <div className={classes.margin}>
                            <TextField {...input}
                                       label='Id'
                                       required
                                       autoComplete="off"
                            />
                            {meta.touched && meta.error && <span>{meta.error}</span>}
                        </div>
                    )}
                />

                <Field
                    name="code"
                    render={({input, meta}) => (
                        <div className={classes.margin}>
                            <TextField {...input}
                                       label='Code'
                                       required={!values.skipped}
                                       disabled={values.skipped}
                                       autoComplete="off"
                            />
                            {meta.touched && meta.error && <span>{meta.error}</span>}
                        </div>
                    )}
                />

                <Field
                    name="skipped"
                    type="checkbox"
                    render={({input, meta}) => (
                        <Box display="flex" alignItems="center" ml={1}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        {...input}
                                        checked={input.value}
                                        name="skipped"
                                        color="primary"
                                    />
                                }
                                label="Skip"
                            />
                        </Box>
                    )}
                />

                <Button variant="contained" color="primary" type='submit'>
                    Submit
                </Button>
            </form>)
        }
    }/>
  )
}

export default AddCheckpointPage
