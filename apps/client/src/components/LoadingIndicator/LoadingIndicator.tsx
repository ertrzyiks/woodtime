import React from 'react'
import {createStyles, LinearProgress, makeStyles, Theme} from "@material-ui/core";

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
