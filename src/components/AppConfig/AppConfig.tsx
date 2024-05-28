import React, { useState, useEffect } from 'react';
import { lastValueFrom } from 'rxjs';
import { AppPluginMeta, PluginConfigPageProps, PluginMeta } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Button, Spinner, Alert, Icon } from '@grafana/ui';
import { testIds } from '../testIds';
import { getAllDevicesByPeriod } from 'service/deviceService';
import { initGrafanaFolders } from 'service/dashboardManager';
import { getDataSources } from 'service/dataSourceService';
import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Button as MUIButton,
  Card,
  CardContent,
  Typography,
  TextField,
} from '@mui/material';
import { getPluginConfig, savePluginConfig } from 'service/grafana';
import { Dashboard, Storage } from '@mui/icons-material';

export type AppPluginSettings = {
  apiUrl?: string;
};

export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<AppPluginSettings>> {}

export const AppConfig = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dsSuccess, setDsSuccess] = React.useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState('-1');
  const [dataSources, setDataSources] = useState<any[]>([]);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      const sources = await getDataSources();
      if (!sources || !(sources instanceof Array)) {
        console.log('non sono presenti datasources');
        return;
      }
      const idsArr: number[] = sources.map(ds => ds.id);
      const pluginConfig = await getPluginConfig();
      const selectedDs = pluginConfig?.jsonData?.datasourceId;
      if (selectedDs) {
        const isSelectedDsValid = idsArr.includes(selectedDs);
        if (isSelectedDsValid) {
          setSelectedOption(selectedDs);
        }
      }
      setDataSources(sources);
    } catch (error) {
      console.error('Error fetching data sources:', error);
    }
  };

  const onImportDashboard = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await initGrafanaFolders();
      setSuccess(true);
    } catch (error) {
      console.error('Error importing dashboard:', error);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSelectedOption(event.target.value);
  };

  const onSave = async() => {
    try {
      await savePluginConfig({ datasourceId: selectedOption });
      setDsSuccess(true);
    } catch (error) {
      console.log('err', error);
    }
  }

  return (
    <div data-testid={testIds.appConfig.container} style={{ padding: '20px' }}>
      <Typography variant="h5" component="h3" style={{ marginBottom: '20px' }}>
        Configurazione plugin
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
        <Card style={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" component="h4" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <Dashboard style={{ marginRight: '10px' }} /> Importa Dashboard
            </Typography>
            <Button type="submit" data-testid={testIds.appConfig.submit} onClick={onImportDashboard} disabled={loading}>
              {loading ? <Spinner /> : <><Icon name="cloud-upload" style={{ marginRight: '10px' }} /> IMPORTA DASHBOARD</>}
            </Button>
            {success && (
              <Alert title="Success" severity="success" style={{ marginTop: '20px' }}>
                Dashboard caricate con successo
              </Alert>
            )}
          </CardContent>
        </Card>
        <Card style={{ flex: 1 }}>
  <CardContent>
    <Typography variant="h6" component="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
      <Storage style={{ marginRight: '10px' }} /> Datasource
    </Typography>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', height: '56px' }}>
  <TextField
    select
    id="select"
    value={selectedOption}
    onChange={handleSelectChange}
    label="Seleziona un opzione"
    style={{ flex: 1 }}
  >
    <MenuItem key={'-1'} value={'-1'}>Seleziona un datasource</MenuItem>
    {dataSources.map((source) => (
      <MenuItem key={source.id} value={source.id}>
        {'DATASOURCE ' + source.id}
      </MenuItem>
    ))}
  </TextField>
  <MUIButton
    variant="contained"
    color="primary"
    disableElevation
    onClick={onSave}
    disabled={selectedOption === '-1'}
    style={{ height: '100%', minWidth: '120px' }}
  >
    <Icon name="save" style={{ marginRight: '10px' }} />
  </MUIButton>
</div>



    {dsSuccess && (
      <Alert title="Success" severity="success" style={{ marginTop: '20px' }}>
        {`DATASOURCE ${selectedOption} caricato con successo`}
      </Alert>
    )}
  </CardContent>
</Card>

      </div>
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
