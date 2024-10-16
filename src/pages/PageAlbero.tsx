import React from 'react';
import { PluginPage } from '@grafana/runtime';
import DevicesView from 'components/DevicesView/DevicesView';
import DevicesProvider from 'providers/DevicesProvider/DevicesProvider';
import MainLayout from 'layouts/MainLayout';

export function PageAlbero() {

  return (
    <PluginPage>
      <DevicesProvider>
        <MainLayout>
          <DevicesView />
        </MainLayout>
      </DevicesProvider>
    </PluginPage>
  );
}