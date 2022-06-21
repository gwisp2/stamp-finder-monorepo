import MoreIcon from '@mui/icons-material/More';
import { Stamp } from 'model';
import React, { useCallback, useState } from 'react';
import { usePopper } from 'react-popper';
import styled from 'styled-components';

const PopperContainer = styled.div`
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  background-color: white;
  padding: 5px;
  font-size: 14px;
  z-index: 10;
`;

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
