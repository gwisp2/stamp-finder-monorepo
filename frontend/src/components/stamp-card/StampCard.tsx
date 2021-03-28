import React from "react";
import {Stamp} from "../../model/stamps";
import "./StampCard.css"
import EmptyImage from "./empty.png"

export interface Props {
    stamp: Stamp
}

export class StampCard extends React.Component<Props, {}> {
    render() {
        const s = this.props.stamp;
        return (<div className="stamp-card">
            <div className="stamp-card-id">№ {s.id} [{s.value}₽] // {s.year}</div>
            <div className="stamp-card-image-container">
                <div className="stamp-card-image-container-dummy"/>
                <img draggable="false" alt={"Image of stamp " + s.id} className="stamp-image"
                     src={(s.imageUrl ?? EmptyImage).toString()}/>
            </div>
            <a className={"stamp-card-link " + (s.present ? "present" : "absent")} href={s.page.toString()} target="_blank" rel="noreferrer">{s.present ? "Купить" : "Нет в наличии"}</a>
        </div>);
    }
}