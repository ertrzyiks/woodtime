import { Box, Typography } from '@material-ui/core';
import React from 'react';
import {useTranslation} from "react-i18next";

interface Props {
  scoredIds: number[];
  max: number;
}

const MissingCheckpointsArea = ({ scoredIds, max }: Props) => {
  const { t } = useTranslation()

  const allPoints = Array(max)
    .fill(max)
    .map((_, idx) => 1 + idx);
  const missingPoints = allPoints.filter((p) => !scoredIds.includes(p));

  if (scoredIds.length === 0 || scoredIds.length === max) {
    return null;
  }

  return (
    <Box mt={3}>
      <Box minWidth={35} ml={1} mb={1}>
        <Typography>{t('event.missing_checkpoints')}</Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Box width="100%" ml={1}>
          {missingPoints.join(', ')}
        </Box>
      </Box>
    </Box>
  );
};

export default MissingCheckpointsArea;
