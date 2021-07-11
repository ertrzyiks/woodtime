import {useContext} from "react";

import {InitialNavigationContext} from "../components/InitialNavigationDetector/InitialNavigationDetector";

export function useInitialNavigation() {
  return useContext(InitialNavigationContext)
}
