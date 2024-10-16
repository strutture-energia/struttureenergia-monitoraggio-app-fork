import { Box, ButtonBase, Stack, Typography, Modal, Button, Backdrop } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import useDevicesData from '../hooks/useDevicesData';
import CachedIcon from '@mui/icons-material/Cached';
import { getDashboardUrl } from 'service/dashboardManager';
import { SANKEY_DASHBOARD } from 'constant/dashboards';
import { getPluginSelectedDatasource } from 'service/plugin';
import { InsertLink } from '@mui/icons-material';
import { createGrafanaDatasource, deleteGrafanaDatasource } from 'service/grafana';
import { getCurrentIp } from 'service/ipService';

interface MainLayoutInterface extends PropsWithChildren { }

export default function MainLayout({ children }: MainLayoutInterface) {
  const { initData, loadingSaveConfig } = useDevicesData();

  const [sankeyUrl, setSankeyUrl] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  //false la modale non si apre

  React.useEffect(() => {
    // Funzione principale per gestire il datasource
    const handleDatasource = async () => {
        const sds = await getPluginSelectedDatasource();

        if (sds) {
            initData();

            const url = await getDashboardUrl(SANKEY_DASHBOARD);
            setSankeyUrl(window.location.origin + url + '?kiosk');
            setIsModalOpen(false);

            // Ottengo l'IP del datasource selezionato
            const datasourceIp = sds.serverAddress;

            // Ottengo l'IP attuale di Home Assistant
            const homeAssistantIp = await getCurrentIp();

            // Confronto gli IP
            if (datasourceIp === homeAssistantIp) {
                // Se è uguale, non devo fare niente
                return;
            }

            // Se è diverso, gestisco la sostituzione del datasource
            const { name, orgName, token } = sds; // Destrutturo i dati

            // Elimino il vecchio datasource
            await deleteGrafanaDatasource(sds.uid); // Assicurati che questa funzione sia asincrona

            // Creo il nuovo datasource
            await createGrafanaDatasource(name, homeAssistantIp, orgName, token, 3000);
            
            // Logica aggiuntiva qui se necessario...
        } else {
            setIsModalOpen(true);
        }
    };

    // Chiamo la funzione principale
    handleDatasource();
}, [initData]); // Aggiungi dipendenze se necessario

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
            <Button sx={{ mt: 4, ml: 'auto', mr: 'auto' }} variant='contained' onClick={() => handleCloseModal()}>OK</Button>
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

      <Stack mt={5} gap={1}>
        <Stack flexDirection={'row'} gap={1} alignItems={'center'}>
          <InsertLink style={{ marginRight: '10px' }} />
          <Typography fontSize={8}>{window.location.href}</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
