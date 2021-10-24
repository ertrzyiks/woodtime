import React from 'react'
import IconButton from "@material-ui/core/IconButton";
import PersonAddIcon from "@material-ui/icons/PersonAdd";

const Participants = ({ list, eventId, inviteToken }: { list: string[], eventId: number, inviteToken: string|null}) => {
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
      Copy invitation link:
      <IconButton aria-label="add" onClick={handleClick}>
        <PersonAddIcon />
      </IconButton>
    </div>
  )
}

export default Participants
