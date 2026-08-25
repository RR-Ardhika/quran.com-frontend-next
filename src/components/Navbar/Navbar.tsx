import React from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import LanguageDrawer from './LanguageDrawer/LanguageDrawer';
import styles from './Navbar.module.scss';
import NavbarBody from './NavbarBody';
import NavigationDrawer from './NavigationDrawer/NavigationDrawer';
import SearchDrawer from './SearchDrawer/SearchDrawer';
import SettingsDrawer from './SettingsDrawer/SettingsDrawer';

import {
  selectIsLanguageDrawerOpen,
  selectIsNavigationDrawerOpen,
  selectIsSettingsDrawerOpen,
} from '@/redux/slices/navbar';

// FORK: QUR-005 — merged, always-visible header. MobileStickyItemsBar, the
// scroll-driven show/hide (useDebounceNavbarVisibility + hiddenNav) and the
// fundraising Banner were all removed; the navbar is now static and
// NavbarBody hosts the merged ContextMenu row on reader pages.
const Navbar = () => {
  const isNavigationDrawerOpen = useSelector(selectIsNavigationDrawerOpen);
  const isSettingsDrawerOpen = useSelector(selectIsSettingsDrawerOpen);
  const isLanguageDrawerOpen = useSelector(selectIsLanguageDrawerOpen);

  return (
    <>
      <div className={styles.emptySpacePlaceholder} />
      <nav
        className={classNames(styles.container, {
          [styles.dimmed]: isNavigationDrawerOpen || isSettingsDrawerOpen || isLanguageDrawerOpen,
        })}
        data-testid="navbar"
        data-isvisible
      >
        <NavbarBody />
      </nav>
      {/* Drawers rendered outside nav to avoid transform containment issues */}
      <SearchDrawer />
      <SettingsDrawer />
      <NavigationDrawer />
      <LanguageDrawer />
    </>
  );
};

export default Navbar;
