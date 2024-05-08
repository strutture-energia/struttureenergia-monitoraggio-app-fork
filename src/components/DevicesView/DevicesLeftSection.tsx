import React from 'react';
import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';
import { Device, DeviceIcon } from '../../types/devices';
import useDevicesData from '../../hooks/useDevicesData';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeriodPicker from 'components/DatePicker/PeriodPicker';
import { Range } from 'react-date-range';
import { dateFormatting } from 'utils/common';
import CreateDeviceByCSVDialog from 'components/Form/CreateDeviceByCSVDialog';
import { DEVICE_ICONS_SET } from 'constant/configurazionDialog';
import SpeedIcon from '@mui/icons-material/Speed';

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

  const [modalOpen, setModalOpen] = React.useState<boolean>(false);

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

  /* const onPeriodChangeClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setCalendarAnchor(event.currentTarget);
  } */

  const onModalOpen = (): void => {
    setModalOpen(true);
  }

  const onModalClose = (): void => {
    setModalOpen(false);
  }

  const onModalSubmit = (customData: any) => {
    console.log('CUSTOM DATA', customData);
    setModalOpen(false);
  }

  const HeaderSection = () => (
    <Stack>
      <Typography 
        fontSize={16}
        color={'black'}
        fontWeight={'700'}>
        SCHEMA
      </Typography>
        <Button onClick={onModalOpen}>
          <Typography>NEW DEVICE BY CSV</Typography>
        </Button>
      <Stack 
        p={2}
        mb={2}
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
          onClick={() => onPeriodChange(currentPeriod === 1 ? 0 : 1)}
          /* onClick={onPeriodChangeClick} */>
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
    </Stack>
  )

  return (
    <React.Fragment>
      <Box
        p={3}
        m={3} 
        height={'100vh'}
        bgcolor={'#fafafa'}
        borderRight={'2px'}
        //overflow={'auto'}
        flex={0.3}>
          {HeaderSection()}
          <Stack mt={3}>
            { editing && 
              <Stack
                borderRadius={'10px 10px 0px 0px'}
                borderTop={'1px solid black'}
                borderRight={'1px solid black'}
                borderLeft={'1px solid black'}
                borderBottom={'1px solid black'}>
                <ButtonBase 
                  sx={{gap: 2, p: 1}}
                  onClick={() => createUnionNode(0)}>
                  <AccountTreeIcon fontSize='large' sx={{color: 'black'}}/>
                  <Typography color={'black'}>NODO</Typography>
                </ButtonBase>
              </Stack>
            }
            <Stack
              p={2}
              borderRadius={`${editing ? 0 : 10}px ${editing ? 0 : 10}px 10px 10px`}
              border={'1px solid black'}
              borderTop={editing ? '0px' : '1px solid black'}
              className='devicesContainer'
              maxHeight={'60vh'}
              overflow={'auto'}
              alignItems={'flex-start'}>
              {
                devicesList.map((device: Device, i: number) => {
                const DevIcon = device.icon
                  ? DEVICE_ICONS_SET[device.icon as DeviceIcon]
                  : null;
                return (
                  <ButtonBase
                    key={i}
                    disabled={!editing}
                    onClick={() => moveToTree(i)}
                    sx={{
                      gap: 1,
                      marginBottom: 2,
                    }}>
                    <Stack
                      p={0.5}
                      border={'1px solid black'}>
                      {
                        DevIcon
                          ? <DevIcon sx={{ fontSize: 35, color: 'black' }} />
                          : <SpeedIcon sx={{ fontSize: 35, color: 'black' }} />
                      }
                    </Stack>
                    <Typography color={'black'} fontSize={16}>
                      {device?.customName ?? device.name}
                    </Typography>
                  </ButtonBase>
                )
              })}
            </Stack>
            {/* <Stack height={'200px'}
              borderBottom={'1px solid balck'}
              borderLeft={'1px solid balck'}
              borderRight={'1px solid balck'}
              border={'1px solid balck'}>
              csv enel
            </Stack> */}
          </Stack>
          <PeriodPicker 
            anchorEl={calendarAnchor}
            onChange={(newRange) => setPeriod(newRange)}
            onClose={() => setCalendarAnchor(null)}
            range={[period]}/>
      </Box>

      <CreateDeviceByCSVDialog
        onSave={onModalSubmit}
        open={modalOpen}
        onClose={onModalClose} />
    </React.Fragment>
  )
}
