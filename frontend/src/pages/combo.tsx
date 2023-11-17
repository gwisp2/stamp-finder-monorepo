import { Page } from './page.ts';
import React from 'react';
import { Box, InputLabel } from '@mui/material';
import plural from 'plural-ru';
import { useAppStore } from '../state/app.store.ts';
import { FormResetButton } from '../components/FormBits.tsx';
import { ComboOptions } from '../model/ComboOptions.ts';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { ComboOptionsForm } from '../components/ComboOptionsForm.tsx';
import { ComboList } from '../components/ComboList.tsx';

function ComboPageDrawerContent() {
  // Extract objects from global store
  const nStampsAccepted = useAppStore((s) => s.comboAcceptedStamps.length);
  const database = useAppStore((s) => s.database);
  const formHandle = useAppStore((s) => s.comboFormHandle);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <ComboOptionsForm handle={formHandle} />
      <InputLabel component="div">
        {`По запросу подойдёт ${nStampsAccepted} ${plural(nStampsAccepted, 'марка', 'марки', 'марок')}`}
      </InputLabel>
      <Box flexBasis={1} flexGrow={1} maxHeight="100%"></Box>
      <Box display="flex" justifyContent="end" gap={1}>
        <FormResetButton context={formHandle.context} defaultData={ComboOptions.Default.toFormData(database)} />
      </Box>
    </Box>
  );
}

function ComboPageMainContent() {
  const combos = useAppStore((s) => s.foundCombos);
  return <ComboList combos={combos}></ComboList>;
}

export const Combo: Page = {
  key: 'combo',
  navIcon: <ViewModuleIcon />,
  navText: 'Комбинации',
  renderContent(): React.ReactNode {
    return <ComboPageMainContent />;
  },
  renderSidebar(): React.ReactNode {
    return <ComboPageDrawerContent />;
  },
};
