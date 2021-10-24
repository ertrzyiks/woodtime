import React, {useEffect} from 'react'
import {useMutation} from "@apollo/client";
import {useHistory, useLocation, useParams} from 'react-router-dom'

import {JoinEventDocument} from "../../queries/joinEvent";

const JoinEvent = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const history = useHistory()
  const urlParams = new URLSearchParams(location.search)

  const [join, { data, loading }] = useMutation(JoinEventDocument, {
    variables: {
      id: parseInt(id, 10),
      token: urlParams.get('token')
    },
    onCompleted: (data) => {
      if (data?.joinEvent?.success) {
        history.push(`/events/${id}`)
      }
    }
  })

  useEffect(() => {
    join()
  }, [join])

  if (loading) {
    return <div>Joining</div>
  }

  if (data?.joinEvent?.success) {
    return <div>Success</div>
  }

  return <div>Couldn't join</div>
}

export default JoinEvent
