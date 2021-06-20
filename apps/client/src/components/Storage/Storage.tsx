import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { OrienteeringEvent } from '../../types/OrienteeringEvent';
import { Checkpoint } from '../../types/Checkpoint';

interface Actions {
  addEvent: (name: string, numCheckpoints: string) => OrienteeringEvent;
  addCheckpoint: (params: {
    eventId: string;
    id: string;
    code?: string;
    skipped: boolean;
  }) => Checkpoint;
  deleteCheckpoint: (params: { eventId: string; id: string }) => void;
}

interface State {
  events: OrienteeringEvent[];
}

export const StorageContext = React.createContext<State>({ events: [] });
export const ActionsContext = React.createContext<Actions | null>(null);

const PersistInLocalstorage = () => {
  const value = useContext(StorageContext);

  useEffect(() => {
    localStorage.setItem('woodtime-storage', JSON.stringify(value));
  }, [value]);

  return null;
};

const Storage = ({ children }: { children?: ReactNode }) => {
  const [value, setValue] = useState<State>(() => {
    const storedValueRaw = localStorage.getItem('woodtime-storage') ?? '';
    return storedValueRaw
      ? JSON.parse(storedValueRaw)
      : { events: [] as Event[] };
  });

  const actions: Actions = {
    addEvent: (name: string, numCheckpoints: string) => {
      const event = {
        id: new Date().getTime().toString(),
        name,
        createdAt: new Date().toISOString(),
        numberOfCheckpoints: parseInt(numCheckpoints, 10),
        checkpoints: [],
      };
      const newValue = { events: [...value.events, event] };
      setValue(newValue);
      return event;
    },

    addCheckpoint({ eventId, id, code, skipped }) {
      const event = value.events.find((e) => e.id === eventId);
      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }

      const checkpoint = {
        id,
        skipped,
        code,
      };

      const newEvents = value.events.map((e) => {
        if (e.id === eventId) {
          return { ...e, checkpoints: [...e.checkpoints, checkpoint] };
        } else {
          return e;
        }
      });

      setValue({ ...value, events: newEvents });

      return checkpoint;
    },

    deleteCheckpoint: ({ eventId, id }) => {
      const event = value.events.find((e) => e.id === eventId);
      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }

      const updatedEvents = value.events.map((e) => {
        if (e.id !== eventId) {
          return e;
        }

        const updatedCheckpoints = e.checkpoints.filter((ch) => ch.id !== id);
        return { ...e, checkpoints: updatedCheckpoints };
      });

      setValue({ ...value, events: updatedEvents });
    },
  };

  return (
    <ActionsContext.Provider value={actions}>
      <StorageContext.Provider value={value}>
        <PersistInLocalstorage />
        {children}
      </StorageContext.Provider>
    </ActionsContext.Provider>
  );
};

export default Storage;
