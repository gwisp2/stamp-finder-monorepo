import React from "react";
import {Stamp} from "../../model/stamps";
import "./StampCard.css"
import EmptyImage from "./empty.png"
import ShoppingBasket from '@material-ui/icons/ShoppingBasket';

export interface Props {
    stamp: Stamp
}

export class StampCard extends React.Component<Props, {}> {
    render() {
        const s = this.props.stamp;
        return (<div className="position-relative shadow-sm bg-light border border-secondary rounded p-2">
            <div className="stamp-card-id mb-1">№ {s.id} [{s.value}₽] // {s.year}</div>
            <div className="stamp-card-image-container mb-1">
                <div className="stamp-card-image-container-dummy"/>
                <img draggable="false" alt={"Image of stamp " + s.id} className="stamp-image"
                     src={(s.imageUrl ?? EmptyImage).toString()}/>
            </div>
            <a className={"w-100 btn " + (s.present ? "btn-success" : "btn-secondary")} href={s.page.toString()}
               target="_blank" rel="noreferrer">{s.present ? <span><ShoppingBasket/> Купить</span> : "Нет в наличии"}</a>
        </div>);
    }
}