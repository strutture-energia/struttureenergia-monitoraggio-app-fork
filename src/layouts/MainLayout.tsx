import { Box, Stack } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import useDevicesData from '../hooks/useDevicesData';
import Chart from 'react-google-charts';


interface MainLayoutInterface extends PropsWithChildren{

}

export default function MainLayout({
  children
}: MainLayoutInterface) {

  const {
    initData,
    fluxAnalisis,
  } = useDevicesData();

  /* const sankeyOptions = React.useMemo(() => {
    return {
      sankey: { node: { 
        nodePadding: 500,
        width: 2
      } },
    }
  }, []) */

  React.useEffect(() => {
    initData();
  }, [initData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, bgcolor: 'white'}}>
      <Box sx={{display: 'flex', flex: 1}}>
        {children}
      </Box>
      <Stack p={3}>
      {
        fluxAnalisis.length !== 0 && 
        <Chart
          chartType='Sankey'
          width={'calc(50vw) - 48px'}
          height={'30vh'}
          //options={sankeyOptions}
          data={fluxAnalisis}/>
      }
      </Stack>
    </Box>
  )
}
