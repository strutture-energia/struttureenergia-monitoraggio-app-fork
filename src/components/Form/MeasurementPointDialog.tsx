import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  MenuItem,
  Modal,
  Stack,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import React from "react";
import { TreeItem } from "react-sortable-tree";
import { ACTIVE_STATES, ACTIVE_YES, CLASSIFICATION_MAIN_ACTIVITY, DEVICE_CLASSIFICATIONS, DEVICE_ICONS, DEVICE_ORIGINS, DEVICE_ORIGIN_DEV, DEVICE_PHASES, DEVICE_SINGLE_PHASE, DeviceClassification, DeviceIcon, DeviceModalValues, DeviceOrigins, DevicePhase, DeviceState, MEASURE_ICON } from "../../types/devices";
import { DEVICE_ICONS_SET } from "constant/configurazionDialog";
import CloseIcon from '@mui/icons-material/Close';

interface MeasurementPointDialogInterface {
  open: boolean;
  onClose: () => void;
  nodeData: {
    node: TreeItem,
    path: Array<number | string>,
    parentNode: TreeItem | null
  } | null;
  onSave: (customData: DeviceModalValues) => void;
}

export default function MeasurementPointDialog({
  open,
  onClose,
  nodeData,
  onSave,
}: MeasurementPointDialogInterface) {

  const nameRef = React.useRef<TextFieldProps>();

  const [customName, setCustomName] = React.useState<string>('');
  const [icon, setIcon] = React.useState<DeviceIcon>(MEASURE_ICON);
  const [active, setActive] = React.useState<DeviceState>('Sì');
  const [origin, setOrigin] = React.useState<DeviceOrigins>(DEVICE_ORIGIN_DEV);
  const [destination, setDestination] = React.useState<string>('');
  const [classification, setClassification] = React.useState<DeviceClassification>(CLASSIFICATION_MAIN_ACTIVITY);
  const [parentNodeName, setParentNodeName] = React.useState<string | null>(null);
  const [deviceName, setDeviceName] = React.useState<string>('');
  const [phase, setPhase] = React.useState<DevicePhase>(DEVICE_SINGLE_PHASE);
  // grafici - tempo reale
  const [rtCurrentIntensity, setRtCurrentIntensity] = React.useState<boolean>(false);
  const [rtVoltage, setrtVoltage] = React.useState<boolean>(false);
  const [rtPower, setRtPowert] = React.useState<boolean>(false);
  // grafici - storico
  const [hCurrentIntensity, setHCurrentIntensity] = React.useState<boolean>(false);
  const [hVoltage, setHVoltage] = React.useState<boolean>(false);
  const [hPower, setHPower] = React.useState<boolean>(false);
  const [hEnergy, setHEnergy] = React.useState<boolean>(false);
  // grafici - profili
  const [pElectricDemand, setPElectricDemand] = React.useState<boolean>(false);
  const [pSpring, setPSpring] = React.useState<boolean>(false);
  const [pWinter, setPWinter] = React.useState<boolean>(false);
  const [pSummer, setPSummer] = React.useState<boolean>(false);
  const [pAutumn, setPAutumn] = React.useState<boolean>(false);
  const [pWinterVsSummer, setPWinterVsSummer] = React.useState<boolean>(false); 

  React.useEffect(() => {
    if (nodeData) {
      loadNodeData(nodeData.node, nodeData.parentNode);
    } else {
      resetData();
    }
  }, [nodeData]);

  const onSubmit = () => {
    const customData: DeviceModalValues = {
      customName: customName.length === 0 ? undefined : customName,
      icon: icon.length === 0 ? undefined : icon,
      parentNodeCustomName: undefined,
      active: active === ACTIVE_YES,
      origin: origin.length === 0 ? undefined : origin,
      devCustomName: undefined,
      destination: destination.length === 0 ? undefined : destination,
      classification: classification.length === 0 ? undefined : classification,
      phase: phase,
      // grafici
      rtCurrentIntensity,
      rtVoltage,
      rtPower,
      hCurrentIntensity,
      hVoltage,
      hPower,
      hEnergy,
      pElectricDemand,
      pSpring,
      pWinter,
      pSummer,
      pAutumn,
      pWinterVsSummer,
    }
    onSave(customData);
  }

  const loadNodeData = (
    _nodeData: TreeItem,
    parentNode: TreeItem | null
  ) => {
    console.log(_nodeData?.metadata);
    setCustomName(_nodeData?.metadata?.customName ?? '');
    setIcon((_nodeData?.metadata?.icon as DeviceIcon) ?? MEASURE_ICON);
    setActive(_nodeData?.metadata?.active ? _nodeData?.metadata?.active ? 'Sì' : 'No' : 'No')
    setOrigin(_nodeData?.metadata?.origin as DeviceOrigins ?? DEVICE_ORIGIN_DEV);
    setDestination(_nodeData?.metadata?.destination ?? '');
    setClassification((_nodeData?.metadata?.classification as DeviceClassification) ?? CLASSIFICATION_MAIN_ACTIVITY);
    setParentNodeName(parentNode ? (parentNode.title as string) : null);
    setDeviceName(_nodeData.title as string);
    setPhase(_nodeData.metadata.phase as DevicePhase ?? DEVICE_SINGLE_PHASE);
    // grafici
    setRtCurrentIntensity(_nodeData?.metadata?.charts?.realtime?.currentIntensity || false);
    setrtVoltage(_nodeData?.metadata?.charts?.realtime?.voltage || false);
    setRtPowert(_nodeData?.metadata?.charts?.realtime?.power || false);
    setHCurrentIntensity(_nodeData?.metadata?.charts?.history?.currentIntensity || false);
    setHVoltage(_nodeData?.metadata?.charts?.history?.voltage || false);
    setHPower(_nodeData?.metadata?.charts?.history?.power || false);
    setHEnergy(_nodeData?.metadata?.charts?.history?.energy || false);

    setPElectricDemand(_nodeData?.metadata?.charts?.profiles?.electricDemand || false);
    setPSpring(_nodeData?.metadata?.charts?.profiles?.spring || false);
    setPWinter(_nodeData?.metadata?.charts?.profiles?.winter || false);
    setPSummer(_nodeData?.metadata?.charts?.profiles?.summer || false);
    setPAutumn(_nodeData?.metadata?.charts?.profiles?.autumn || false);
    setPWinterVsSummer(_nodeData?.metadata?.charts?.profiles?.winterVsSummer || false);
  }

  const resetData = () => {
    if (nameRef.current) {
      nameRef.current.value = '';
    }
  }

  const renderToolBar = () => (
    <Stack
      height={'40px'}
      position={'absolute'}
      top={0} right={0} left={0}
      alignItems={'center'}
      px={2}
      justifyContent={'space-between'}
      flexDirection={'row'}
      bgcolor={'#1876D2'}>
        <Typography color={'white'} fontSize={20} fontWeight={'500'}>Anagrafica</Typography>
        <ButtonBase onClick={onClose} sx={{gap: 1, flexDirection: 'row', alignItems: 'center'}}>
          <Typography color={'white'}>Chiudi</Typography>
          <CloseIcon sx={{color: 'white', fontWeight: '700'}}/>
        </ButtonBase>
    </Stack>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        pl={4}
        pr={4}
        pb={4}
        pt={6}
        top={"50%"}
        left={"50%"}
        sx={{ transform: "translate(-50%, -50%)" }}
        width={"95vw"}
        height={"95vh"}
        bgcolor={"white"}
        boxShadow={24}
        position={"absolute"}
        overflow={"auto"}
      >
        {renderToolBar()}
        {/* SECTION ONE */}
        <Stack className="modalSectionOne" gap={2} p={2}>
          <Stack gap={3} display={"flex"} flexDirection={"row"}>
            <TextField label="Nome del nodo" sx={{ flex: 1 }} value={customName} onChange={e => setCustomName(e.target.value)}/>
            <TextField label="Icona" sx={{ flex: 1 }} select value={icon} onChange={e => setIcon(e.target.value as DeviceIcon)}>
              {DEVICE_ICONS.map((di) => {
                const DevIcon = DEVICE_ICONS_SET[di];
                return <MenuItem key={di} value={di}>
                  <Stack flexDirection={'row'} alignItems={'center'} gap={2}>
                    <DevIcon />
                    {di}
                  </Stack>
                </MenuItem>
              })}
            </TextField>
          </Stack>
          <Stack gap={3} display={"flex"} flexDirection={"row"}>
            <TextField label="Nome del nodo padre" sx={{ flex: 1 }} disabled value={parentNodeName ?? '--'}/>
            <TextField label="Attivo" sx={{ flex: 1 }} select value={active} onChange={(e) => setActive(e.target.value as DeviceState)} disabled>
              {ACTIVE_STATES.map((acS) => <MenuItem key={acS} value={acS}>{acS}</MenuItem>)}
            </TextField>
          </Stack>
          <Stack gap={3} display={"flex"} flexDirection={"row"}>
            <TextField label="Origine del dato" sx={{ flex: 1 }} select value={origin} onChange={(e) => setOrigin(e.target.value as DeviceOrigins)} disabled>
              {DEVICE_ORIGINS.map((devO) => <MenuItem key={devO} value={devO}>{devO}</MenuItem>)}
            </TextField>
            <TextField label="Nome del dispositivo" sx={{ flex: 1 }} disabled value={deviceName ?? '--'} />
          </Stack>
          <Stack gap={3} display={"flex"} flexDirection={"row"}>
            <TextField label="Destinazione d'uso" sx={{ flex: 1 }} value={destination} onChange={(e) => setDestination(e.target.value)} disabled/>
            <TextField label="Classificazione" sx={{ flex: 1 }} select value={classification} onChange={e => setClassification(e.target.value as DeviceClassification)}>
              {DEVICE_CLASSIFICATIONS.map((dc) => <MenuItem key={dc} value={dc}>{dc}</MenuItem>)}
            </TextField>
          </Stack>
          <TextField label="Fase" sx={{ flex: 1 }} select value={phase} onChange={e => setPhase(e.target.value as DevicePhase)}>
              {DEVICE_PHASES.map((dp) => <MenuItem key={dp} value={dp}>{dp}</MenuItem>)}
            </TextField>
        </Stack>

        {/* SECTION THREE */}
        <Stack
          display={"flex"}
          flexDirection={"row"}
          marginTop={3}
          gap={3}
          p={2}
        >
          <Stack display={"flex"} flex={1}>
            <Typography fontWeight={700} marginBottom={2} fontSize={24}>
              Grafici da visualizzare
            </Typography>
            <Stack flex={1} display={"flex"} flexDirection={"row"}>
              <Stack flex={1} display={"flex"}>
                <Typography fontWeight={'700'}>Tempo reale</Typography>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={rtPower} onClick={(e) => setRtPowert(prev => !prev)}/>
                  <Typography>Potenza</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={rtCurrentIntensity} onClick={(e) => setRtCurrentIntensity(prev => !prev)} />
                  <Typography>Corrente</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={rtVoltage} onClick={(e) => setrtVoltage(prev => !prev)} />
                  <Typography>Tensione</Typography>
                </Stack>
              </Stack>
              <Stack flex={1} display={"flex"}>
                <Typography fontWeight={'700'}>Storico</Typography>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={hPower} onClick={(e) => setHPower(prev => !prev)}/>
                  <Typography>Potenza Kw</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={hCurrentIntensity} onClick={(e) => setHCurrentIntensity(prev => !prev)}/>
                  <Typography>Corrente</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={hVoltage} onClick={(e) => setHVoltage(prev => !prev)} />
                  <Typography>Tensione</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={hEnergy} onClick={(e) => setHEnergy(prev => !prev)}/>
                  <Typography>Energia</Typography>
                </Stack>
              </Stack>
              <Stack flex={1} display={"flex"}>
                <Typography fontWeight={'700'}>Profili medi giornalieri</Typography>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={pSpring} onClick={(e) => setPSpring(prev => !prev)} />
                  <Typography>Primavera</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={pSummer} onClick={(e) => setPSummer(prev => !prev)}/>
                  <Typography>Estate</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={pAutumn} onClick={(e) => setPAutumn(prev => !prev)} />
                  <Typography>Autunno</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={pWinter} onClick={(e) => setPWinter(prev => !prev)}/>
                  <Typography>Inverno</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={pWinterVsSummer} onClick={(e) => setPWinterVsSummer(prev => !prev)} />
                  <Typography>Inverno VS Estate</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox checked={pElectricDemand} onClick={(e) => setPElectricDemand(prev => !prev)} />
                  <Typography>Curva di richiesta del carico elettrico</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <Button
          onClick={onSubmit}
          sx={{marginTop: 3, minWidth: '150px', position: 'absolute', bottom: '24px', right: '24px'}}
          variant="contained">
            <Typography color={'white'}>SALVA</Typography>
        </Button>
      </Box>
    </Modal>
  );
}
