import React from 'react';
import { Form, Field } from 'react-final-form';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Box, Button, TextField } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { useHistory, useParams } from 'react-router-dom';
import { FORM_ERROR } from 'final-form';
import {CREATE_CHECKPOINT, GET_EVENT} from '../../queries';
import { useMutation } from '@apollo/client';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      margin: theme.spacing(1),
    },
  })
);

interface Values {
  eventId: number;
  cpId: number;
  cpCode?: string;
  skipped?: boolean;
  skipReason?: string;
}

const AddCheckpointPage = () => {
  const { id: eventId } = useParams<{ id: string }>();

  const history = useHistory();

  const [createCheckpoint, { loading: creationLoading, error: creationError }] =
    useMutation<any, Values>(CREATE_CHECKPOINT, {
      refetchQueries: [{ query: GET_EVENT, variables: { id: parseInt(eventId, 10) } }],
      awaitRefetchQueries: true,
      onCompleted: (data) => {
        history.push(`/events/${data.createCheckpoint.checkpoint.event_id}`);
      },
    });

  const handleCheckpointSubmit = (checkpoint: any) => {
    try {
      return createCheckpoint({
        variables: {
          eventId: parseInt(eventId, 10),
          cpId: parseInt(checkpoint.cpId, 10),
          cpCode: checkpoint.cpCode,
          skipped: checkpoint.skipped,
          skipReason: checkpoint.skipReason,
        },
      });
    } catch (err) {
      if (!err) {
        return {
          [FORM_ERROR]: 'Something went wrong',
        };
      }

      if (err.message && err.message.startsWith('Checkpoint')) {
        return {
          id: 'Id already taken',
        };
      }

      return {
        [FORM_ERROR]: err.message || err,
      };
    }
  };

  const classes = useStyles();

  if (creationLoading) {
    return <p>Loading...</p>;
  }

  if (creationError) {
    return <p>Error :(</p>;
  }

  return (
    <Form<Values>
      onSubmit={handleCheckpointSubmit}
      initialValues={{ skipped: false }}
      render={({ values, submitError, handleSubmit }) => {
        if (values.skipped) {
          delete values.cpCode;
        }

        return (
          <form onSubmit={handleSubmit}>
            {submitError && (
              <div className="error">{submitError}</div> // not showing
            )}
            <Field
              name="cpId"
              render={({ input, meta }) => (
                <div className={classes.margin}>
                  <TextField
                    {...input}
                    label="Id"
                    required
                    autoComplete="off"
                  />
                  {meta.touched && (meta.error || meta.submitError) && (
                    <span>{meta.error || meta.submitError}</span>
                  )}
                </div>
              )}
            />

            <Field
              name="cpCode"
              render={({ input, meta }) => (
                <div className={classes.margin}>
                  <TextField
                    {...input}
                    label="Code"
                    required={!values.skipped}
                    disabled={values.skipped}
                    autoComplete="off"
                  />
                  {meta.touched && (meta.error || meta.submitError) && (
                    <span>{meta.error || meta.submitError}</span>
                  )}
                </div>
              )}
            />

            <Field
              name="skipped"
              type="checkbox"
              render={({ input, meta }) => (
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

            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </form>
        );
      }}
    />
  );
};

export default AddCheckpointPage;
