import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { OrienteeringEvent } from '../../types/OrienteeringEvent';
import { Checkpoint } from '../../types/Checkpoint';

interface Actions {
  addEvent: () => void;
  deleteEvent: (id: number) => void;
  addCheckpoint: (params: any) => void;
  deleteCheckpoint: (params: any) => void;
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
    addEvent: () => {},

    deleteEvent: (id: number) => {
      const remainingEvents = value.events.filter((e) => e.id !== id);
      setValue({ ...value, events: remainingEvents });
    },

    addCheckpoint() {},

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
