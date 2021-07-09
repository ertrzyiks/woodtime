import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Box, Button, TextField } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { useHistory, useParams } from 'react-router-dom';
import { FORM_ERROR } from 'final-form';
import { Scanner } from '@woodtime/scanner';
import { CREATE_CHECKPOINT } from '../../queries';
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

interface ScannerRead {
  id: number;
  code: string;
}

const AddCheckpointPage = () => {
  const [scanning, setScanning] = useState(false);
  const [scannerRead, setScannerRead] = useState<ScannerRead | null>(null);
  const { id: eventId } = useParams<{ id: string }>();

  const history = useHistory();

  const [createCheckpoint, { loading: creationLoading, error: creationError }] =
    useMutation<any, Values>(CREATE_CHECKPOINT, {
      refetchQueries: ['getEvent'],
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

            <div
              style={{
                marginTop: 16,
                marginBottom: 16,
                width: 300,
                height: 225,
              }}
            >
              {scanning ? (
                <div style={{ position: 'relative' }}>
                  <Scanner
                    onRead={(point) => {
                      setScannerRead(point);
                    }}
                  />

                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setScanning(false)}
                    style={{ position: 'absolute', bottom: 0, right: 0 }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div
                  style={{
                    width: 300,
                    height: 225,
                    background: 'grey',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setScanning(true)}
                  >
                    Scan
                  </Button>
                </div>
              )}
            </div>

            {scannerRead && (
              <div>
                {scannerRead.id} - {scannerRead.code}
              </div>
            )}

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
