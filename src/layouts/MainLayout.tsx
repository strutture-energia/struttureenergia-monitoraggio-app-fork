import { Box, ButtonBase, Stack, Typography, Modal, Button, Backdrop, Link } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import useDevicesData from '../hooks/useDevicesData';
import CachedIcon from '@mui/icons-material/Cached';
import { getDashboardUrl } from 'service/dashboardManager';
import { SANKEY_DASHBOARD } from 'constant/dashboards';
import { getPluginSelectedDatasource } from 'service/plugin';

interface MainLayoutInterface extends PropsWithChildren {}

export default function MainLayout({ children }: MainLayoutInterface) {
  const { initData, loadingSaveConfig } = useDevicesData();

  const [sankeyUrl, setSankeyUrl] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  //false la modale non si apre

  React.useEffect(() => {
    getPluginSelectedDatasource().then((sds) => {
      if (!!sds) {
        initData();
        getDashboardUrl(SANKEY_DASHBOARD).then((url) => {
          setSankeyUrl(window.location.origin + url + '?kiosk');
        });
        setIsModalOpen(false);
      } else {
        setIsModalOpen(true);
      }
    });
  }, [initData]);

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, bgcolor: 'white', position: 'relative' }}>
      <Modal
        open={isModalOpen}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseModal();
          }
        }}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: {
              backdropFilter: 'blur(5px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: 400,
            maxWidth: 500,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Stack>
          <Typography id="modal-title" variant="h6" component="h2">
            ATTENZIONE
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Non hai ancora configurato nessun data source. Per poter accedere a questa sezione, configura il tuo data
            source nella sezione di configurazione del plugin.
          </Typography>
          <Button sx={{ mt: 4, ml: 'auto', mr: 'auto' }} variant='contained' onClick={() => window.location.href = 'http://localhost:3000/plugins/struttureenergia-monitoraggio-app'}>CONFIGURAZIONE</Button>
          </Stack>
        </Box>
      </Modal>
      <Typography fontSize={26} fontWeight={'700'} mb={1}>
        Configurazione Albero Nodi
      </Typography>
      <Box sx={{ display: 'flex', flex: 1, border: '1px solid lightgray', height: '100vh' }}>{children}</Box>
      <Stack mt={5} flexDirection={'row'} gap={3} justifyContent={'space-between'} pr={1} alignItems={'center'}>
        <Typography fontSize={26} fontWeight={'700'}>
          Sankey Analisi di flusso
        </Typography>
        <ButtonBase
          sx={{
            p: 1.5,
            gap: 2,
            height: '34px',
            border: '1px solid black',
            borderRadius: 2,
          }}
        >
          <CachedIcon />
          <Typography>Analizza</Typography>
        </ButtonBase>
      </Stack>
      {loadingSaveConfig || !sankeyUrl ? (
        <h2>Caricamento in corso...</h2>
      ) : (
        <iframe id="energyflow" src={sankeyUrl} width="100%" height="800"></iframe>
      )}
    </Box>
  );
}
