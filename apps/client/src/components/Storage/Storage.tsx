import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { OrienteeringEvent } from '../../types/OrienteeringEvent';
import { Checkpoint } from '../../types/Checkpoint';

interface Actions {
  addEvent: () => void;
  deleteEvent: () => void;
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

    deleteEvent: () => {},

    addCheckpoint() {},

    deleteCheckpoint: () => {},
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
