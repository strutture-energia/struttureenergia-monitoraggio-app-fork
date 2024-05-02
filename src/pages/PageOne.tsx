import React from 'react';
/* import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data'; */
/* import { LinkButton, useStyles2 } from '@grafana/ui';
import { prefixRoute } from '../utils/utils.routing';
import { ROUTES } from '../constants';
import { testIds } from '../components/testIds'; */
import { PluginPage } from '@grafana/runtime';
import DevicesView from 'components/DevicesView/DevicesView';
import DevicesProvider from 'providers/DevicesProvider/DevicesProvider';
import MainLayout from 'layouts/MainLayout';

export function PageOne() {
  //const s = useStyles2(getStyles);

  return (
    <PluginPage>
      {/* <div data-testid={testIds.pageOne.container}>
        This is page one.
        <div className={s.marginTop}>
          <LinkButton data-testid={testIds.pageOne.navigateToFour} href={prefixRoute(ROUTES.Four)}>
            Full-width page example
          </LinkButton>
        </div>
      </div> */}
      <DevicesProvider>
        <MainLayout>
          <DevicesView />
        </MainLayout>
      </DevicesProvider>
    </PluginPage>
  );
}

/* const getStyles = (theme: GrafanaTheme2) => ({
  marginTop: css`
    margin-top: ${theme.spacing(2)};
  `,
});
 */
