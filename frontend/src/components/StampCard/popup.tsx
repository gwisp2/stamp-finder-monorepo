import { ReactNode, useCallback, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import styled from 'styled-components';
import useOnClickOutside from 'use-onclickoutside';

export const PopperContainer = styled.div`
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  background-color: white;
  padding: 5px;
  font-size: 14px;
  z-index: 10;
`;

export const useCloseablePopup = (children: ReactNode) => {
  const [isOpen, setOpen] = useState(false);
  const openPopup = useCallback(() => setOpen(true), []);
  const closePopup = useCallback(() => setOpen(false), []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  useOnClickOutside(containerRef, isOpen ? closePopup : null);
  const { styles, attributes } = usePopper(referenceElement, popperElement);

  const elements = isOpen ? (
    <PopperContainer ref={setPopperElement} style={styles.popper} {...attributes.popper}>
      {children}
    </PopperContainer>
  ) : (
    <></>
  );

  const containerProps = {
    onTouchStart: openPopup,
    onClick: openPopup,
    onMouseEnter: openPopup,
    onMouseLeave: closePopup,
  };

  return { elements, containerRef, setReferenceElement, openPopup, closePopup, setOpen, isOpen, containerProps };
};
