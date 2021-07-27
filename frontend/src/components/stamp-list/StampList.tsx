import React from "react";
import {Stamp} from "../../model/stamps";
import {StampCard} from "../stamp-card/StampCard";
import InfiniteScroll from 'react-infinite-scroller';

export interface StampListProps {
    stamps: Array<Stamp>
}

export interface StampListState {
    allItems: Array<Stamp>
    shownItems: Array<Stamp>
}

export class StampList extends React.Component<StampListProps, StampListState> {
    static BatchSize = 20

    constructor(props: StampListProps) {
        super(props);
        this.state = {
            allItems: Array<Stamp>(),
            shownItems: Array<Stamp>()
        }
        this.showMoreItems = this.showMoreItems.bind(this);
    }

    static getDerivedStateFromProps(props: StampListProps, currentState: StampListState | null) {
        if (currentState === null || props.stamps !== currentState.allItems) {
            return {
                allItems: props.stamps,
                shownItems: props.stamps.slice(0, StampList.BatchSize)
            }
        } else {
            return null
        }
    }

    private showMoreItems() {
        const startIndex = this.state.shownItems.length
        const endIndex = Math.min(this.props.stamps.length, this.state.shownItems.length + StampList.BatchSize);
        this.setState({
            shownItems: this.state.shownItems.concat(this.props.stamps.slice(startIndex, endIndex))
        })
    }

    render() {
        return (
            <InfiniteScroll
                hasMore={this.state.shownItems.length !== this.props.stamps.length}
                loader={<h4>Загрузка...</h4>}
                loadMore={this.showMoreItems}
                className="row"
            >
                {this.state.shownItems.map((s) => {
                    return (<div className="col-sm-6 col-md-4 col-lg-3 mb-2" key={s.id}>
                        <StampCard stamp={s}/>
                    </div>)
                })}
            </InfiniteScroll>
        );
    }
}