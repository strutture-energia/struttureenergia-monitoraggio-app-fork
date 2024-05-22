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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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
    deleteDevice
  } = useDevicesData();

  const [calendarAnchor, setCalendarAnchor] = React.useState<HTMLElement | null>(null);
  const [loadingDelete, setLoadingDelete] = React.useState<string | null>(null);

  const period = React.useMemo((): Range => {
    return {
      startDate: currentPeriod.from,
      endDate: currentPeriod.to,
      key: 'selection',
    }
  }, [currentPeriod]);

  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  
  const onCalendareChange = (newRange: Range) => {
    onPeriodChange({from: newRange.startDate, to: newRange.endDate}, treeData);
    setCalendarAnchor(null);
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
    onPeriodChange(currentPeriod, treeData);
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
       <IconButton onClick={onPeriodChangeClick} disabled={loadingDevices}>
        <CalendarMonthIcon fontSize='large'/>
      </IconButton>
    </Stack>
  )

  const renderTools = () => (
    <Stack mb={4}>
      <Typography fontWeight={'600'} fontSize={16} mb={1}>Strumenti albero</Typography>
      <Stack flexDirection={'row'} gap={2}>
        <TreeToolButton 
          disabled={loadingDevices}
          icon={<AccountTreeIcon fontSize='large'/>}
          title='NODO'
          onClick={() => createUnionNode(0)}/>
          <TreeToolButton 
          disabled={loadingDevices}
          icon={<InsertDriveFileIcon fontSize='large'/>}
          title='Importa'
          onClick={onModalOpen}/>
      </Stack>
    </Stack>
  )

  const onDeviceDelete = async (device: Device) => {
    try {
      if (confirm('L eliminazione del dispositivo è permanente e non potrà essere annullata. Tutti i dati associati al dispositivo andranno persi definitivamente')) {
        // elimina
        setLoadingDelete(device.id)
        await deleteDevice(device.id);
        setLoadingDelete(null)
      }
    } catch (error) {
      setLoadingDelete(null)
    }
  }

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
              py={2}
              pl={2}
              height={'1px'}
              flexGrow={1}
              overflow={'auto'}
              borderRadius={'10px'}
              bgcolor={'#F5F5F5'}
              alignItems={'flex-start'}>
              {
                devicesList.map((device: Device, i: number) => {
                const DevIcon = device.icon
                  ? DEVICE_ICONS_SET[device.icon as DeviceIcon]
                  : null;
                return (
                  <Stack position={'relative'} width={'100%'} pr={'20px'} height={'50px'} key={i} mb={1} mt={i !== 0 ? 1 : 0}>
                    {
                      device.origin === 'CSV' && (
                        <Stack position={'absolute'} right={16} zIndex={20} bottom={0} m={'0 auto'} top={5}>
                          <IconButton onClick={() => onDeviceDelete(device)} disabled={loadingDelete === device.id}>
                            {
                              !(loadingDelete && loadingDelete === device.id) ? 
                              <DeleteOutlineIcon sx={{color: 'black'}} />
                              :
                              <CircularProgress size={18} sx={{color: 'gray'}} />

                            }
                          </IconButton>
                        </Stack>
                      )
                    }
                    <ButtonBase
                      onClick={() => moveToTree(i)}
                      sx={{
                        pb: 1,
                        gap: 1,
                        height: '58px',
                        pr: '32px',
                        justifyContent: 'flex-start',
                        borderBottom: '1px solid gray',
                        width: '100%',
                      }}>
                      <Stack
                        p={0.5}>
                        {
                          DevIcon
                          ? <DevIcon sx={{ fontSize: 35, color: 'black' }} />
                          : <SpeedIcon sx={{ fontSize: 35, color: 'black' }} />
                        }
                      </Stack>
                      <Stack justifyContent={'flex-start'}>
                        <Stack flexDirection={'row'} gap={1} alignItems={'center'} justifyContent={'flex-start'}>
                          <Typography color={'black'} fontSize={16} fontWeight={'600'} textAlign='start' whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'}>
                            {device?.customName ?? device.name}
                          </Typography>
                          {
                            device.origin === 'CSV' && 
                            <Stack border={'1px solid black'} borderRadius={1} px={0.5} height={16} alignItems={'center'} justifyContent={'center'} bgcolor={'white'}>
                              <Typography fontSize={11} fontWeight={'600'}>CSV</Typography>
                            </Stack>
                          }
                        </Stack>
                        <Typography color={'gray'} fontSize={14} fontWeight={'600'} textAlign={'start'}>
                          {device.roomName ?? '--'}
                        </Typography>
                      </Stack>
                    </ButtonBase>
                  </Stack>
                )
              })}
            </Stack>
          </Stack>
          <PeriodPicker 
            anchorEl={calendarAnchor}
            onChange={onCalendareChange}
            onClose={() => setCalendarAnchor(null)}
            range={period}/>
      </Box>
      <CreateDeviceByCSVDialog
        onSave={onModalSubmit}
        open={modalOpen}
        onClose={onModalClose} />
    </React.Fragment>
  )
}
