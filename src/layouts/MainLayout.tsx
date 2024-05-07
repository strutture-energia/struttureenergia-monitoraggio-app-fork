import { Box, Stack } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import useDevicesData from '../hooks/useDevicesData';
import Chart from 'react-google-charts';


interface MainLayoutInterface extends PropsWithChildren {

}

export default function MainLayout({
  children
}: MainLayoutInterface) {

  const {
    initData,
    fluxAnalisis,
  } = useDevicesData();
  console.log("fluxAnalisis", fluxAnalisis)

  //var colors = ['green', 'yellow', 'red', "blue"];
  const sankeyOptions = React.useMemo(() => {
    return {
      sankey: {

        node: {
          colors: ['green', 'yellow', 'red'],
          nodePadding: 80,
          colorMode: 'unique'
        },
        link: {
          colorMode: 'none',
          colors: ['green', 'yellow', 'red'],
        }
      },
    }
  }, [])

  React.useEffect(() => {
    initData();
  }, [initData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, bgcolor: 'white' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        {children}
      </Box>
      <Stack p={3}>
        {
          fluxAnalisis.length !== 0 &&
          <Chart
            chartType='Sankey'
            width={'calc(50vw) - 48px'}
            height={'60vh'}
            options={sankeyOptions}
            data={fluxAnalisis} />
        }
      </Stack>
    </Box>
  )
}
