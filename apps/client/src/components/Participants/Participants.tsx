import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import {Link as RouterLink} from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const Participants = ({ list, eventId }: { list: {id: string, name: string}[], eventId: number}) => {
  return (
    <div>
      <Box style={{ display: 'flex', alignItems: 'center' }}>
        {list.map((user, index) => (
          <Box key={user.id} mr={1}>
            <Chip label={user.name} size='small' variant='outlined' />
          </Box>
        ))}
        <IconButton aria-label="add" component={RouterLink} to={`/events/${eventId}/invite`}>
          <PersonAddIcon />
        </IconButton>
      </Box>
    </div>
  )
}

export default Participants
