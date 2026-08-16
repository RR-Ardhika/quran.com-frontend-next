import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import styles from './HideAyahToggle.module.scss';

import Toggle from '@/components/dls/Toggle/Toggle';
import { selectIsHideAyahEnabled, setIsHideAyahEnabled } from '@/redux/slices/QuranReader/hideAyah';

// FORK: hide-ayah memorization mode toggle. Sits at the top of the
// SettingsDrawer scrollable area, above the VersePreview.
const HideAyahToggle: React.FC = () => {
  const dispatch = useDispatch();
  const isHideAyahEnabled = useSelector(selectIsHideAyahEnabled);

  return (
    <div className={styles.container}>
      <Toggle
        id="hide-ayah-toggle"
        label="Hide ayah (memorization mode)"
        checked={isHideAyahEnabled}
        onChange={(checked) => dispatch(setIsHideAyahEnabled(checked))}
      />
    </div>
  );
};

export default HideAyahToggle;
