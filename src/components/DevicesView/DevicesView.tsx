import { Box } from '@mui/material';
import React from 'react';
import DevicesLeftSection from './DevicesLeftSection';
import DevicesTreeView from './DevicesTreeView';

export default function DevicesView() {
  return (
    <Box 
      flexGrow={1}
      maxHeight={'100vh'}
      display={'flex'}>
      <DevicesLeftSection />
      <DevicesTreeView />
    </Box>
  )
}
