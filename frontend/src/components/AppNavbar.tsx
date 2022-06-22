import SearchRounded from '@mui/icons-material/SearchRounded';
import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';

export const AppNavbar = React.memo(() => {
  return (
    <Navbar expand="sm" variant="dark" bg="dark" className="mb-3 px-3 py-2">
      <Navbar.Brand href="/">
        <SearchRounded /> Stamp Finder
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto" />
        <Nav className="align-items-end">
          <Nav.Link href="https://github.com/gwisp2/stamp-finder-monorepo" target="_blank">
            <span className="link-with-icon">
              <img alt="Github logo" className="github-logo" src="github-logo.png" />
              <span>Github</span>
            </span>
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
});
AppNavbar.displayName = 'AppNavbar';
