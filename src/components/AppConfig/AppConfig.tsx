import React, { useState, useEffect } from 'react';
import { lastValueFrom } from 'rxjs';
import { AppPluginMeta, PluginConfigPageProps, PluginMeta } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Icon } from '@grafana/ui';
import { testIds } from '../testIds';
import { initGrafanaFoldersAndDashboards, updateSankeyDashboard } from 'service/dashboardManager';
import { Button, Typography, Stack, Snackbar, Alert, Modal, Box } from '@mui/material';
import { createGrafanaDatasource, deleteGrafanaDatasource, getPluginConfig } from 'service/grafana';
import { Dashboard } from '@mui/icons-material';
import {
  DatasourceCongifData,
  addPluginDatasourceConfig,
  deletePluginDatasourceConfig,
  removePluginSelectedDatasource,
  setPluginSelectedDatasource,
} from 'service/plugin';
import AddIcon from '@mui/icons-material/Add';
import CreateDatasourceDialog from 'components/Form/CreateDatasourceDialog';
import { brkRef } from 'utils/common';
import DatasourceCard from './DatasourceCard';

/*
Questo file gestisce la configurazione del plugin di Grafana, fornendo una serie di funzionalità per visualizzare,
aggiungere, eliminare e selezionare data sources, nonché importare dashboard per l'applicazione.
Utilizza componenti React e funzionalità di Grafana per interagire con l'interfaccia utente e le API backend.
*/
export type AppPluginSettings = {
  apiUrl?: string;
};

export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<AppPluginSettings>> { }

export const AppConfig = () => {
  const [loading, setLoading] = useState(false);
  const [dsSuccess, setDsSuccess] = React.useState<string | null>(null);
  const [dsError, setDsError] = React.useState<string | null>(null);
  const [loadingDs, setLoadingDs] = React.useState<boolean>(false);
  const [selectedDsId, setSelectedDsId] = React.useState<string | number>(-1);

  const [creationDialogOpen, setCreationDialogOpen] = React.useState<boolean>(false);
  const [dsList, setDsList] = React.useState<DatasourceCongifData[]>([]);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = React.useState<{ id: number | string; uid: string } | null>(null);

  useEffect(() => {
    loadDataSources();
  }, []);

  // Carica i data sources configurati per il plugin e imposta lo stato del componente con l'elenco dei data sources disponibili.
  const loadDataSources = async () => {
    try {
      const pluginConfig = await getPluginConfig();
      const sources = pluginConfig?.jsonData?.datasources ?? {};
      const datasources: DatasourceCongifData[] = [];
      Object.keys(sources).map((k) => {
        if (k !== 'selectedDatasource') {
          datasources.push(sources[k]);
        }
      });
      const selectedDs = pluginConfig?.jsonData?.datasources?.selectedDatasource ?? null;
      console.log({ selectedDs });
      if (selectedDs) {
        setSelectedDsId(selectedDs.id);
      }
      console.log(pluginConfig);
      setDsList(datasources);
    } catch (error) {
      console.error('Error fetching data sources:', error);
    }
  };

  // Inizializza la cartella di grafana e ne inserisce le dashboard, 
  // allo stesso tempo aggiorna il grafico del sankey
  const onImportDashboard = async () => {
    try {
      await initGrafanaFoldersAndDashboards();
      await updateSankeyDashboard();
      setDsSuccess('Dashboard importata con successo');
    } catch (error) {
      console.error('Error importing dashboard:', error);
      setDsError("Si è verificato un errore durante l'importazione della dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Crea un nuovo data source in Grafana e aggiorna la configurazione del plugin con il nuovo data source creato.
  const onCreateDatasource = async (name: string, address: string, org: string, token: string, timeout: number) => {
    try {
      const dsRes = await createGrafanaDatasource(name, address, org, token, timeout);
      const dsConfig = dsRes.datasource;
      const dsData: DatasourceCongifData = {
        name,
        serverAddress: address,
        orgName: org,
        id: dsConfig.id,
        uid: dsConfig.uid,
        token,
      };
      //Aggiungo la nuova configurazione in /settings
      await addPluginDatasourceConfig(dsData);
      let newSelected = null;
      setDsList((prev) => {
        const newArr: DatasourceCongifData[] = brkRef(prev);
        newArr.push(dsData);
        if (newArr.length !== 0) {
          newSelected = newArr[0].id;
        }
        return newArr;
      });
      if (newSelected) {
        await setPluginSelectedDatasource(newSelected);
        setSelectedDsId(newSelected);
      } else {
        await removePluginSelectedDatasource();
        setSelectedDsId(-1);
      }
      setCreationDialogOpen(false);
      setDsSuccess('Data source creato con successo');
    } catch (error) {
      console.log('err', error);
      setDsError('Si è verificato un errore durante la creazione del data source');
      setLoadingDs(false);
    }
  };

  // Elimina un data source esistente sia da Grafana che dalla configurazione del plugin
  const onDeleteDatasource = async (uid: string, id: number | string) => {
    try {
      try {
        await deleteGrafanaDatasource(uid);
      } catch (error: any) {
        if(error?.response?.status !== 404){
          throw error
        }
      }
      await deletePluginDatasourceConfig(id);
      let newSelected = null;
      setDsList((prev) => {
        const newArr: DatasourceCongifData[] = brkRef(prev);
        const index = newArr.findIndex((el) => el.uid === uid);
        if (index >= 0) {
          newArr.splice(index, 1);
        }
        if (newArr.length !== 0) {
          const newSelectedId = newArr[0].id;
          newSelected = newSelectedId;
        }
        return newArr;
      });
      if (newSelected) {
        await setPluginSelectedDatasource(newSelected);
        setSelectedDsId(newSelected);
      } else {
        await removePluginSelectedDatasource();
        setSelectedDsId(-1);
      }
      setDsSuccess('Data source eliminato con successo');
      setDeleteConfirmationModal(null);
    } catch (error) {
      console.log('err', error);
      setDsError("Si è verificato un errore durante l'eliminazione del data source");
    }
  };

  // Imposta un data source come selezionato nel plugin e aggiorna lo stato locale per riflettere la selezione.
  const onSelectedDatasource = async (id: string | number) => {
    try {
      await setPluginSelectedDatasource(id);
      setSelectedDsId(id);
    } catch (error) {
      console.log('err', error);
      setDsError('Non è stato possibile selezionare il datas source');
    }
  };

  return (
    <div data-testid={testIds.appConfig.container} style={{ padding: '20px' }}>
      <Typography variant="h5" component="h3" style={{ marginBottom: '20px' }}>
        Configurazione plugin
      </Typography>
      <Stack>
        <Stack gap={1}>
          <Stack flexDirection={'row'} gap={1} alignItems={'center'}>
            <Dashboard style={{ marginRight: '10px' }} />
            <Typography fontSize={18}>Importa Dashboard</Typography>
          </Stack>

          <Button
            variant="contained"
            data-testid={testIds.appConfig.submit}
            onClick={onImportDashboard}
            disabled={loading || dsList.length === 0}
            fullWidth={false}
            sx={{ maxWidth: '250px' }}
          >
            <Icon name="cloud-upload" style={{ marginRight: '10px' }} /> IMPORTA DASHBOARD
          </Button>
          {
            dsList.length === 0 &&
            <Typography fontSize={12}>{"E' necessario configurare almeno un datasource"}</Typography>
          }
        </Stack>
      </Stack>
      <Stack mt={5} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
        <Typography fontSize={18} fontWeight={'500'}>
          DATA SOURCES
        </Typography>
        <Button
          variant="outlined"
          sx={{ alignItems: 'center' }}
          onClick={() => setCreationDialogOpen(true) /* resetPluginConfig */}
        >
          <AddIcon sx={{ mr: 1 }} /> Aggiungi un datasource
        </Button>
      </Stack>
      <Stack minHeight={'500px'} mt={3}>
        {dsList.length === 0 && (
          <Typography sx={{ fontStyle: 'italic', textAlign: 'center', mt: 7, color: 'gray' }}>
            NON SONO PRESENTI DATA SOURCES
          </Typography>
        )}
        {dsList.map((ds) => (
          <DatasourceCard
            key={ds.id}
            data={ds}
            selected={selectedDsId === ds.id}
            onDelete={() => setDeleteConfirmationModal({ uid: ds.uid, id: ds.id })}
            onSelect={() => onSelectedDatasource(ds.id)}
          />
        ))}
      </Stack>
      <CreateDatasourceDialog
        loading={loadingDs}
        open={creationDialogOpen}
        onClose={() => setCreationDialogOpen(false)}
        onSubmit={onCreateDatasource}
      />
      <Snackbar open={!!dsSuccess} autoHideDuration={4000} onClose={() => setDsSuccess(null)}>
        <Alert onClose={() => setDsSuccess(null)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {dsSuccess}
        </Alert>
      </Snackbar>
      <Snackbar open={!!dsError} autoHideDuration={4000} onClose={() => setDsError(null)}>
        <Alert onClose={() => setDsError(null)} severity="error" variant="filled" sx={{ width: '100%' }}>
          {dsError}
        </Alert>
      </Snackbar>
      <Modal
        open={!!deleteConfirmationModal}
        onClose={() => setDeleteConfirmationModal(null)}
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
              Sei sicuro di voler eliminare il data source?
            </Typography>
            <Button sx={{ mt: 4, mr: 'auto' }} variant='contained' color='error' onClick={() => {
              if (deleteConfirmationModal === null) { return; }
              const { uid, id } = deleteConfirmationModal;
              onDeleteDatasource(uid, id);
            }}>ELIMINA</Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
};

//Vecchia versione?
export const updatePlugin = async (pluginId: string, data: Partial<PluginMeta>) => {
  const response = await getBackendSrv().fetch({
    url: `/api/plugins/${pluginId}/settings`,
    method: 'POST',
    data,
  });

  return lastValueFrom(response);
};
