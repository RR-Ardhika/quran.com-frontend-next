// FORK: QUR-005 — grouped audio player actions.
//
// All player actions as one contiguous button group:
//   ⋯ overflow | volume | prev | next | play | 👁 peek (hide-ayah, touch)
// Rendered in the slider row (right end, before the remaining time). Kept as a single
// component so a position setting (left / middle / right) can be added later.
import { useContext } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import PlayPauseButton from '../Buttons/PlayPauseButton';
import VolumeControl from '../Buttons/VolumeControl';
import OverflowAudioPlayerActionsMenu from '../OverflowAudioPlayerActionsMenu';
import SeekButton, { SeekButtonType } from '../SeekButton';

import styles from './AudioPlayerActionsGroup.module.scss';

import HideAyahPeekButton from '@/components/QuranReader/HideAyahPeekButton';
import useGetChaptersData from '@/hooks/useGetChaptersData';
import { selectIsLoading } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface AudioPlayerActionsGroupProps {
  isEmbedded?: boolean;
}

const AudioPlayerActionsGroup = ({ isEmbedded }: AudioPlayerActionsGroupProps) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const isLoading = useSelector(audioService, selectIsLoading);
  const { lang } = useTranslation('common');
  const chaptersData = useGetChaptersData(lang);

  return (
    <div className={styles.container}>
      <div className={styles.actionItem}>
        <OverflowAudioPlayerActionsMenu isEmbedded={isEmbedded} />
      </div>
      <div className={styles.actionItem}>
        <VolumeControl shouldUseModalZIndex={isEmbedded} />
      </div>
      <div className={styles.actionItem}>
        <SeekButton
          type={SeekButtonType.PrevAyah}
          isLoading={isLoading}
          chaptersData={chaptersData}
        />
      </div>
      <div className={styles.actionItem}>
        <SeekButton
          type={SeekButtonType.NextAyah}
          isLoading={isLoading}
          chaptersData={chaptersData}
        />
      </div>
      <div className={styles.actionItem}>
        <PlayPauseButton />
      </div>
      <div className={styles.actionItem}>
        <HideAyahPeekButton />
      </div>
    </div>
  );
};

export default AudioPlayerActionsGroup;
