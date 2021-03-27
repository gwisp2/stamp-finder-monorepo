import React from "react";
import {Stamp} from "../../model/stamps";
import './StampList.css'
import InfiniteScroll from "react-infinite-scroll-component";

export interface StampListProps {
    stamps: Array<Stamp>
}

export interface StampListState {
    allItems: Array<Stamp>
    shownItems: Array<Stamp>
}

export class StampList extends React.Component<StampListProps, StampListState> {
    static BatchSize = 50

    constructor(props: StampListProps) {
        super(props);
        this.showMoreItems = this.showMoreItems.bind(this);
    }

    static getDerivedStateFromProps(props: StampListProps, currentState: StampListState|null) {
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
        return (<InfiniteScroll
            hasMore={this.state.shownItems.length !== this.props.stamps.length}
            dataLength={this.state.shownItems.length}
            loader={<h4>Загрузка...</h4>}
            next={this.showMoreItems}
        >
            <div className="stamp-list">
                {this.state.shownItems.map((s) => {
                    return (<div key={s.id} className="stamp-card">
                        <div className="stamp-card-id">№ {s.id} [{s.value}₽] // {s.year}</div>
                        <div>
                            <img draggable="false" alt={"Image of stamp " + s.id} className="stamp-image"
                                 src={(s.imageUrl ?? new URL("empty.png", document.baseURI)).toString()}/>
                        </div>
                    </div>)
                })}
            </div>
        </InfiniteScroll>);
    }
}