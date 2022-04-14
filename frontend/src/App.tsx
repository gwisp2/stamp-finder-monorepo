import SearchRounded from '@mui/icons-material/SearchRounded';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useCallback, useMemo } from 'react';
import { Col, Container, Nav, Navbar, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useShopsDb, useStampsDb } from 'service/AppApi';
import _ from 'underscore';
import { StampList } from './components/StampList';
import { StampSearchOptionsSelector } from './components/StampSearchOptionsSelector';
import { ShopDb } from './model/shops';
import { SearchOptions, StampDb } from './model/stamps';

const App: React.VFC<Record<string, never>> = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const shopsDbQuery = useShopsDb();
  const stampsDbQuery = useStampsDb();

  const [shopsDb, stampDb] = useMemo(() => {
    const shopsDb = shopsDbQuery.data;
    const stampDb = stampsDbQuery.data;
    if (shopsDb && stampDb) {
      shopsDb.wireToStampDb(stampDb);
    }
    return [shopsDb ?? new ShopDb([]), stampDb ?? new StampDb([])] as const;
  }, [shopsDbQuery.data, stampsDbQuery.data]);

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
            <Nav.Link href="https://github.com/gwisp2/stamp-finder-monorepo">
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
          <StampList stamps={stamps} searchOptions={searchOptions} />
        </Col>
      </Row>
    </Container>
  );
};

export default App;
