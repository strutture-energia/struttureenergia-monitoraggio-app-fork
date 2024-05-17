import React, { useEffect } from 'react';
import { lastValueFrom } from 'rxjs';
import { AppPluginMeta, PluginConfigPageProps, PluginMeta } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Button } from '@grafana/ui';
import { testIds } from '../testIds';
import { getAllDevicesByPeriod } from 'service/deviceService';
import { initGrafanaFolders } from 'service/dashboardManager';

export type AppPluginSettings = {
  apiUrl?: string;
};


export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<AppPluginSettings>> { }

export const AppConfig = () => {

  useEffect(() => {
    loadDataSources();
  }, [])

  const loadDataSources = async () => {
    let from = new Date();
    from.setHours(from.getHours() - 48);
    let to = new Date();
    const devices = await getAllDevicesByPeriod(from, to)
    console.log("DATA SOURCES", devices)
  }

  const onImportDashboard = () => {
    initGrafanaFolders()
  }

  return (
    <div data-testid={testIds.appConfig.container}>
      <div>
        <h3 style={{marginBottom:'20px'}}>Configurazione plugin</h3>

        <Button
          type="submit"
          data-testid={testIds.appConfig.submit}
          onClick={onImportDashboard}
        >
          IMPORTA DASHBOARD
        </Button>
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
