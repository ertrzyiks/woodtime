import { Form, Field } from 'react-final-form';
import { makeStyles, createStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Box, Button, TextField } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useHistory, useParams } from 'react-router-dom';

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

  const handleCheckpointSubmit = (checkpoint: any) => {
      // TODO: add checkpoint using rxdb
    history.push(`/events/${eventId}`)
  };

  const classes = useStyles();

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
  )
}

export default AddCheckpointPage;
