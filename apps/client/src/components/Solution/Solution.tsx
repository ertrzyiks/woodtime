import { Box, Typography } from '@material-ui/core';
import React from 'react';
import { Checkpoint } from '../../types/Checkpoint';

interface Props {
  checkpoints: Checkpoint[];
  max: number;
}

const Solution = ({ checkpoints, max }: Props) => {
  if (checkpoints.length !== max) {
    return null;
  }

  checkpoints.sort((ch1, ch2) => {
    return ch1.id > ch2.id ? 1 : -1;
  });

  const parsedCodes = checkpoints.map((ch) => {
    if (ch.skipped) {
      return '...';
    }

    return ch.code;
  });

  return (
    <Box mt={3}>
      <Box minWidth={35} ml={1} mb={1}>
        <Typography variant="h6">Solution:</Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Box width="100%" ml={1}>
          {parsedCodes.join(' ')}
        </Box>
      </Box>
    </Box>
  );
};

export default Solution;
