import { AmountFoundMessage } from 'components/AmountFoundMessage';
import { AppNavbar } from 'components/AppNavbar';
import React, { useCallback, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { selectStamps } from 'state/api.slice';
import { useAppSelector } from 'state/hooks';
import { SearchOptions } from '../model/search-options';
import { ScrollToTopButton } from './ScrollToTopButton';
import { StampList } from './StampList';
import { StampSearchOptionsSelector } from './StampSearchOptionsSelector';

const App: React.VFC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = useCallback((newOptions: SearchOptions) => {
    const params = newOptions.toUrlParams();
    navigate('/search?' + params.toString());
    window.scrollTo(0, 0);
  }, []);

  const searchOptions = SearchOptions.fromUrlSearchString(location.search);
  const stamps = useAppSelector((s) => selectStamps(s, searchOptions));
  const cardDisplayOptions = useMemo(() => ({}), []);
  const [afterOptionsDiv, setAfterOptionsDiv] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <Container>
        <AppNavbar />
        <Row>
          <Col xl={4} xxl={3} className="search-options-column mb-3">
            <div className="search-options-container position-sticky bg-light p-2 rounded border shadow-sm border-secondary">
              <StampSearchOptionsSelector
                options={searchOptions}
                onChange={handleSearch}
                bottomInfo={<AmountFoundMessage amount={stamps.length} />}
              ></StampSearchOptionsSelector>
            </div>
            <div ref={setAfterOptionsDiv} style={{ height: '1px' }}></div>
          </Col>
          <Col xl={8} xxl={9}>
            <StampList stamps={stamps} options={cardDisplayOptions} />
          </Col>
        </Row>
      </Container>
      {afterOptionsDiv && <ScrollToTopButton target={afterOptionsDiv} />}
    </>
  );
};

export default App;
