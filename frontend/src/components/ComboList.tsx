import { Box, Typography } from '@mui/material';
import _ from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid } from 'react-window';
import NoStampsImage from './icons/no-stamps.svg';
import { StampCombo } from '../model/StampCombo.tsx';
import { ComboCard } from './ComboCard.tsx';

export interface ComboListProps {
  combos: Array<StampCombo>;
  innerRef?: React.RefObject<FixedSizeGrid<StampCombo[]>>;
}

const NoCombosMessage: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" width="100%" height="100%" justifyContent="center" alignItems="center">
      <img src={NoStampsImage} width="256px" alt="" />
      <Typography>Комбинаций не найдено</Typography>
    </Box>
  );
};

interface GridData {
  gutterHoriz: number;
  gutterVert: number;
  nColumns: number;
  nRows: number;
  columnWidth: number;
  combos: StampCombo[];
  handleMountedItem: (element: HTMLDivElement | null) => void;
}

const GridItem = (props: { columnIndex: number; rowIndex: number; style: React.CSSProperties; data: GridData }) => {
  const { data, columnIndex, rowIndex } = props;
  const { combos, columnWidth, nColumns, gutterHoriz } = data;

  // render a card
  return (
    <div
      ref={props.data.handleMountedItem}
      style={{
        ..._.omit(props.style, 'height'),
        top: ((props.style.top ?? 0) as number) + 20,
        left: gutterHoriz + (columnWidth + gutterHoriz) * columnIndex,
        width: columnWidth,
      }}
    >
      {rowIndex * nColumns + columnIndex < combos.length && (
        <ComboCard combo={combos[rowIndex * nColumns + columnIndex]} />
      )}
    </div>
  );
};

const ComboListImpl = React.memo(function ComboListImpl(props: {
  combos: StampCombo[];
  width: number;
  height: number;
  innerRef?: React.RefObject<FixedSizeGrid>;
}): React.ReactElement {
  // Determine layout parameters
  const gutterHoriz = 16;
  const gutterVert = 16;
  const nColumns = Math.max(1, Math.floor(props.width / 270));
  const nRows = Math.ceil(props.combos.length / nColumns);
  const columnWidth = (props.width - gutterHoriz * (nColumns + 1)) / nColumns;
  const columnWidthPassedToGrid = props.width / nColumns; // does it affect anything?

  // Each resize columnWidth changes leading to change in cardHeight.
  // We need to determine cardHeight of any card and use it for computing card positions.
  // cardHeight = 0 means that it is not defined yet
  //   in such case we render only the first row to determine card height
  const [cardHeight, setCardHeight] = useState(0);
  const lastColumnWidth = useRef<number>(0);
  const handleMountedItem = useCallback(
    (div: HTMLDivElement | null) => {
      if (div !== null && lastColumnWidth.current !== columnWidth) {
        lastColumnWidth.current = columnWidth;
        setCardHeight(div.clientHeight);
      }
    },
    [columnWidth],
  );
  const gridData: GridData = {
    gutterHoriz,
    gutterVert,
    nColumns,
    nRows,
    columnWidth,
    combos: props.combos,
    handleMountedItem,
  };

  return (
    <FixedSizeGrid
      ref={props.innerRef}
      width={props.width}
      height={props.height}
      rowCount={cardHeight !== 0 ? nRows : 1}
      columnCount={nColumns}
      columnWidth={columnWidthPassedToGrid}
      rowHeight={cardHeight + gutterVert}
      itemData={gridData}
    >
      {GridItem}
    </FixedSizeGrid>
  );
});

export const ComboList: React.FC<ComboListProps> = (props) => {
  if (props.combos.length === 0) {
    return <NoCombosMessage />;
  }

  return (
    <AutoSizer>
      {(args: { width?: number; height?: number }) => (
        <ComboListImpl
          innerRef={props.innerRef}
          width={args.width ?? 1}
          height={args.height ?? 1}
          combos={props.combos}
        />
      )}
    </AutoSizer>
  );
};
