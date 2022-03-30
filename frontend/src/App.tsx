import SearchRounded from '@mui/icons-material/SearchRounded';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchShopsDb, fetchStampsDb } from 'model';
import React, { useCallback } from 'react';
import { Col, Container, Nav, Navbar, Row } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import _ from 'underscore';
import { StampList } from './components/StampList';
import { StampSearchOptionsSelector } from './components/StampSearchOptionsSelector';
import { ShopDb } from './model/shops';
import { SearchOptions, StampDb } from './model/stamps';

const loadData = async () => {
  const [shopsDb, stampsDb] = await Promise.all([
    fetchShopsDb(new URL('data/shops.json', document.baseURI)),
    fetchStampsDb(new URL('data/stamps.json', document.baseURI)),
  ]);
  shopsDb.wireToStampDb(stampsDb);
  return [shopsDb, stampsDb] as const;
};

const App: React.VFC<Record<string, never>> = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryOptions = { refetchOnWindowFocus: false, cacheTime: Infinity, staleTime: Infinity };
  const { data } = useQuery('data', loadData, queryOptions);
  const shopsDb = (data && data[0]) ?? new ShopDb([]);
  const stampDb = (data && data[1]) ?? new StampDb([]);

  const handleSearch = useCallback((newOptions: SearchOptions) => {
    const params = newOptions.toUrlParams();
    navigate('/search?' + params.toString());
    window.scrollTo(0, 0);
  }, []);

  const searchOptions = SearchOptions.fromUrlParams(new URLSearchParams(location.search));
  const stamps = stampDb.findStamps(searchOptions);

  const knownYears = stampDb.stamps.map((v) => v.year).filter((y) => y !== null);
  const minYear = knownYears.length >= 1 ? (_.min(knownYears) as number) : 2020;
  const maxYear = knownYears.length >= 1 ? (_.max(knownYears) as number) : 2020;

  const listOfCategories = Array.from(new Set(stampDb.stamps.flatMap((s) => s.categories)));
  listOfCategories.sort();

  return (
    <Container>
      <Navbar expand="sm" variant="dark" bg="dark" className="mb-3 px-3 py-2">
        <Navbar.Brand href="/">
          <SearchRounded /> Stamp Finder
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" />
          <Nav className="align-items-end">
            <Nav.Link href="https://github.com/gwisp2/stamp-finder">
              <span className="link-with-icon">
                <img alt="Github logo" className="github-logo" src="github-logo.png" />
                <span>Github</span>
              </span>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Row>
        <Col xl={4} xxl={3} className="search-options-column mb-3">
          <div className="search-options-container position-sticky bg-light p-2 rounded border shadow-sm border-secondary">
            <StampSearchOptionsSelector
              options={searchOptions}
              startYear={minYear}
              endYear={maxYear}
              listOfCategories={listOfCategories}
              listOfShops={shopsDb.shops}
              numberOfFoundStamps={stamps.length}
              onChange={handleSearch}
            ></StampSearchOptionsSelector>
          </div>
        </Col>
        <Col xl={8} xxl={9}>
          <StampList stamps={stamps} />
        </Col>
      </Row>
    </Container>
  );
};

export default App;
