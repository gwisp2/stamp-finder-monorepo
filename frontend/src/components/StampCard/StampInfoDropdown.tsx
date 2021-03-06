import MoreIcon from '@mui/icons-material/More';
import React from 'react';
import { Stamp } from 'state/api/stamps';
import { useCloseablePopup } from './popup';

const StampTextInfo: React.VFC<{ stamp: Stamp }> = React.memo((props) => {
  const s = props.stamp;
  return (
    <div>
      {s.categories.length !== 0 && (
        <div className="stamp-card-labelvalue">
          <span className="label">Категории</span>
          <span className="value">{s.categories.join(', ')}</span>
        </div>
      )}
      {s.series && (
        <div className="stamp-card-labelvalue">
          <span className="label">Серия</span>
          <span className="value">{s.series}</span>
        </div>
      )}
      {s.name && (
        <div className="stamp-card-labelvalue">
          <span className="label">Название</span>
          <span className="value">{s.name}</span>
        </div>
      )}
    </div>
  );
});

export const StampInfoDropdown: React.VFC<{ stamp: Stamp }> = (props) => {
  const popup = useCloseablePopup(<StampTextInfo stamp={props.stamp} />);
  return (
    <div ref={popup.containerRef} {...popup.containerProps}>
      <div ref={popup.setReferenceElement}>
        <MoreIcon fontSize="small" className="d-block" />
      </div>
      {popup.elements}
    </div>
  );
};
