import React from 'react';
import {SearchOptions, Stamp, StampDb} from "./model/stamps";
import {fetchStampsDb} from "./model/stamps-fetcher";
import {StampSearchOptionsSelector} from "./components/stamp-search-options-selector/StampSearchOptionsSelector";
import 'bootstrap/dist/css/bootstrap.min.css';
import SearchRounded from '@material-ui/icons/SearchRounded';
import _ from "underscore";
import {History as RHistory} from "history";
import {StampList} from "./components/stamp-list/StampList";

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
            <div className="container">
                <nav className="navbar navbar-expand navbar-dark bg-dark mb-3">
                    <a className="navbar-brand" href="/"><SearchRounded/> Stamp Finder</a>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto"/>
                    </div>
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item active">
                            <a className="nav-link" href="https://github.com/gwisp2/stamp-finder">
                                <div className="github-link">
                                    <img alt="Github logo" className="github-logo" src="github-logo.png"/>
                                    <span>Github</span>
                                </div>
                            </a>
                        </li>
                    </ul>
                </nav>
                <div className="row">
                    <div className="search-options-column col-xl-3 mb-3">
                        <div
                            className="search-options-container position-sticky bg-light p-2 rounded border shadow-sm border-secondary">
                            <StampSearchOptionsSelector
                                defaultOptions={SearchOptions.Default}
                                startYear={minYear}
                                endYear={maxYear}
                                listOfCategories={listOfCategories}
                                numberOfFoundStamps={stamps.length}
                                onChange={(options) => this.onSearchOptionsChange(options)}>
                            </StampSearchOptionsSelector>
                        </div>
                    </div>
                    <div className="col-xl-9">
                        <StampList stamps={stamps}/>
                    </div>
                </div>
            </div>
        );
    }

    private onSearchOptionsChange(newOptions: SearchOptions) {
        const params = newOptions.toUrlParams()
        this.props.history.push("/search?" + params.toString())
    }
}

export default App;
