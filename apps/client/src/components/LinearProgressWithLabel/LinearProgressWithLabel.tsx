import LinearProgress, {
  LinearProgressProps,
} from '@material-ui/core/LinearProgress';
import { Box, Typography } from "@material-ui/core";

function LinearProgressWithLabel({
 current,
 max,
 ...props
}: LinearProgressProps & { current: number; max: number }) {
  const value = (100 * current) / max;

  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} value={value} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">
          {current}/{max}
        </Typography>
      </Box>
    </Box>
  );
}

export default LinearProgressWithLabel
