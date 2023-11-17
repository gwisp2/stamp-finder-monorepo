import ShoppingBasket from '@mui/icons-material/ShoppingBasket';
import { Box, Card, CardActions, CardContent, Divider, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React from 'react';
import { StampInfoDropdown } from './StampInfoDropdown';
import EmptyImage from './icons/no-stamps.svg';
import { StampCombo } from '../model/StampCombo.tsx';
import { Stamp } from '../api/SfDatabase.ts';

function StampImageSet(props: { stamps: Stamp[] }) {
  const nStamps = props.stamps.length;
  const nCols = Math.ceil(Math.sqrt(props.stamps.length));
  const nRows = Math.ceil(nStamps / nCols);
  const cellWidth = 100 / nCols + '%';
  const cellHeight = 100 / nRows + '%';
  return (
    <Box pb="100%" position="relative">
      {props.stamps.map((s, i) => (
        <Box
          key={i}
          position="absolute"
          sx={{ objectFit: 'contain' }}
          component="img"
          draggable="false"
          top={(100 * Math.trunc(i / nCols)) / nRows + '%'}
          left={(100 * Math.trunc(i % nCols)) / nCols + '%'}
          width={cellWidth}
          height={cellHeight}
          src={s.imageUrl ?? EmptyImage}
        />
      ))}
    </Box>
  );
}

export const ComboCard = React.memo(function StampCard(props: { combo: StampCombo }) {
  const c = props.combo;
  return (
    <Card>
      <CardContent sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            component="div"
            sx={{ minWidth: 0 }}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            fontWeight="bold"
            flexGrow={1}
          >
            {c.totalValue}₽
          </Typography>
          <Box display="flex" alignItems="center">
            <StampInfoDropdown stamp={c.stamps[0]} />
          </Box>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <StampImageSet stamps={c.stamps} />
      </CardContent>
      <CardActions>
        <Button
          key={c.stamps[0].id /* to avoid color change animation when button is in a virtualized list  */}
          disableElevation
          color={c.stamps[0].shopItems.length !== 0 ? 'success' : 'info'}
          variant={c.stamps[0].shopItems.length !== 0 ? 'contained' : 'outlined'}
          href={c.stamps[0].page}
          target="_blank"
          sx={{ textTransform: 'none' }}
          startIcon={<ShoppingBasket />}
          fullWidth
        >
          {c.stamps[0].shopItems.length !== 0 ? 'В магазин' : 'Нет в наличии'}
        </Button>
      </CardActions>
    </Card>
  );
});
