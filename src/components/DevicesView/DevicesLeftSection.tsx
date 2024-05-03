import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Device } from '../../types/devices';
import useDevicesData from '../../hooks/useDevicesData';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeriodPicker from 'components/DatePicker/PeriodPicker';
import { Range } from 'react-date-range';
import { dateFormatting } from 'utils/common';

export default function DevicesLeftSection() {

  const {
    editing,
    /* treeData, */
    devicesList,
    currentPeriod,
    onPeriodChange,
    moveToTree,
    setEditing,
    createUnionNode,
    /* updateDevicesList,
    updateFluxAnalisis,
    updateTreeData, */
    saveData,
  } = useDevicesData();

  const [calendarAnchor, setCalendarAnchor] = React.useState<HTMLElement | null>(null);
  const [period, setPeriod] = React.useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });

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

  const onPeriodChangeClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setCalendarAnchor(event.currentTarget);
  }

  const HeaderSection = () => (
    <Stack>
      <Typography 
        fontSize={20}
        color={'black'}
        fontWeight={'700'}>
        SCHEMA
      </Typography>
      <Stack 
        p={2}
        borderRadius={2}
        border={'1px solid blue'}>
        <Stack
          flex={1}
          gap={1}
          justifyContent={'center'}
          flexDirection={'row'}>
            {
              period.startDate && (
              <Typography color={'black'}>{dateFormatting(period.startDate, 'YYYMMDD')}</Typography>
            )}
            <Typography color={'black'}>-</Typography>
            {
              period.endDate && (
              <Typography color={'black'}>{dateFormatting(period.endDate, 'YYYMMDD')}</Typography>
            )}
        </Stack>
        <Button 
          /* onClick={() => onPeriodChange(currentPeriod === 1 ? 0 : 1)} */
          onClick={onPeriodChangeClick}>
          <Typography>cambia periodo</Typography>
        </Button>
      </Stack>
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
      {
        editing && (
          <Button
            sx={{mt: 2}}
            variant='contained'
            onClick={() => createUnionNode(0)}
            startIcon={<AccountTreeIcon />}>
              <Typography>NODO UNIONE</Typography>
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
              devicesList.map((device: Device, i: number) => {
              return (
                <Button
                  key={i}
                  disabled={!editing}
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
          <PeriodPicker 
            anchorEl={calendarAnchor}
            onChange={(newRange) => setPeriod(newRange)}
            onClose={() => setCalendarAnchor(null)}
            range={[period]}/>
      </Box>
    </React.Fragment>
  )
}
