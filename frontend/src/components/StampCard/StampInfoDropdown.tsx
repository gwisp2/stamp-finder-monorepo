import MoreIcon from '@mui/icons-material/More';
import React, { useCallback, useState } from 'react';
import { usePopper } from 'react-popper';
import { Stamp } from 'state/api/stamps';
import { PopperContainer } from './PopperContainer';

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
  const [isOpen, setOpen] = useState(false);
  const openPopup = useCallback(() => setOpen(true), []);
  const closePopup = useCallback(() => setOpen(false), []);

  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [],
  });
  return (
    <>
      <div ref={setReferenceElement} onClick={openPopup} onMouseEnter={openPopup} onMouseLeave={closePopup}>
        <MoreIcon fontSize="small" className="d-block" />
      </div>
      {isOpen && (
        <PopperContainer
          ref={setPopperElement}
          onBlur={closePopup}
          onMouseEnter={openPopup}
          onMouseLeave={closePopup}
          style={styles.popper}
          {...attributes.popper}
        >
          <StampTextInfo stamp={props.stamp} />
        </PopperContainer>
      )}
    </>
  );
};
