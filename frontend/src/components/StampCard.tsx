import { StarTwoTone } from '@mui/icons-material';
import ShoppingBasket from '@mui/icons-material/ShoppingBasket';
import { Box, Card, CardActions, CardContent, Divider, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { yellow } from '@mui/material/colors';
import { SxProps, Theme } from '@mui/material/styles';
import { Stamp } from 'api/SfDatabase';
import React from 'react';
import { useFavoritesStore } from '../api/FavoritesManager';
import { StampInfoDropdown } from './StampInfoDropdown';
import EmptyImage from './icons/no-stamps.svg';

function FavouriteButton(props: { sx?: SxProps<Theme>; stampId: number }) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(props.stampId));
  const setFavorite = useFavoritesStore((state) => state.setFavorite);
  const sx = props.sx;
  const sxArr = [...(Array.isArray(sx) ? sx : [sx])];
  const outlineColor = '#000';
  const checkedColor = yellow[700];

  const commonSx = [
    {
      '& path:nth-of-type(1)': { fill: checkedColor },
      '& path:nth-of-type(2)': { fill: outlineColor, opacity: 1 },
      cursor: 'pointer',
    },
    ...sxArr,
  ];
  if (isFavorite) {
    return (
      <StarTwoTone
        onClick={() => setFavorite(props.stampId, false)}
        sx={[
          {
            '& path:nth-of-type(1)': { opacity: 1 },
            '&:hover path:nth-of-type(1)': { opacity: 0.7 },
          },
          ...commonSx,
        ]}
      />
    );
  } else {
    return (
      <StarTwoTone
        onClick={() => setFavorite(props.stampId, true)}
        sx={[
          {
            '& path:nth-of-type(1)': { opacity: 0 },
            '&:hover path:nth-of-type(1)': { opacity: 0.3 },
          },
          ...commonSx,
        ]}
      />
    );
  }
}

export const StampCard = React.memo(function StampCard(props: { stamp: Stamp }) {
  const s = props.stamp;
  return (
    <Card>
      <CardContent sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FavouriteButton sx={{ display: 'block', mr: 1 }} stampId={s.id} />
          <Typography
            component="div"
            sx={{ minWidth: 0 }}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            fontWeight="bold"
            flexGrow={1}
          >
            №{s.id} {s.value}₽ {s.year}
          </Typography>
          <Box display="flex" alignItems="center">
            <StampInfoDropdown stamp={props.stamp} />
          </Box>
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
