import { StrictMode, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

import PwaUpdaterContext, { PwaUpdater, PwaUpdateOnSuccessCallback, PwaUpdateOnUpdateCallback } from './components/PwaUpdaterContext/PwaUpdaterContext'

const onSuccessCallbacks: PwaUpdateOnSuccessCallback[] = []
const onUpdateCallbacks: PwaUpdateOnUpdateCallback[] = []

const UpdaterProvider = ({ children }: { children: ReactNode }) => {
  const value: PwaUpdater = {
    onSuccess: (cb) => onSuccessCallbacks.push(cb),
    offSuccess: (cb) => onSuccessCallbacks.filter(fn => fn !== cb),
    onUpdate: (cb) => onUpdateCallbacks.push(cb),
    offUpdate: (cb) => onUpdateCallbacks.filter(fn => fn !== cb)
  }

  return (
    <PwaUpdaterContext.Provider value={value}>
      {children}
    </PwaUpdaterContext.Provider>
  )
}

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <UpdaterProvider>
      <App />
    </UpdaterProvider>
  </StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: reg => {
    onUpdateCallbacks.forEach(cb => cb(reg))
  },
  onSuccess: () => {
    onSuccessCallbacks.forEach(cb => cb())
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
