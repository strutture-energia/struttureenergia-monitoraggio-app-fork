import { Box } from '@mui/material';
import React from 'react';
import DevicesLeftSection from './DevicesLeftSection';
import DevicesTreeView from './DevicesTreeView';

export default function DevicesView() {
  return (
    <Box 
      flexGrow={1}
      display={'flex'}>
      <DevicesLeftSection />
      <DevicesTreeView />
    </Box>
  )
}
