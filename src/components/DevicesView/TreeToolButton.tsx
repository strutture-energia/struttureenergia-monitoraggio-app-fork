import { ButtonBase, Typography } from '@mui/material';
import React from 'react';

interface TreeToolButtonInterface {
  title: string;
  icon: any;
  onClick: () => void;
  style?: any;
  disabled?: boolean;
}

export default function TreeToolButton({
  icon,
  onClick,
  title,
  style,
  disabled = false,
}: TreeToolButtonInterface) {

  return (
    <ButtonBase
      sx={{
        p: 0.5,
        borderRadius: 2,
        bgcolor: 'transparent',
        border: '1px solid grey',
        display: 'flex',
        width: '70px',
        height: '70px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}
      onClick={onClick}
      disabled={disabled}>
        {icon}
        <Typography>{title}</Typography>
    </ButtonBase>
  )
}