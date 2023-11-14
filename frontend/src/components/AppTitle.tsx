import { Page } from '../pages/page.ts';
import React from 'react';
import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import pages from '../pages';

export function AppTitle(props: { switchPage: (p: Page) => void }): React.ReactNode {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const closeNav = () => setAnchorElNav(null);
  const handleNavItem = (target: Page) => {
    props.switchPage(target);
    closeNav();
  };
  return (
    <>
      <Typography variant="h6" component="div">
        Stamp Finder
      </Typography>
      <Box ml="auto">
        <IconButton
          size="large"
          aria-label="navigation menu"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          color="inherit"
          onClick={(e) => setAnchorElNav(e.currentTarget)}
        >
          <MenuIcon />
        </IconButton>
        <Menu anchorEl={anchorElNav} keepMounted open={Boolean(anchorElNav)} onClose={closeNav}>
          {pages.map((page) => (
            <MenuItem key={page.key} onClick={() => handleNavItem(page)}>
              <ListItemIcon>{page.navIcon}</ListItemIcon>
              <ListItemText>{page.navText}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </>
  );
}
