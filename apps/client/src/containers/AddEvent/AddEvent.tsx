import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { useHistory } from 'react-router-dom';
import { Field, Form } from 'react-final-form';
import { useMutation } from '@apollo/client';

import {CreateEventDocument} from '../../queries/createEvent';
import {GetEventsDocument} from '../../queries/getEvents';

interface Values {
  name: string;
  numCheckpoints: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    radioGroupWrapper: {
      paddingTop: 25,
      paddingBottom: 10,
    },
    title: {
      paddingBottom: 0,
    },
    radioLabel: {
      fontSize: '0.6rem',
    },
  })
);

const AddEvent = () => {
  const [name, setName] = useState('');
  const [numCheckpoints, setNumCheckpoints] = useState('');
  const [type, setType] = useState('score');

  const history = useHistory();

  const [createEvent] = useMutation(CreateEventDocument, {
    refetchQueries: [{ query: GetEventsDocument }],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      if (data.createEvent?.event) {
        history.push(`/events/${data.createEvent.event.id}`);
      }
    },
  });

  const classes = useStyles();

  const handleClose = () => {
    history.push('/');
  };

  const handleSubmit = () => {
    const eventTypeId = type === 'score' ? 1 : 2;
    return createEvent({
      variables: {
        name,
        checkpointCount: parseInt(numCheckpoints, 10),
        type: eventTypeId,
      },
    });
  };

  return (
    <Dialog
      open
      keepMounted
      onClose={handleClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title" className={classes.title}>
        Create a new event
      </DialogTitle>
      <Form<Values>
        onSubmit={handleSubmit}
        render={({ handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
              <DialogContent>
                <Field
                  name="name"
                  render={({ input, meta }) => (
                    <div>
                      <TextField
                        id="standard-basic"
                        label="Name"
                        required
                        autoComplete="off"
                        onChange={(e) => setName(e.target.value)}
                      />
                      {meta.touched && meta.error && <span>{meta.error}</span>}
                    </div>
                  )}
                />

                <Field
                  name="points"
                  render={({ input, meta }) => (
                    <div>
                      <TextField
                        id="standard-basic"
                        label="Points"
                        required
                        autoComplete="off"
                        onChange={(e) => setNumCheckpoints(e.target.value)}
                      />
                      {meta.touched && meta.error && <span>{meta.error}</span>}
                    </div>
                  )}
                />

                <Field
                  name="type"
                  render={() => (
                    <div className={classes.radioGroupWrapper}>
                      <FormControl component="fieldset">
                        <FormLabel component="legend">Type</FormLabel>
                        <RadioGroup
                          aria-label="type"
                          name="type"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                        >
                          <FormControlLabel
                            value="score"
                            control={<Radio size="small" />}
                            label={
                              <Typography variant="body2">Scorelauf</Typography>
                            }
                          />
                          <FormControlLabel
                            value="classic"
                            control={<Radio size="small" />}
                            label={
                              <Typography variant="body2">Classic</Typography>
                            }
                          />
                        </RadioGroup>
                      </FormControl>
                    </div>
                  )}
                />
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="primary" type="submit">
                  Create
                </Button>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
              </DialogActions>
            </form>
          );
        }}
      />
    </Dialog>
  );
};

export default AddEvent;
