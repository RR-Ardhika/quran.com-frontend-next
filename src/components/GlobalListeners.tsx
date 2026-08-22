import React from 'react';

import DisableAnimationsUntilHydration from './DisableAnimationsUntilHydration';
import GlobalPersistGateHydrationListener from './GlobalPersistGateHydrationListener';

import GlobalKeyboardListeners from '@/components/GlobalKeyboardListeners';
// FORK: GlobalScrollListener removed (QUR-005) — the merged header is always visible.
import GuestBookmarksMigrationModal from '@/components/GuestBookmarksMigrationModal';

const GlobalListeners = () => {
  return (
    <>
      <GlobalKeyboardListeners />
      <GlobalPersistGateHydrationListener />
      <DisableAnimationsUntilHydration />
      <GuestBookmarksMigrationModal />
    </>
  );
};

export default GlobalListeners;
