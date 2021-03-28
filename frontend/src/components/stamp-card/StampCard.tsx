import React from "react";
import {Stamp} from "../../model/stamps";
import "./StampCard.css"
import EmptyImage from "./empty.png"

export interface Props {
    stamp: Stamp
}

export class StampCard extends React.Component<Props, {}> {
    render() {
        return (<div className="stamp-card">
            <div className="stamp-card-id">№ {this.props.stamp.id} [{this.props.stamp.value}₽] // {this.props.stamp.year}</div>
            <div className="stamp-card-image-container">
                <div className="stamp-card-image-container-dummy"/>
                <img draggable="false" alt={"Image of stamp " + this.props.stamp.id} className="stamp-image"
                     src={(this.props.stamp.imageUrl ?? EmptyImage).toString()}/>
            </div>
        </div>);
    }
}