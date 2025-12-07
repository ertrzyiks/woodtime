import React from 'react'
import { LinearProgress } from "@mui/material";
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 4
    }
  })
);

interface Props {
  active: boolean
}

const LoadingIndicator = ({ active }: Props) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {active && <LinearProgress color="secondary" />}
    </div>
  )
}

export default LoadingIndicator
