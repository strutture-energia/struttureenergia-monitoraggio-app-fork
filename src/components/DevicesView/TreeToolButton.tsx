import { ButtonBase, Typography } from '@mui/material';
import React from 'react';

interface TreeToolButtonInterface {
  title: string;
  icon: any;
  onClick: () => void;
  style?: any;
  disabled?: boolean;
}

//pulsanti nodo e importa , in questa istanza sono vuoti quando verranno chiamati gli si
// passerà il nome e la funzione che eseguono al click (on click passate alle prop)
export default function TreeToolButton({ icon, onClick, title, style, disabled = false }: TreeToolButtonInterface) {
  return (
    <ButtonBase
      sx={{
        p: 0.5,
        opacity: disabled ? 0.4 : 1,
        borderRadius: 2,
        bgcolor: 'transparent',
        border: '1px solid grey',
        display: 'flex',
        width: '70px',
        height: '70px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <Typography>{title}</Typography>
    </ButtonBase>
  );
}
