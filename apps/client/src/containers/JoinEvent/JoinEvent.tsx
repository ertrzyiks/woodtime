import { useEffect } from 'react';
import {useMutation} from "@apollo/client";
import {useHistory, useLocation, useParams} from 'react-router-dom'

import {JoinEventDocument} from "./data/joinEvent";
import {EventForListFragmentDoc} from "../../queries/eventForListFragment";

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
    update: (cache, { data }) => {
      if (!data?.joinEvent?.event) {
        return
      }

      cache.modify({
        fields: {
          events: (existingEvents = []) => {
            const newEventRef = cache.writeFragment({
              data: data?.joinEvent?.event,
              fragment: EventForListFragmentDoc
            })

            return [...existingEvents, newEventRef]
          }
        }
      })
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
