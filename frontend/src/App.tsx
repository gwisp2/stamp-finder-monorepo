import React from 'react';
import {SearchOptions, Stamp, StampDb} from "./model/stamps";
import {fetchStampsDb} from "./model/stamps-fetcher";
import {StampSearchOptionsSelector} from "./components/stamp-search-options-selector/StampSearchOptionsSelector";
import 'bootstrap/dist/css/bootstrap.min.css';
import SearchRounded from '@material-ui/icons/SearchRounded';
import AttachMoney from '@material-ui/icons/AttachMoney';
import _ from "underscore";
import {History as RHistory} from "history";
import {StampList} from "./components/stamp-list/StampList";
import { Container, Nav, Navbar, Row, Col } from 'react-bootstrap';

interface AppProps {
    history: RHistory
}

interface AppState {
    stampDb: StampDb | null
}

class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {
            stampDb: null
        };
        this.onSearchOptionsChange = this.onSearchOptionsChange.bind(this);
    }

    componentDidMount() {
        fetchStampsDb(new URL("data/stamps.json", document.baseURI))
            .then((db) => this.setState({stampDb: db}))
    }

    render() {
        const stampDb = this.state.stampDb ? this.state.stampDb : new StampDb(Array<Stamp>());
        const searchOptions = SearchOptions.fromUrlParams(new URLSearchParams(this.props.history.location.search));
        const stamps = stampDb.findStamps(searchOptions);

        const knownYears = stampDb.stamps.map((v) => v.year).filter((y) => y !== null);
        const minYear = knownYears.length >= 1 ? _.min(knownYears) as number : 2020;
        const maxYear = knownYears.length >= 1 ? _.max(knownYears) as number : 2020;

        const listOfCategories = Array.from(new Set(stampDb.stamps.flatMap((s) => s.categories)));
        listOfCategories.sort();

        return (
            <Container>
                <Navbar expand="sm" variant="dark" bg="dark" className="mb-3 px-3 py-2">
                    <Navbar.Brand href="/"><SearchRounded/> Stamp Finder</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto"/>
                        <Nav className="align-items-end">
                            <Nav.Link href="https://github.com/gwisp2/stamp-finder">
                                <span className="link-with-icon">
                                    <img alt="Github logo" className="github-logo" src="github-logo.png"/>
                                    <span>Github</span>
                                </span>
                            </Nav.Link>
                            <Nav.Link href="https://github.com/gwisp2/gwisp2/blob/main/DONATE.md">
                                <span className="link-with-icon">
                                    <AttachMoney/>
                                    <span>Donate</span>
                                </span>
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Row>
                    <Col xl={3} className="search-options-column mb-3">
                        <div
                            className="search-options-container position-sticky bg-light p-2 rounded border shadow-sm border-secondary">
                            <StampSearchOptionsSelector
                                options={searchOptions}
                                startYear={minYear}
                                endYear={maxYear}
                                listOfCategories={listOfCategories}
                                numberOfFoundStamps={stamps.length}
                                onChange={(options) => this.onSearchOptionsChange(options)}>
                            </StampSearchOptionsSelector>
                        </div>
                    </Col>
                    <Col xl={9}>
                        <StampList stamps={stamps}/>
                    </Col>
                </Row>
            </Container>
        );
    }

    private onSearchOptionsChange(newOptions: SearchOptions) {
        const params = newOptions.toUrlParams();
        this.props.history.push("/search?" + params.toString());
        window.scrollTo(0, 0);
    }
}

export default App;
