import React, { useContext } from 'react';

import { useSelector } from '@xstate/react';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import AudioPlayerActionsGroup from './AudioPlayerActionsGroup'; // FORK: QUR-005
import styles from './AudioPlayerSlider.module.scss';

import Slider, { Direction, SliderVariant } from '@/dls/Slider';
import useDirection from '@/hooks/useDirection';
import { secondsFormatter } from '@/utils/datetime';
import { logEvent } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface AudioPlayerSliderProps {
  isEmbedded?: boolean;
}

const AudioPlayerSlider = ({ isEmbedded }: AudioPlayerSliderProps): JSX.Element => {
  const router = useRouter();
  const { locale } = router;
  const direction = useDirection();

  const audioService = useContext(AudioPlayerMachineContext);
  const elapsed = useSelector(audioService, (state) => state.context.elapsed);
  const downloadProgress = useSelector(audioService, (state) => state.context.downloadProgress);
  const duration = useSelector(audioService, (state) => state.context.duration);

  const sliderContainerClass = classNames(styles.sliderContainer, {
    [styles.embeddedSliderContainer]: isEmbedded,
  });

  return (
    <div className={styles.container}>
      <span className={styles.currentTime} data-testid="audio-elapsed">
        {/* FORK: QUR-006 — left time group now shows elapsed / total */}
        {`${secondsFormatter(elapsed, locale)} / ${secondsFormatter(duration, locale)}`}
      </span>
      <div className={sliderContainerClass}>
        <Slider
          showThumbs={false}
          variant={SliderVariant.Secondary}
          label="audio-player"
          value={[downloadProgress]}
          onValueChange={([newTimestamp]) => {
            logEvent('audio_player_slider_value_change');
            audioService.send({ type: 'SEEK_TO', timestamp: newTimestamp });
          }}
          max={duration}
          direction={direction as Direction}
          withBackground
        />
      </div>
      <div className={sliderContainerClass}>
        <Slider
          label="audio-player"
          value={[elapsed]}
          onValueChange={([newTimestamp]) => {
            logEvent('audio_player_slider_value_change');
            audioService.send({ type: 'SEEK_TO', timestamp: newTimestamp });
          }}
          max={duration}
          direction={direction as Direction}
        />
      </div>
      {/* FORK: QUR-005 — grouped player actions (⋯, volume, prev, next, play, peek) before the remaining time */}
      <span className={styles.actionsAndRemainingTime}>
        <span className={styles.actionsGroup}>
          <AudioPlayerActionsGroup isEmbedded={isEmbedded} />
        </span>
        {/* FORK: QUR-006 — right side shows a live countdown of the duration left */}
        <span className={styles.remainingTime} data-testid="audio-remaining">
          {`-${secondsFormatter(Math.max(duration - elapsed, 0), locale)}`}
        </span>
      </span>
    </div>
  );
};

export default AudioPlayerSlider;
