import React, { useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';

export interface CustomToggleProps {
  variant: string;
}

export interface OnClickProps {
  onClick: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
}

const CustomToggleSpan = styled.span.attrs<CustomToggleProps>((props) => ({
  className: `btn btn-${props.variant} icon-with-text rounded`,
}))<CustomToggleProps>`
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
`;

export const CustomDropdownToggle: React.FC<CustomToggleProps> = (oprops) => {
  const ToggleComponent = useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, OnClickProps>((iprops, ref) => (
        <CustomToggleSpan
          variant={oprops.variant}
          ref={ref}
          onClick={(e) => {
            e.preventDefault();
            iprops.onClick(e);
          }}
        >
          {oprops.children}
        </CustomToggleSpan>
      )),
    [oprops.variant, oprops.children],
  );
  return <Dropdown.Toggle split as={ToggleComponent} variant={oprops.variant} />;
};
