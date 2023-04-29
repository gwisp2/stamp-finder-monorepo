import { Box, Typography } from '@mui/material';
import { Stamp } from 'api/SfDatabase';
import { StampCard } from 'components/StampCard';
import _ from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid } from 'react-window';
import NoStampsImage from './icons/no-stamps.svg';

export interface StampListProps {
  stamps: Array<Stamp>;
  innerRef?: React.RefObject<FixedSizeGrid<Stamp[]>>;
}

const NoStampsMessage: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" width="100%" height="100%" justifyContent="center" alignItems="center">
      <img src={NoStampsImage} width="256px" alt="" />
      <Typography>Ничего не найдено</Typography>
    </Box>
  );
};

const StampListImpl = React.memo(function StampListImpl(props: {
  stamps: Stamp[];
  width: number;
  height: number;
  innerRef?: React.RefObject<FixedSizeGrid<Stamp[]>>;
}): React.ReactElement {
  // Determine layout parameters
  const gutterHoriz = 16;
  const gutterVert = 16;
  const nColumns = Math.floor(props.width / 270);
  const nRows = Math.ceil(props.stamps.length / nColumns);
  const columnWidth = (props.width - gutterHoriz * (nColumns + 1)) / nColumns;
  const columnWidthPassedToGrid = props.width / nColumns; // does it affect anything?

  // Each resize columnWidth changes leading to change in cardHeight.
  // We need to determine cardHeight of any card and use it for computing card positions.
  // cardHeight = 0 means that it is not defined yet
  //   in such case we render only the first row to determine card height
  const [cardHeight, setCardHeight] = useState(0);
  const lastColumnWidth = useRef<number>(0);
  const handleMountedDiv = useCallback(
    (div: HTMLDivElement | null) => {
      if (div !== null && lastColumnWidth.current !== columnWidth) {
        lastColumnWidth.current = columnWidth;
        setCardHeight(div.clientHeight);
      }
    },
    [columnWidth],
  );
  return (
    <FixedSizeGrid
      ref={props.innerRef}
      width={props.width}
      height={props.height}
      rowCount={cardHeight !== 0 ? nRows : 1}
      columnCount={nColumns}
      columnWidth={columnWidthPassedToGrid}
      rowHeight={cardHeight + gutterVert}
      itemData={props.stamps}
    >
      {({ columnIndex, rowIndex, style, data }) => (
        <div
          ref={handleMountedDiv}
          style={{
            ..._.omit(style, 'height'),
            top: ((style.top ?? 0) as number) + 20,
            left: gutterHoriz + (columnWidth + gutterHoriz) * columnIndex,
            width: columnWidth,
          }}
        >
          {rowIndex * nColumns + columnIndex < data.length && (
            <StampCard stamp={data[rowIndex * nColumns + columnIndex]} />
          )}
        </div>
      )}
    </FixedSizeGrid>
  );
});

export const StampList: React.FC<StampListProps> = (props) => {
  if (props.stamps.length === 0) {
    return <NoStampsMessage />;
  }

  // Optimization: reuse previous list of stamps if new one has the same contents
  // As a result StampListImpl will not be rendered extra time
  const stampsRef = useRef<Stamp[]>([]);
  if (!_.isEqual(stampsRef.current, props.stamps)) {
    stampsRef.current = props.stamps;
  }

  return (
    <AutoSizer>
      {(args: { width?: number; height?: number }) => (
        <StampListImpl
          innerRef={props.innerRef}
          width={args.width ?? 1}
          height={args.height ?? 1}
          stamps={stampsRef.current}
        />
      )}
    </AutoSizer>
  );
};
