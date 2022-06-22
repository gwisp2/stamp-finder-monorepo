import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useScrollTrigger } from '@mui/material';
import React, { useCallback } from 'react';
import styled from 'styled-components';

const ScrollToTopButtonContainer = styled.div`
  --button-size: 60px;
  --scrollbar-size: calc(100vw - 100%);
  position: fixed;
  top: calc(100vh - var(--button-size) * 1.3);
  left: calc(100vw - var(--button-size) * 1.3 - var(--scrollbar-size));
  width: var(--button-size);
  height: var(--button-size);
  background-color: black;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 2px 2px 2px gray;
  z-index: 20;

  @media (min-width: 1200px) {
    display: none;
  }

  &:active {
    background-color: gray;
  }

  svg {
    width: 60%;
    height: 60%;
    cursor: pointer;
    color: white;
  }
`;

export const ScrollToTopButton: React.VFC<{ target: HTMLElement }> = (props) => {
  const scrollToTop = useCallback(() => window.scrollTo(0, 0), []);
  const showButton = useScrollTrigger({ disableHysteresis: true, threshold: props.target.offsetTop });
  if (showButton) {
    return (
      <ScrollToTopButtonContainer onClick={scrollToTop}>
        <ArrowUpwardIcon />
      </ScrollToTopButtonContainer>
    );
  } else {
    return <></>;
  }
};
