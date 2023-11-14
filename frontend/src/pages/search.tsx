import { Page } from './page.ts';
import React, { createRef, useCallback, useEffect } from 'react';
import { Box, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { SearchOptionsForm } from '../components/SearchOptionsForm.tsx';
import { SearchOptions } from '../model';
import { ShareUrlButton } from '../components/ShareUrlButton.tsx';
import plural from 'plural-ru';
import Button from '@mui/material/Button';
import { RestartAlt } from '@mui/icons-material';
import { useAppStore } from '../state/app.store.ts';
import { StampList } from '../components/StampList.tsx';
import { useSetDrawerContent } from '../state/drawer.tsx';
import { FixedSizeGrid } from 'react-window';
import { Stamp } from '../api/SfDatabase.ts';

function ShareSearchUrlButton() {
  const options = useAppStore((s) => s.searchOptions);
  const loc = document.location;
  const url = loc.protocol + '//' + loc.host + loc.pathname + '?' + options.toUrlSearchString();
  return <ShareUrlButton title="Stamp Finder" url={url} />;
}

function SearchPageDrawerContent() {
  // Extract objects from global store
  const nStampsFound = useAppStore((s) => s.foundStamps.length);
  const database = useAppStore((s) => s.database);
  const setSearchOptions = useAppStore((s) => s.setSearchOptions);
  const formHandle = useAppStore((s) => s.searchFormHandle);
  const searchFormShopFieldArray = useAppStore((s) => s.searchFormShopFieldArray);

  const handleReset = useCallback(() => {
    formHandle.reset(SearchOptions.Default.toFormData(database), {});
  }, [database, formHandle]);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <SearchOptionsForm
        db={database}
        handle={formHandle}
        shopFieldArray={searchFormShopFieldArray}
        onChange={setSearchOptions}
      />
      <InputLabel component="div">
        {`По запросу ${plural(nStampsFound, 'найдена', 'найдено', 'найдено')} ${nStampsFound} ${plural(
          nStampsFound,
          'марка',
          'марки',
          'марок',
        )}`}
      </InputLabel>
      <Box flexBasis={1} flexGrow={1} maxHeight="100%"></Box>
      <Box display="flex" justifyContent="end" gap={1}>
        <ShareSearchUrlButton />
        <Button variant="outlined" onClick={handleReset} startIcon={<RestartAlt />}>
          Сбросить{' '}
        </Button>
      </Box>
    </Box>
  );
}

function SearchPageMainContent() {
  useSetDrawerContent(<SearchPageDrawerContent />);
  const foundStamps = useAppStore((s) => s.foundStamps);
  const gridRef = createRef<FixedSizeGrid<Stamp[]>>();
  useEffect(() => {
    gridRef.current?.scrollTo({ scrollTop: 0 });
  }, [foundStamps]);
  return <StampList stamps={foundStamps} innerRef={gridRef}></StampList>;
}

export const Search: Page = {
  key: 'search',
  navIcon: <SearchIcon />,
  navText: 'Поиск',
  renderContent(): React.ReactNode {
    return <SearchPageMainContent />;
  },
  renderSidebar(): React.ReactNode {
    return <SearchPageDrawerContent />;
  },
};
