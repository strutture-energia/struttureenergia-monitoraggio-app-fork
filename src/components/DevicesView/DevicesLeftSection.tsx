import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Device } from '../../types/devices';
import useDevicesData from '../../hooks/useDevicesData';

export default function DevicesLeftSection() {

  const {
    editing,
    /* treeData, */
    devicesList,
    currentPeriod,
    onPeriodChange,
    moveToTree,
    setEditing,
    /* updateDevicesList,
    updateFluxAnalisis,
    updateTreeData, */
    saveData,
  } = useDevicesData();

  const onSave = () => {
    /* saveTreeDataToLocalStorage(treeData);
    setEditing(false);
    analyseFlux(); */
    saveData();
  }

  const onEdit = () => {
    setEditing(true);
    onPeriodChange(currentPeriod);
  }

  const HeaderSection = () => (
    <Stack>
      <Typography 
        fontSize={20}
        color={'black'}
        fontWeight={'700'}>
        SCHEMA
      </Typography>
      {
        editing && (
          <Button onClick={() => onPeriodChange(currentPeriod === 1 ? 0 : 1)}>
            <Typography>cambia periodo</Typography>
          </Button>
        )
      }
      {
        !editing
          ? (
            <Button variant='text' onClick={onEdit}>
              <Typography>Modifica</Typography>
            </Button>
          )
          : (
            <Button variant='text' onClick={onSave}>
              <Typography>Salva</Typography>
            </Button>
          )
      }
    </Stack>
  )

  return (
    <React.Fragment>
      <Box
        p={3}
        m={3} 
        height={'100vh'}
        bgcolor={'lightgrey'}
        overflow={'auto'}
        flex={0.3}>
          {HeaderSection()}
          <Stack
            p={3}
            marginTop={3}
            alignItems={'flex-start'}>
            {
              editing &&
              devicesList.map((device: Device, i: number) => {
              return (
                <Button
                  key={i}
                  onClick={() => moveToTree(i)}
                  variant='outlined'
                  sx={{
                    marginBottom: 2,
                    width: '200px'
                  }}>
                  <Typography fontWeight={'700'}>
                    {device?.customName ?? device.name}
                  </Typography>
                </Button>
              )
            })}
          </Stack>
      </Box>
    </React.Fragment>
  )
}
