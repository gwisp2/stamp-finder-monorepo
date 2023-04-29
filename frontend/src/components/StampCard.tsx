import ShoppingBasket from '@mui/icons-material/ShoppingBasket';
import { Box, Card, CardActions, CardContent, Divider, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { Stamp } from 'api/SfDatabase';
import React from 'react';
import EmptyImage from './icons/no-stamps.svg';
import { StampInfoDropdown } from './StampInfoDropdown';

export const StampCard = React.memo(function StampCard(props: { stamp: Stamp }) {
  const s = props.stamp;
  return (
    <Card>
      <CardContent sx={{ p: 1 }}>
        <Box sx={{ pl: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            component="div"
            sx={{ minWidth: 0 }}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            fontWeight="bold"
          >
            №{s.id} {s.value}₽ {s.year}
          </Typography>
          <StampInfoDropdown stamp={props.stamp} />
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box pb="100%" position="relative">
          <Box
            position="absolute"
            sx={{ objectFit: 'contain' }}
            component="img"
            draggable="false"
            width="100%"
            height="100%"
            src={s.imageUrl ?? EmptyImage}
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button
          disableElevation
          color={s.shopItems.length !== 0 ? 'success' : 'info'}
          variant={s.shopItems.length !== 0 ? 'contained' : 'outlined'}
          href={s.page}
          target="_blank"
          sx={{ textTransform: 'none' }}
          startIcon={<ShoppingBasket />}
          fullWidth
        >
          {s.shopItems.length !== 0 ? 'В магазин' : 'Нет в наличии'}
        </Button>
      </CardActions>
    </Card>
  );
});
