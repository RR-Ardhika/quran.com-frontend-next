import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import styles from './HideAyahToggle.module.scss';

import Toggle from '@/components/dls/Toggle/Toggle';
import Slider, { SliderVariant } from '@/dls/Slider';
import {
  HIDE_AYAH_BLUR_MAX,
  HIDE_AYAH_BLUR_MIN,
  selectHideAyahBlurStrength,
  selectIsHideAyahEnabled,
  selectIsHideWbwEnabled,
  setBlurStrength,
  setIsHideAyahEnabled,
  setIsHideWbwEnabled,
} from '@/redux/slices/QuranReader/hideAyah';

// FORK: hide-ayah memorization mode toggle. Sits at the top of the
// SettingsDrawer scrollable area, above the VersePreview.
const HideAyahToggle: React.FC = () => {
  const dispatch = useDispatch();
  const isHideAyahEnabled = useSelector(selectIsHideAyahEnabled);
  const isHideWbwEnabled = useSelector(selectIsHideWbwEnabled);
  const blurStrength = useSelector(selectHideAyahBlurStrength);

  return (
    <div className={styles.container}>
      <Toggle
        id="hide-ayah-toggle"
        label="Hide ayah (memorization mode)"
        checked={isHideAyahEnabled}
        onChange={(checked) => dispatch(setIsHideAyahEnabled(checked))}
      />
      {/* eslint-disable-next-line i18next/no-literal-string -- FORK: personal fork, English-only */}
      <p className={styles.hint}>
        Hold Alt / Ctrl / Shift / Win to peek — current ayah while reciting, current page otherwise
      </p>
      {/* FORK: harder memorization mode — blur the wbw line too, so it can't be used as a
          recall cue. Only shown while hide-ayah is on (the state resets when it's turned off). */}
      {isHideAyahEnabled && (
        <div className={styles.subToggle}>
          <Toggle
            id="hide-ayah-wbw-toggle"
            label="Also blur word-by-word (harder mode)"
            checked={isHideWbwEnabled}
            onChange={(checked) => dispatch(setIsHideWbwEnabled(checked))}
          />
        </div>
      )}
      {/* FORK: hide-ayah blur strength — drives --hide-ayah-blur-strength on the reading line */}
      {isHideAyahEnabled && (
        <div className={styles.subToggle}>
          {/* eslint-disable-next-line i18next/no-literal-string -- FORK: personal fork, English-only */}
          <p className={styles.sliderLabel}>{`Blur strength: ${blurStrength}px`}</p>
          <Slider
            label="hide-ayah-blur-strength"
            variant={SliderVariant.Secondary}
            min={HIDE_AYAH_BLUR_MIN}
            max={HIDE_AYAH_BLUR_MAX}
            step={1}
            value={[blurStrength]}
            onValueChange={([value]) => dispatch(setBlurStrength(value))}
          />
        </div>
      )}
    </div>
  );
};

export default HideAyahToggle;
