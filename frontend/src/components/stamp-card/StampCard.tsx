import React from "react";
import { Stamp } from "../../model/stamps";
import "./StampCard.css"
import EmptyImage from "./empty.png"
import ShoppingBasket from '@material-ui/icons/ShoppingBasket';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import { Dropdown } from "react-bootstrap";

export interface Props {
    stamp: Stamp
}

const CustomToggle = React.forwardRef<HTMLAnchorElement, { onClick: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void }>((props, ref) => (
    <span
        className="card-dropdown-toggle"
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            props.onClick(e);
        }}
    ><ArrowDropDown /></span>
));

export class StampCardDropdown extends React.Component<Props, {}> {
    render() {
        const s = this.props.stamp;
        return (<Dropdown align="end">
            <Dropdown.Toggle as={CustomToggle}></Dropdown.Toggle>
            <Dropdown.Menu className="stamp-card-dropdown">
                {s.categories.length !== 0 && (<div className="stamp-card-labelvalue"><span className="label">Категории</span><span className="value">{s.categories.join(', ')}</span></div>) }
                {s.series && (<div className="stamp-card-labelvalue"><span className="label">Серия</span><span className="value">{s.series}</span></div>)}
                {s.name && (<div className="stamp-card-labelvalue"><span className="label">Название</span><span className="value">{s.name}</span></div>)}
            </Dropdown.Menu>
        </Dropdown>);
    }
}

export class StampCard extends React.Component<Props, {}> {
    render() {
        const s = this.props.stamp;
        return (<div className="position-relative shadow-sm bg-light border border-secondary rounded p-2">
            <div className="stamp-card-header mb-1 d-flex justify-content-between"><div>№ {s.id} [{s.value}₽] // {s.year}</div><div><StampCardDropdown stamp={this.props.stamp} /></div></div>
            <div className="stamp-card-image-container mb-1">
                <div className="stamp-card-image-container-dummy" />
                <img loading="lazy" draggable="false" alt={"Image of stamp " + s.id} className="stamp-image"
                    src={(s.imageUrl ?? EmptyImage).toString()} />
            </div>
            <a className={"w-100 btn " + (s.present ? "btn-success" : "btn-secondary")} href={s.page.toString()}
                target="_blank" rel="noreferrer">{s.present ? <span><ShoppingBasket fontSize={"small"} /> Купить</span> : "Нет в наличии"}</a>
        </div>);
    }
}