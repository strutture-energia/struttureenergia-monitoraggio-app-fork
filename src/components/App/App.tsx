import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppRootProps } from '@grafana/data';
import { ROUTES } from '../../constants';
import { PageAlbero, PageIP, PageAnalisiFatture} from '../../pages';
import { ThemeProvider } from '@mui/material';
import { muiTheme } from 'styles';

export function App(props: AppRootProps) {

  return (
    <ThemeProvider theme={muiTheme}>
      <Routes>
        <Route path={ROUTES.Albero} element={<PageAlbero />} />
        <Route path={ROUTES.IP} element={<PageIP />} />
        <Route path={ROUTES.AnalisiFatture} element={<PageAnalisiFatture />} />
      </Routes>
    </ThemeProvider>
  );
}
