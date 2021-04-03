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
        return (<div className="position-relative shadow-sm bg-light border border-secondary rounded p-2">
            <div className="stamp-card-image-container">
                <div className="stamp-card-image-container-dummy"/>
                <img draggable="false" alt={"Image of stamp " + s.id} className="stamp-image"
                     src={(s.imageUrl ?? EmptyImage).toString()}/>
            </div>
            <div className="stamp-card-id">№ {s.id} [{s.value}₽] // {s.year}</div>
            <a className={"w-100 btn " + (s.present ? "btn-success" : "btn-secondary")} href={s.page.toString()} target="_blank" rel="noreferrer">{s.present ? "Купить" : "Нет в наличии"}</a>
        </div>);
    }
}