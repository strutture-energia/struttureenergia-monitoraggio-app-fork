import { Box } from '@mui/material';
import React from 'react';
import DevicesTreeView from './DevicesTreeView';
import DevicesLeftSection from './DevicesLeftSection';

export default function DevicesView() {
  return (
    <Box 
      flexGrow={1}
      height={'100vh'}
      display={'flex'}>
      <DevicesLeftSection />
      <DevicesTreeView />
    </Box>
  )
}
