import { Box, Menu, MenuItem } from '@mui/material';
import React, { useRef, useState } from 'react';
import { NumberRange } from '../model';
import { GrayExpandMoreIcon } from './GrayClickableIcon';

export interface RangeShortcut {
  icons?: React.ComponentType[];
  name: string;
  range: NumberRange;
}

export interface RangeShortcutsDropdownProps {
  shortcuts: RangeShortcut[];
  onSelect?: (range: NumberRange) => void;
  unit?: string;
}

function formatRange(range: NumberRange, unit?: string): string {
  if (range.isUnbounded) {
    return '-';
  } else if (range.exact) {
    return `${range.start}${unit ?? ''}`;
  } else {
    return `${range.start}..${range.end}${unit ?? ''}`;
  }
}

export function RangeShortcutsDropdown(props: RangeShortcutsDropdownProps) {
  const iconRef = useRef<SVGSVGElement | null>(null);
  const [shown, setShown] = useState(false);

  return (
    <>
      <GrayExpandMoreIcon ref={iconRef} onClick={() => setShown(true)} />
      <Menu open={shown} anchorEl={iconRef.current} onClose={() => setShown(false)}>
        {props.shortcuts.map((shortcut, index) => (
          <MenuItem
            key={index}
            selected={false}
            onClick={() => {
              props.onSelect?.(shortcut.range);
              setShown(false);
            }}
          >
            <Box mr={2} minWidth="2em" textAlign="right">
              {formatRange(shortcut.range, props.unit)}
            </Box>
            <Box flexGrow={1}>{shortcut.name}</Box>
            <Box ml={2} minWidth="2em" textAlign="right">
              {shortcut.icons?.map((Icon, index) => (
                <Icon key={index} />
              ))}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
