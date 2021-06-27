import { createContext } from "react";

export type PwaUpdateOnSuccessCallback =  () => void
export type PwaUpdateOnUpdateCallback = (reg: ServiceWorkerRegistration) => void

export interface PwaUpdater {
  onSuccess: (cb: PwaUpdateOnSuccessCallback) => void
  offSuccess: (cb: PwaUpdateOnSuccessCallback) => void
  onUpdate: (cb: PwaUpdateOnUpdateCallback) => void
  offUpdate: (cb: PwaUpdateOnUpdateCallback) => void
}

const PwaUpdaterContext = createContext<PwaUpdater|null>(null)

export default PwaUpdaterContext
