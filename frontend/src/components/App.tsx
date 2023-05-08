import { RestartAlt, Star, StarBorder } from '@mui/icons-material';
import { Box, Checkbox, InputLabel, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { Stamp, useSfDatabase } from 'api/SfDatabase';
import plural from 'plural-ru';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useLatest } from 'react-use';
import { FixedSizeGrid } from 'react-window';
import { useFavoritesStore } from '../api/FavoritesManager';
import { SearchOptions } from '../model';
import { AppLayout } from './AppLayout';
import { SearchOptionsForm, createFormDataFromSearchOptions, useSearchOptionsForm } from './SearchOptionsForm';
import { ShareUrlButton } from './ShareUrlButton';
import { StampList } from './StampList';

function generateUrl(searchOptions: SearchOptions): string {
  const loc = document.location;
  return loc.protocol + '//' + loc.host + loc.pathname + '?' + searchOptions.toUrlSearchString();
}

const App: React.FC = () => {
  const initialOptions = useMemo(() => SearchOptions.fromUrlParams(new URLSearchParams(document.location.search)), []);

  // Scrolling
  const stampsGridRef = useRef<FixedSizeGrid<Stamp[]>>(null);

  // Search options
  const db = useSfDatabase();
  const searchOptionsForm = useSearchOptionsForm(db, initialOptions);
  const [searchOptions, setSearchOptions] = useState(initialOptions);
  const latestSearchOptions = useLatest(searchOptions);
  const handleSearchOptions = useCallback((searchOptions: SearchOptions) => {
    window.history.replaceState(null, '', generateUrl(searchOptions));
    setSearchOptions(searchOptions);
    stampsGridRef.current?.scrollTo({ scrollTop: 0 });
  }, []);
  const handleReset = useCallback(() => {
    searchOptionsForm.reset(createFormDataFromSearchOptions(db, SearchOptions.Default), {});
  }, [db]);

  // Favorites
  const [showFavorites, setShowFavorites] = useState(false);
  const favoriteStamps = useFavoritesStore((store) => (showFavorites ? store.filterFavorites(db.stamps) : []));

  // Filter list of stamps
  let stamps: Stamp[];
  if (!showFavorites) {
    stamps = searchOptions.filterAndSort(db.stamps);
  } else {
    stamps = favoriteStamps;
  }

  // Rendering
  const drawerContent = (
    <Box height="100%" display={!showFavorites ? 'flex' : 'none'} flexDirection="column">
      <SearchOptionsForm db={db} handle={searchOptionsForm} onChange={handleSearchOptions} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <InputLabel component="div">
          {`По запросу ${plural(stamps.length, 'найдена', 'найдено', 'найдено')} ${stamps.length} ${plural(
            stamps.length,
            'марка',
            'марки',
            'марок',
          )}`}
          .
        </InputLabel>
      </Box>
      <Box flexBasis={1} flexGrow={1} maxHeight="100%"></Box>
      <Box display="flex" justifyContent="end" gap={1}>
        <ShareUrlButton
          makeShareData={useCallback(
            () => ({
              title: 'Поиск марок',
              url: generateUrl(latestSearchOptions.current),
            }),
            [],
          )}
        />
        <Button variant="outlined" onClick={handleReset} startIcon={<RestartAlt />}>
          Сбросить
        </Button>
      </Box>
    </Box>
  );

  const mainContent = <StampList innerRef={stampsGridRef} stamps={stamps} />;
  const mainTitle = (
    <>
      <Typography variant="h6" component="div" flexGrow={1}>
        Stamp Finder
      </Typography>
      <Checkbox
        sx={{ color: 'inherit !important' }}
        checked={showFavorites}
        onChange={(e) => setShowFavorites(e.target.checked)}
        icon={<StarBorder />}
        checkedIcon={<Star />}
      />
    </>
  );
  return <AppLayout drawerContent={drawerContent} mainContent={mainContent} mainTitle={mainTitle} />;
};

export default App;
