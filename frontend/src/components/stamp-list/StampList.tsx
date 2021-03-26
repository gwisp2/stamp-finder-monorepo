import React from "react";
import {Stamp} from "../../model/stamps";
import './StampList.css'

export interface StampListProps {
    stamps: Array<Stamp>
}

export class StampList extends React.Component<StampListProps, {}> {
    render() {
        return (<div className="stamp-list">
            {this.props.stamps.map((s) => {
                return (<div key={s.id} className="stamp-card">
                    <div className="stamp-card-id">№ {s.id} [{s.value}₽] // {s.year}</div>
                    <div>
                        <img draggable="false" alt={"Image of stamp " + s.id} className="stamp-image" src={(s.imageUrl ?? new URL("empty.png", document.baseURI)).toString()}/>
                    </div>
                </div>)
            })}
        </div>);
    }
}