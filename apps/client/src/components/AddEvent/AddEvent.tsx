import React, { useContext, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { ActionsContext } from '../Storage/Storage';
import { Field, Form } from 'react-final-form';
import { useMutation } from '@apollo/client';

import { CREATE_EVENT } from '../../queries';

interface Values {
  name: string;
  numCheckpoints: string;
}

const AddEvent = () => {
  const [name, setName] = useState('');
  const [numCheckpoints, setNumCheckpoints] = useState('');

  const [createEvent, { loading: creationLoading, error: creationError }] =
    useMutation(CREATE_EVENT, {
      refetchQueries: ['getEvents'],
      onCompleted: (data) => {
        history.push(`/events/${data.createEvent.event.id}`);
      },
    });

  const history = useHistory();
  const handleClose = () => {
    history.push('/');
  };

  const handleSubmit = () => {
    return createEvent({
      variables: { name, checkpointCount: parseInt(numCheckpoints, 10) },
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
      <DialogTitle id="alert-dialog-slide-title">
        Create a new event
      </DialogTitle>
      <Form<Values>
        onSubmit={handleSubmit}
        render={({ handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
              <DialogContent>
                <Field
                  name="id"
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
                  name="code"
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
