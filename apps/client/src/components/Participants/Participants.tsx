import React from 'react'
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import {useTranslation} from "react-i18next";

const Participants = ({ list, eventId, inviteToken }: { list: {id: string, name: string}[], eventId: number, inviteToken: string|null}) => {
  const { t } = useTranslation()
  const inviteUrl = `${window.location.protocol}//${window.location.host}/join/${eventId}?token=${inviteToken}`

  const handleClick = () => {
    try {
      window.navigator.clipboard.writeText(inviteUrl)
    } catch {

    }
  }

  if (!inviteToken) {
    return null
  }

  return (
    <div>
      <Box style={{ display: 'flex', alignItems: 'center' }}>
        {list.map((user, index) => (
          <Box key={user.id} mr={1}>
            <Chip label={user.name} size='small' variant='outlined' />
          </Box>
        ))}

        <Box>
          <IconButton aria-label="add" onClick={handleClick}>
            <PersonAddIcon />
          </IconButton>
          {t('event.actions.invite')}
        </Box>
      </Box>
    </div>
  )
}

export default Participants
