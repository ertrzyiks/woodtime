import { createContext, ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const InitialNavigationContext = createContext(false);

interface Props {
  children: ReactNode;
}

const InitialNavigationDetector = ({ children }: Props) => {
  const [firstPathName, setFirstPathName] = useState<string | null>(null);
  const [isFirst, setIsFirst] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!firstPathName) {
      setFirstPathName(location.pathname);
    } else if (firstPathName !== location.pathname) {
      setIsFirst(false);
    }
  }, [firstPathName, location.pathname, isFirst, setIsFirst]);

  return (
    <InitialNavigationContext.Provider
      value={(!firstPathName || firstPathName === location.pathname) && isFirst}
    >
      {children}
    </InitialNavigationContext.Provider>
  );
};

export default InitialNavigationDetector;
