import ShareIcon from '@mui/icons-material/Share';
import { Snackbar } from '@mui/material';
import Button from '@mui/material/Button';
import React, { useCallback, useState } from 'react';

async function shareUrl(shareData: ShareData): Promise<string | null> {
  if (navigator.canShare && navigator.share && navigator.canShare(shareData)) {
    await navigator.share(shareData);
    return null;
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(shareData.url ?? '[error: no url to copy]');
    return 'Ссылка скопирована';
  } else {
    return 'Нет доступа к буферу обмена';
  }
}

export function ShareUrlButton(props: { makeShareData: () => { title: string; url: string } }): React.ReactElement {
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarShown, setSnackbarShown] = useState(false);
  const handleClick = useCallback(async () => {
    const shareResult = await shareUrl(props.makeShareData());
    if (shareResult !== null) {
      setSnackbarText(shareResult);
      setSnackbarShown(true);
    }
  }, [props.makeShareData]);
  return (
    <>
      <Button variant="outlined" startIcon={<ShareIcon />} onClick={handleClick}>
        Поделиться
      </Button>
      <Snackbar
        open={snackbarShown}
        autoHideDuration={1000}
        onClose={useCallback(() => setSnackbarShown(false), [])}
        message={snackbarText}
      />
    </>
  );
}