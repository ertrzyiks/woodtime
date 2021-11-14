import React from 'react'
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import {Link as RouterLink} from "react-router-dom";
import PersonAddIcon from "@material-ui/icons/PersonAdd";

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
