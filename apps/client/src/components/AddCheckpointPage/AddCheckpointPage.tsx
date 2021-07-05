import React, { useContext, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Box, Button, TextField } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { ActionsContext } from '../Storage/Storage';
import { useHistory, useParams } from 'react-router-dom';
import { FORM_ERROR } from 'final-form';
import { Scanner } from '@woodtime/scanner';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      margin: theme.spacing(1),
    },
  })
);

interface Values {
  id: string;
  code?: string;
  skipped: boolean;
}

interface ScannerRead {
  id: number;
  code: string;
}

const AddCheckpointPage = () => {
  const [scanning, setScanning] = useState(false);
  const [scannerRead, setScannerRead] = useState<ScannerRead | null>(null);
  const actions = useContext(ActionsContext);
  const { id: eventId } = useParams<{ id: string }>();

  const history = useHistory();

  const handleCheckpointSubmit = (checkpoint: Values) => {
    try {
      actions?.addCheckpoint({ eventId: eventId, ...checkpoint });
      history.push(`/events/${eventId}`);
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

  return (
    <Form<Values>
      onSubmit={handleCheckpointSubmit}
      initialValues={{ skipped: false }}
      render={({ values, submitError, handleSubmit }) => {
        if (values.skipped) {
          delete values.code;
        }

        return (
          <form onSubmit={handleSubmit}>
            {submitError && (
              <div className="error">{submitError}</div> // not showing
            )}
            <Field
              name="id"
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
              name="code"
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
