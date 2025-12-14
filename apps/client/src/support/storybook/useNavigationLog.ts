import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

interface Params {
  onNavigate: (params: { pathname: string }) => void;
}

export function useNavigationLog({ onNavigate }: Params) {
  const location = useLocation();
  const isFirstRef = useRef(true);

  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }

    onNavigate(location);
  }, [onNavigate, location, isFirstRef]);
}
