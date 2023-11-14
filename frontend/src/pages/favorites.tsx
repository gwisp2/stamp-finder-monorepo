import { Page } from './page.ts';
import React from 'react';
import StarIcon from '@mui/icons-material/Star';
import { useAppStore } from '../state/app.store.ts';
import { StampList } from '../components/StampList.tsx';
import { useFavoritesStore } from '../state/favorites.store.ts';

function FavoritesPageMainContent() {
  const database = useAppStore((s) => s.database);
  const filterFavorites = useFavoritesStore((s) => s.filterFavorites);
  const favoriteStamps = filterFavorites(database.stamps);
  return <StampList stamps={favoriteStamps}></StampList>;
}

export const Favorites: Page = {
  key: 'favourites',
  navIcon: <StarIcon />,
  navText: 'Избранное',
  renderContent(): React.ReactNode {
    return <FavoritesPageMainContent />;
  },
  renderSidebar(): React.ReactNode {
    return <></>;
  },
};
