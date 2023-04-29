import MoreIcon from '@mui/icons-material/More';
import { Stamp } from 'api/SfDatabase';
import React from 'react';
import { useCloseablePopup } from './popup';

const StampTextInfo: React.FC<{ stamp: Stamp }> = React.memo((props) => {
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

export const StampInfoDropdown: React.FC<{ stamp: Stamp }> = (props) => {
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
