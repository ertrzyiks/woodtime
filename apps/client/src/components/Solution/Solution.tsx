import { Box, Typography } from '@mui/material';
import { Checkpoint } from '../../types/Checkpoint';
import { useTranslation } from 'react-i18next';

interface Props {
  checkpoints: Checkpoint[];
  max: number;
}

const Solution = ({ checkpoints, max }: Props) => {
  const { t } = useTranslation();

  const seqCheckpointIds = Array(max)
    .fill(max)
    .map((_, idx) => 1 + idx);

  const parsedCodes = seqCheckpointIds.map((id: number) => {
    const matchingCheckpoint = checkpoints.find((ch) => ch.cp_id === id);
    if (!matchingCheckpoint) {
      return '...';
    }

    if (matchingCheckpoint.skipped) {
      return '???';
    }

    return matchingCheckpoint.cp_code;
  });

  return (
    <Box mt={3}>
      <Box minWidth={35} ml={1} mb={1}>
        <Typography variant="h6">{t('event.solution')}</Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Box width="100%" ml={1}>
          {parsedCodes.join(' ').toUpperCase()}
        </Box>
      </Box>
    </Box>
  );
};

export default Solution;
