import React, { useState, useEffect } from 'react';
import { lastValueFrom } from 'rxjs';
import { AppPluginMeta, PluginConfigPageProps, PluginMeta } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Button, Spinner, Alert } from '@grafana/ui';
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
  TextField
} from '@mui/material'; 

export type AppPluginSettings = {
  apiUrl?: string;
};

export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<AppPluginSettings>> { }

export const AppConfig = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [dataSources, setDataSources] = useState<any[]>([]);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      const sources = await getDataSources();
    console.log(sources)
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

  return (
    <div data-testid={testIds.appConfig.container} style={{ padding: '20px' }}>
      <Card style={{ marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h5" component="h3" style={{ marginBottom: '20px' }}>
            Configurazione plugin
          </Typography>
          <Button
            type="submit"
            data-testid={testIds.appConfig.submit}
            onClick={onImportDashboard}
            disabled={loading}
          >
            {loading ? <Spinner /> : 'IMPORTA DASHBOARD'}
          </Button>
        </CardContent>
      </Card>

      {success && (
        <Alert title="Success" severity="success" style={{ marginTop: '20px' }}>
          Dashboard caricate con successo
        </Alert>
      )}
      <Card style={{ marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h5" component="h3" style={{ marginBottom: '20px' }}>
            Configurazione Data
          </Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <TextField 
                select 
                id="select"
                value={selectedOption}
                onChange={handleSelectChange}
                label="seleziona un opzione"
                style={{ width: '50%' }}
              >
                {dataSources.map(source => (
                  <MenuItem key={source.id} value={"dataSource" + source.id}>{"dataSource" + source.id}</MenuItem>
                ))}
            </TextField>
            <MUIButton variant="contained" color="primary" disableElevation style={{ width: '10%' }}>
              Salva
            </MUIButton>
          </div>
        </CardContent>
      </Card>
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
