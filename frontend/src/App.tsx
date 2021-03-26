import React from 'react';
import {SearchOptions, SortOrder, Stamp, StampDb, StampField, StampSort} from "./model/stamps";
import {StampList} from "./components/stamp-list/StampList";
import {fetchStampsDb} from "./model/stamps-fetcher";
import {NumberRange} from "./model/number-range";
import {StampSearchOptionsSelector} from "./components/stamp-search-options-selector/StampSearchOptionsSelector";

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
        fetchStampsDb(new URL("stamps.json", document.baseURI))
            .then((db) => this.setState({stampDb: db}))
    }

    render() {
        const stampDb = this.state.stampDb ? this.state.stampDb : new StampDb(Array<Stamp>());
        const stamps = stampDb.findStamps(this.state.searchOptions);
        return (
            <div className="root-container">
                <div className="header"><a href="/">Поиск марок</a></div>
                <div className="search-options-panel">
                    <StampSearchOptionsSelector
                        defaultOptions={App.DefaultSearchOptions}
                        onChange={(newOptions) => this.setState({searchOptions: newOptions})}>
                    </StampSearchOptionsSelector>
                </div>
                <div>
                    <StampList stamps={stamps}/>
                </div>
            </div>
        );
    }
}

export default App;
