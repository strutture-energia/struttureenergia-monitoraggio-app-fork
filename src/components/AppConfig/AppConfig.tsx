import React, { useState, useEffect } from 'react';
import { lastValueFrom } from 'rxjs';
import { AppPluginMeta, PluginConfigPageProps, PluginMeta } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Icon } from '@grafana/ui';
import { testIds } from '../testIds';
import { initGrafanaFolders } from 'service/dashboardManager';
import { Button, Typography, Stack, Snackbar, Alert } from '@mui/material';
import { createGrafanaDatasource, deleteGrafanaDatasource, getPluginConfig } from 'service/grafana';
import { Dashboard } from '@mui/icons-material';
import { DatasourceCongifData, addPluginDatasourceConfig, deletePluginDatasourceConfig, removePluginSelectedDatasource, setPluginSelectedDatasource } from 'service/plugin';
import AddIcon from '@mui/icons-material/Add';
import CreateDatasourceDialog from 'components/Form/CreateDatasourceDialog';
import { brkRef } from 'utils/common';

export type AppPluginSettings = {
  apiUrl?: string;
};

export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<AppPluginSettings>> {}

export const AppConfig = () => {
  const [loading, setLoading] = useState(false);
  const [dsSuccess, setDsSuccess] = React.useState<string | null>(null);
  const [dsError, setDsError] = React.useState<string | null>(null);
  const [loadingDs, setLoadingDs] = React.useState<boolean>(false);
  const [selectedDsId, setSelectedDsId] = React.useState<string | number>(-1);

  const [creationDialogOpen, setCreationDialogOpen] = React.useState<boolean>(false);
  const [dsList, setDsList] = React.useState<DatasourceCongifData[]>([]);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      const pluginConfig = await getPluginConfig();
      const sources = pluginConfig?.jsonData?.datasources ?? {};
      const datasources: DatasourceCongifData[] = [];
      Object.keys(sources).map((k) => {
        if (k !== 'selectedDatasource') {
          datasources.push(sources[k])
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

  const onImportDashboard = async () => {
    try {
      await initGrafanaFolders();
      setDsSuccess('Dashboard importata con successo');
    } catch (error) {
      console.error('Error importing dashboard:', error);
      setDsSuccess("Si è verificato un errore durante l'importazione della dashboard");
    } finally {
      setLoading(false);
    }
  };

  const onCreateDatasource = async (
    name: string,
    address: string,
    org: string,
    token: string,
  ) => {
    try {
      const dsRes = await createGrafanaDatasource(name, address, org, token);
      const dsConfig = dsRes.datasource;
      const dsData: DatasourceCongifData = {
        name,
        serverAddress: address,
        orgName: org,
        id: dsConfig.id,
        uid: dsConfig.uid,
        token,
      }
      await addPluginDatasourceConfig(dsData);
      let newSelected = null;
      setDsList(prev => {
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
      //setLoadingDs(false);
    } catch (error) {
      console.log('err', error);
      setDsError('Si è verificato un errore durante la creazione del data source')
      setLoadingDs(false);
    }
  };

  const onDeleteDatasource = async (uid: string, id: number | string) => {
    try {
      await deleteGrafanaDatasource(uid);
      await deletePluginDatasourceConfig(id);
      let newSelected = null;
      setDsList(prev => {
        const newArr: DatasourceCongifData[] = brkRef(prev);
        const index = newArr.findIndex(el => el.uid === uid);
        if (index >= 0) {
          newArr.splice(index, 1);
        }
        if (newArr.length !== 0) {
          const newSelectedId = newArr[0].id;
          newSelected = newSelectedId;
        }
        return newArr;
      })
      if (newSelected) {
        await setPluginSelectedDatasource(newSelected);
        setSelectedDsId(newSelected);
      } else {
        await removePluginSelectedDatasource();
        setSelectedDsId(-1);
      }
      setDsSuccess('Data source eliminato con successo')
    } catch (error) {
      console.log('err', error);
      setDsError("Si è verificato un errore durante l'eliminazione del data source");
    }
  };

  return (
    <div data-testid={testIds.appConfig.container} style={{ padding: '20px' }}>
      <Typography variant="h5" component="h3" style={{ marginBottom: '20px' }}>
        Configurazione plugin
      </Typography>
      <Stack gap={1} mt={5}>
        <Stack flexDirection={'row'} gap={1} alignItems={'center'}>
        <Dashboard style={{ marginRight: '10px' }} /> 
        <Typography fontSize={18}>
          Importa Dashboard
        </Typography>
        </Stack>
        
        <Button variant='contained' data-testid={testIds.appConfig.submit} onClick={onImportDashboard} disabled={loading} fullWidth={false} sx={{maxWidth: '250px'}}>
          <Icon name="cloud-upload" style={{ marginRight: '10px' }} /> IMPORTA DASHBOARD
        </Button>
      </Stack>
      <Stack mt={5} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
        <Typography fontSize={18} fontWeight={'500'}>
          DATA SOURCES
        </Typography>
        <Button variant='outlined' sx={{alignItems: 'center'}} onClick={() => setCreationDialogOpen(true)/* resetPluginConfig */}>
          <AddIcon sx={{mr: 1}} /> Aggiungi un datasource
        </Button>
      </Stack>
      <Stack minHeight={'500px'} mt={3}>
        {dsList.length === 0 && 
          <Typography sx={{fontStyle: 'italic', textAlign: 'center', mt: 7, color: 'gray'}}>NON SONO PRESENTI DATA SOURCES</Typography>}
        {dsList.map(e => (
          <Stack p={3} bgcolor={selectedDsId === e.id ? 'coral' : 'lightgrey'} mb={2} flexDirection={'row'}>
            {e.name}
            <Button onClick={() => onDeleteDatasource(e.uid, e.id)}>ELIMINA</Button>
          </Stack>
        ))}
      </Stack>
      <CreateDatasourceDialog
        loading={loadingDs}
        open={creationDialogOpen}
        onClose={() => setCreationDialogOpen(false)}
        onSubmit={onCreateDatasource}
      />
      <Snackbar open={!!dsSuccess} autoHideDuration={4000} onClose={() => setDsSuccess(null)}>
        <Alert
          onClose={() => setDsSuccess(null)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {dsSuccess}
        </Alert>
      </Snackbar>
      <Snackbar open={!!dsError} autoHideDuration={4000} onClose={() => setDsError(null)}>
        <Alert
          onClose={() => setDsError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {dsError}
        </Alert>
      </Snackbar>
    </div>
  );
};

export const updatePlugin = async (pluginId: string, data: Partial<PluginMeta>) => {
  const response = await getBackendSrv().fetch({
    url: `/api/plugins/${pluginId}/settings`,
    method: 'POST',
    data,
  });

  return lastValueFrom(response);
};
