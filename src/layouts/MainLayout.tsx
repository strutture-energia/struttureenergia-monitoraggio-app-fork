import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import useDevicesData from '../hooks/useDevicesData';
/* import Chart from 'react-google-charts'; */
import CachedIcon from '@mui/icons-material/Cached';
import { getDashboardUrl } from 'service/dashboardManager';
import { SANKEY_DASHBOARD } from 'constant/dashboards';


interface MainLayoutInterface extends PropsWithChildren {

}

export default function MainLayout({
  children
}: MainLayoutInterface) {

  const {
    initData,
    loadingSaveConfig
    /*  fluxAnalisis, */
  } = useDevicesData();

  const [sankeyUrl, setSankeyUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    initData();
    getDashboardUrl(SANKEY_DASHBOARD).then((url) => {
      setSankeyUrl(window.location.origin + url + "?kiosk")
    })
  }, [initData]);


  console.log("SANKEY URL", sankeyUrl);


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, bgcolor: 'white' }}>
      <Typography fontSize={26} fontWeight={'700'} mb={1}>Configurazione Albero Nodi</Typography>
      <Box sx={{ display: 'flex', flex: 1, border: '1px solid lightgray', height: '100vh' }}>
        {children}
      </Box>
      <Stack mt={5} flexDirection={'row'} gap={3} justifyContent={'space-between'} pr={1} alignItems={'center'}>
        <Typography fontSize={26} fontWeight={'700'}>
          Sankey Analisi di flusso
        </Typography>
        <ButtonBase sx={{
          p: 1.5,
          gap: 2,
          height: '34px',
          border: '1px solid black',
          borderRadius: 2,
        }}>
          <CachedIcon />
          <Typography>Analizza</Typography>
        </ButtonBase>
      </Stack>
      {/*      <Stack p={1} mt={2}>
        {
          fluxAnalisis.length !== 0 &&
          <Chart
            chartType='Sankey'
            width={'calc(50vw) - 48px'}
            height={'60vh'}
            options={sankeyOptions}
            data={fluxAnalisis} />
        }
      </Stack> */}
      {
        loadingSaveConfig || !sankeyUrl ?
          <h2>Caricamento in corso...</h2>
          :
          <iframe
            id="energyflow"
            src={sankeyUrl}
            width="100%"
            height="800"
            frameBorder="0"
          ></iframe>
      }
    </Box>
  )
}
