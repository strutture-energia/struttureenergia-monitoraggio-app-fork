import React from 'react';
import { Box, ButtonBase, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { Device, DeviceIcon } from '../../types/devices';
import useDevicesData from '../../hooks/useDevicesData';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeriodPicker from 'components/DatePicker/PeriodPicker';
import { Range } from 'react-date-range';
import { dateFormatting } from 'utils/common';
import CreateDeviceByCSVDialog from 'components/Form/CreateDeviceByCSVDialog';
import { DEVICE_ICONS_SET } from 'constant/configurazionDialog';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import TreeToolButton from './TreeToolButton';

export default function DevicesLeftSection() {

  const {
    treeData,
    devicesList,
    currentPeriod,
    loadingDevices,
    onPeriodChange,
    moveToTree,
    createUnionNode,
  } = useDevicesData();

  const [calendarAnchor, setCalendarAnchor] = React.useState<HTMLElement | null>(null);
  const [period, setPeriod] = React.useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });

  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  
  const onCalendareChange = (newRange: Range) => {
    onPeriodChange(currentPeriod === 1 ? 0 : 1, treeData);
    setCalendarAnchor(null);
    return;
    setPeriod(newRange);
    const prevPeriod = period;
    const { endDate } = newRange;
    if (endDate?.getTime() !== prevPeriod.endDate?.getTime()) {
      setCalendarAnchor(null);
    }
  }

  const onPeriodChangeClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setCalendarAnchor(event.currentTarget);
  }

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

  const renderHeader = () => (
    <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} mb={4}>
      <Stack>
        <Typography fontWeight={'700'} fontSize={20}>Lista dispositivi</Typography>
        <Stack flexDirection={'row'} gap={1}>
          <Typography color={'grey'} fontStyle={'italic'}>Dal</Typography>
          <Typography fontWeight={'700'} color={'grey'} fontStyle={'italic'}>
            {period.startDate ? dateFormatting(period.startDate, 'YYYMMDD') : '--'}
          </Typography>
          <Typography color={'grey'} fontStyle={'italic'}>al</Typography>
          <Typography color={'grey'} fontWeight={'700'} fontStyle={'italic'}>
            {period.endDate ? dateFormatting(period.endDate, 'YYYMMDD') : '--'}
          </Typography>
        </Stack>
      </Stack>
       <IconButton onClick={onPeriodChangeClick}>
        <CalendarMonthIcon fontSize='large'/>
      </IconButton>
    </Stack>
  )

  const renderTools = () => (
    <Stack mb={4}>
      <Typography fontWeight={'600'} fontSize={16} mb={1}>Strumenti albero</Typography>
      <Stack flexDirection={'row'} gap={2}>
        <TreeToolButton 
          icon={<AccountTreeIcon fontSize='large'/>}
          title='NODO'
          onClick={() => createUnionNode(0)}/>
          <TreeToolButton 
          icon={<InsertDriveFileIcon fontSize='large'/>}
          title='Importa'
          onClick={onModalOpen}/>
      </Stack>
    </Stack>
  )

  return (
    <React.Fragment>
      <Box
        p={2}
        height={'100%'}
        bgcolor={'#FCFCFC'}
        display={'flex'}
        flexDirection={'column'}
        borderRight={'1px solid lightgray'}
        flex={0.3}>
          {renderHeader()}
          {renderTools()}
          <Stack flexGrow={1}>
            <Stack
              flexDirection={'row'}
              alignItems={'center'}
              gap={2}
              mb={1}>
                <Typography fontWeight={'600'} fontSize={16}>Dispositivi disponibili</Typography>
                {loadingDevices && <CircularProgress size={18} sx={{color: 'gray'}} />}
            </Stack>
            <Stack
              p={2}
              height={'1px'}
              flexGrow={1}
              overflow={'auto'}
              boxShadow={'0 0px 10px rgb(0 0 0 / 0.2)'}
              alignItems={'flex-start'}>
              {
                devicesList.map((device: Device, i: number) => {
                const DevIcon = device.icon
                  ? DEVICE_ICONS_SET[device.icon as DeviceIcon]
                  : null;
                return (
                  <ButtonBase
                    key={i}
                    onClick={() => moveToTree(i)}
                    sx={{
                      gap: 1,
                      height: '50px',
                      justifyContent: 'flex-start',
                      width: '100%',
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
          </Stack>
          <PeriodPicker 
            anchorEl={calendarAnchor}
            onChange={onCalendareChange}
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
