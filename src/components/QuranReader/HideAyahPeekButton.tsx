// FORK: hide-ayah — touch peek button (QUR-005).
//
// Touch devices have no hover, so hide-ayah's hover reveal is unreachable there. This
// button mirrors the hold-modifier keyboard peek: press-and-hold reveals (current ayah
// while reciting, else the topmost visible page), release re-hides. Hold (not toggle)
// keeps it consistent with the keyboard peek and unable to get stuck revealed.
import React from 'react';

import { useSelector } from 'react-redux';

import styles from './HideAyahPeekButton.module.scss';

import useHideAyahPeek from '@/components/QuranReader/hooks/useHideAyahPeek';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import ShowIcon from '@/icons/show.svg';
import { selectIsHideAyahEnabled } from '@/redux/slices/QuranReader/hideAyah';

/**
 * Hold-to-peek reveal button for hide-ayah mode. Rendered only when hide-ayah is on.
 * The wrapper span owns the hold gestures (dls Button only forwards onClick/onPointerDown).
 *
 * @returns {JSX.Element | null} the button, or null when hide-ayah is disabled
 */
const HideAyahPeekButton = (): JSX.Element | null => {
  const isHideAyahEnabled = useSelector(selectIsHideAyahEnabled);
  const { peek, clear } = useHideAyahPeek();

  if (!isHideAyahEnabled) return null;

  return (
    <span
      role="presentation"
      onPointerDown={(e) => {
        e.preventDefault();
        peek();
      }}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Button
        tooltip="Hold to peek"
        ariaLabel="Hold to peek at the hidden ayah"
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
      >
        <ShowIcon className={styles.icon} />
      </Button>
    </span>
  );
};

export default HideAyahPeekButton;
