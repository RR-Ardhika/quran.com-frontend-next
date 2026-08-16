/* eslint-disable import/prefer-default-export */
import { createContext, useEffect } from 'react';

import { useInterpret } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { InterpreterFrom } from 'xstate';

import { audioPlayerMachine } from './actors/audioPlayer/audioPlayerMachine';
import {
  getXstateStateFromLocalStorage,
  persistXstateToLocalStorage,
} from './actors/audioPlayer/audioPlayerPersistHelper';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { DEFAULT_RECITER } from '@/redux/defaultSettings/defaultSettings';

export const AudioPlayerMachineContext = createContext(
  {} as InterpreterFrom<typeof audioPlayerMachine>,
);

const LOCAL_STORAGE_PERSISTENCE_EVENT_TRIGGER = [
  'CHANGE_RECITER',
  'SET_INITIAL_CONTEXT',
  'SET_PLAYBACK_SPEED',
  'UPDATE_VOLUME',
];

export const AudioPlayerMachineProvider = ({ children }) => {
  const toast = useToast();
  const { t } = useTranslation('common');
  const defaultLocaleContext = {
    reciterId: DEFAULT_RECITER.id,
  };
  const audioPlayerService = useInterpret(
    audioPlayerMachine,
    {
      context: {
        ...audioPlayerMachine.initialState.context,
        ...defaultLocaleContext,
      },
    },
    (state) => {
      const { playbackRate, reciterId, volume } = state.context;
      if (state.matches('VISIBLE.FAILED')) {
        toast(t('error.general'), { status: ToastStatus.Error });
      }
      if (LOCAL_STORAGE_PERSISTENCE_EVENT_TRIGGER.includes(state.event.type)) {
        persistXstateToLocalStorage({ playbackRate, reciterId, volume });
      }
    },
  );
  // FORK: apply persisted audio context after mount instead of at machine creation.
  // Reading localStorage during the first render makes the client markup differ from
  // the server HTML (hydration error). Post-mount keeps both first renders identical.
  useEffect(() => {
    const persistedContext = getXstateStateFromLocalStorage();
    const currentContext = audioPlayerService.getSnapshot().context;
    if (persistedContext.reciterId) {
      audioPlayerService.send({
        type: 'SET_INITIAL_CONTEXT',
        reciterId: persistedContext.reciterId,
        playbackRate: persistedContext.playbackRate || currentContext.playbackRate,
        volume: persistedContext.volume ?? currentContext.volume,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);
  return (
    <AudioPlayerMachineContext.Provider value={audioPlayerService}>
      {children}
    </AudioPlayerMachineContext.Provider>
  );
};
