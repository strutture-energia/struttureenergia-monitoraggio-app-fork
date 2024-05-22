import React, { useState, useEffect } from 'react';
import { lastValueFrom } from 'rxjs';
import { AppPluginMeta, PluginConfigPageProps, PluginMeta } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Button, Spinner, Alert } from '@grafana/ui';
import { testIds } from '../testIds';
import { getAllDevicesByPeriod } from 'service/deviceService';
import { initGrafanaFolders } from 'service/dashboardManager';

export type AppPluginSettings = {
  apiUrl?: string;
};

export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<AppPluginSettings>> { }

export const AppConfig = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    let from = new Date();
    from.setHours(from.getHours() - 48);
    let to = new Date();
    const devices = await getAllDevicesByPeriod(from, to);
    console.log("DATA SOURCES", devices);
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

  return (
    <div data-testid={testIds.appConfig.container}>
      <div>
        <h3 style={{ marginBottom: '20px' }}>Configurazione plugin</h3>
        <Button
          type="submit"
          data-testid={testIds.appConfig.submit}
          onClick={onImportDashboard}
          disabled={loading}
        >
          {loading ? <Spinner /> : 'IMPORTA DASHBOARD'}
        </Button>
        {success && (
          <Alert title="Success" severity="success" style={{ marginTop: '20px' }}>
            Dashboard caricate con successo
          </Alert>
        )}
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
