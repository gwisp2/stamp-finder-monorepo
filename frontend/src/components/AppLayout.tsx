import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Divider, IconButton, SwipeableDrawer, Toolbar } from '@mui/material';
import React, { useState } from 'react';
import { useWindowSize } from 'react-use';

export interface AppLayoutProps {
  drawerTitle?: React.ReactNode;
  drawerContent?: React.ReactNode;
  mainTitle?: React.ReactNode;
  mainContent?: React.ReactNode;
}

export function AppLayout({ drawerContent, drawerTitle, mainContent, mainTitle }: AppLayoutProps): React.ReactElement {
  const windowSize = useWindowSize();
  const isScreenSmall = windowSize.width <= 600;
  const [drawerOpened, setDrawerOpened] = useState(false);

  const drawerWidth = 'min(360px, 90vw)';
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <SwipeableDrawer
        anchor="left"
        variant={isScreenSmall ? 'temporary' : 'permanent'}
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          flexShrink: 0,
        }}
        disableSwipeToOpen={true}
        onOpen={() => setDrawerOpened(true)}
        onClose={() => setDrawerOpened(false)}
        open={!isScreenSmall || drawerOpened}
      >
        <Toolbar>{drawerTitle}</Toolbar>
        <Divider />
        <Box flexGrow={1} p={3}>
          {drawerContent}
        </Box>
      </SwipeableDrawer>
      <Box display="flex" flexDirection="column" flexGrow={1} height="100%">
        <AppBar position="static">
          <Toolbar sx={{ alignItems: 'center' }}>
            {isScreenSmall && (
              <IconButton color="inherit" edge="start" onClick={() => setDrawerOpened(true)}>
                <MenuIcon />
              </IconButton>
            )}
            {mainTitle}
          </Toolbar>
        </AppBar>
        <Box component="main" flexGrow={1}>
          {mainContent}
        </Box>
      </Box>
    </Box>
  );
}
