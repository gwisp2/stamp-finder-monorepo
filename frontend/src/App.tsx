import React from 'react';
import {SearchOptions, SortOrder, Stamp, StampDb, StampField, StampSort} from "./model/stamps";
import {StampList} from "./components/stamp-list/StampList";
import {fetchStampsDb} from "./model/stamps-fetcher";
import {NumberRange} from "./model/number-range";
import {StampSearchOptionsSelector} from "./components/stamp-search-options-selector/StampSearchOptionsSelector";
import 'bootstrap/dist/css/bootstrap.min.css';
import SearchRounded from '@material-ui/icons/SearchRounded';
import _ from "underscore";

interface AppState {
    searchOptions: SearchOptions,
    stampDb: StampDb | null
}

class App extends React.Component<{}, AppState> {
    private static DefaultSearchOptions = new SearchOptions(
        new NumberRange(null, null),
        new NumberRange(1998, null),
        false, new StampSort(StampField.Id, SortOrder.Reversed)
    );

    constructor(props: {}) {
        super(props);
        this.state = {
            searchOptions: App.DefaultSearchOptions,
            stampDb: null
        };
    }

    componentDidMount() {
        fetchStampsDb(new URL("data/stamps.json", document.baseURI))
            .then((db) => this.setState({stampDb: db}))
    }

    render() {
        const stampDb = this.state.stampDb ? this.state.stampDb : new StampDb(Array<Stamp>());
        const stamps = stampDb.findStamps(this.state.searchOptions);

        const knownYears = stampDb.stamps.map((v) => v.year).filter((y) => y !== null);
        const minYear = knownYears.length >= 1 ? _.min(knownYears) as number : 2020;
        const maxYear = knownYears.length >= 1 ? _.max(knownYears) as number : 2020;
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
                        <div className="search-options-container position-sticky bg-light p-2 rounded border shadow-sm border-secondary">
                            <StampSearchOptionsSelector
                                defaultOptions={App.DefaultSearchOptions}
                                startYear={minYear}
                                endYear={maxYear}
                                numberOfFoundStamps={stamps.length}
                                onChange={(newOptions) => this.setState({searchOptions: newOptions})}>
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
}

export default App;
