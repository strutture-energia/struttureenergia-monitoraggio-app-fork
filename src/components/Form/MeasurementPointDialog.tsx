import {
  Box,
  Button,
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
import { ACTIVE_STATES, ACTIVE_YES, DEVICE_CLASSIFICATIONS, DEVICE_ICONS, DeviceClassification, DeviceIcon, DeviceModalValues, DeviceState } from "../../types/devices";
import { DEVICE_ICONS_SET } from "constant/configurazionDialog";

interface MeasurementPointDialogInterface {
  open: boolean;
  onClose: () => void;
  nodeData: {
    node: TreeItem,
    path: Array<number | string>
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
  const [icon, setIcon] = React.useState<DeviceIcon | ''>('Misura');
  const [active, setActive] = React.useState<DeviceState>('Sì');
  const [origin, setOrigin] = React.useState<string>('');
  const [destination, setDestination] = React.useState<string>('');
  const [classification, setClassification] = React.useState<DeviceClassification | ''>('Servizi generali');

  React.useEffect(() => {
    if (nodeData) {
      loadNodeData(nodeData.node);
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
    }
    onSave(customData);
  }

  const loadNodeData = (
    _nodeData: TreeItem
  ) => {
    console.log(_nodeData?.metadata);
    setCustomName(_nodeData?.metadata?.customName ?? '');
    setIcon((_nodeData?.metadata?.icon as DeviceIcon) ?? 'Misura');
    setActive(_nodeData?.metadata?.active ? _nodeData?.metadata?.active ? 'Sì' : 'No' : 'No' )
    setOrigin(_nodeData?.metadata?.origin ?? '');
    setDestination(_nodeData?.metadata?.destination ?? '');
    setClassification((_nodeData?.metadata?.classification as DeviceClassification) ?? '');
    /* if (nameRef.current) {
      nameRef.current.value = _nodeData?.metadata?.customName ?? '';
    } */
  }

  const resetData = () => {
    if (nameRef.current) {
      nameRef.current.value = '';
    }
  }

  /* const renderToolBar = () => (
    <Stack
      position={'absolute'}
      height={50}
      color={'grey'}
      top={0} right={0} left={0} />
  )
 */
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        p={4}
        top={"50%"}
        left={"50%"}
        sx={{ transform: "translate(-50%, -50%)" }}
        width={"70vw"}
        height={"70vh"}
        bgcolor={"white"}
        boxShadow={24}
        position={"absolute"}
        overflow={"auto"}
      >
        {/* SECTION ONE */}
        <Stack className="modalSectionOne" gap={2} border={"2px solid green"} p={2}>
          <Stack gap={3} display={"flex"} flexDirection={"row"}>
            <TextField label="Nome del nodo" sx={{ flex: 1 }} value={customName} onChange={e => setCustomName(e.target.value)}/>
            <TextField label="Icona" sx={{ flex: 1 }} select value={icon} onChange={e => setIcon(e.target.value as DeviceIcon)}>
              <MenuItem value=''>Seleziona icona</MenuItem>
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
            <TextField label="Nome del nodo padre" sx={{ flex: 1 }} disabled />
            <TextField label="Attivo" sx={{ flex: 1 }} select value={active} onChange={(e) => setActive(e.target.value as DeviceState)}>
              {ACTIVE_STATES.map((acS) => <MenuItem key={acS} value={acS}>{acS}</MenuItem>)}
            </TextField>
          </Stack>
          <Stack gap={3} display={"flex"} flexDirection={"row"}>
            <TextField label="Origine del dato" sx={{ flex: 1 }} value={origin} onChange={(e) => setOrigin(e.target.value)}/>
            <TextField label="Nome del dispositivo" sx={{ flex: 1 }} disabled/>
          </Stack>
          <Stack gap={3} display={"flex"} flexDirection={"row"}>
            <TextField label="Destinazione d'uso" sx={{ flex: 1 }} value={destination} onChange={(e) => setDestination(e.target.value)}/>
            <TextField label="Classificazione" sx={{ flex: 1 }} select value={classification} onChange={e => setClassification(e.target.value as DeviceClassification)}>
              <MenuItem value=''>Seleziona classificazione</MenuItem>
              {DEVICE_CLASSIFICATIONS.map((dc) => <MenuItem key={dc} value={dc}>{dc}</MenuItem>)}
            </TextField>
          </Stack>
        </Stack>

        {/* SECTION TWO */}
        {/* <Stack className="modalSectionTwo" gap={2} border={"2px solid green"} p={2} marginTop={3}>
          <Stack gap={3} display={"flex"} flexDirection={"row"}> 
            <TextField label="Unità di misura originale" sx={{ flex: 1 }} disabled/>
          </Stack>
          <Stack gap={3} display={"flex"} flexDirection={"row"}>
            <TextField label="Nuova unità di misura " sx={{ flex: 1 }} disabled/>
          </Stack>
        </Stack> */}

        {/* SECTION THREE */}
        <Stack
          display={"flex"}
          flexDirection={"row"}
          marginTop={3}
          gap={3}
          border={"2px solid green"}
          p={2}
        >
          <Stack display={"flex"} flex={1}>
            <Typography fontWeight={700} textAlign={"center"} marginBottom={2}>
              Grafici da visualizzare
            </Typography>
            <Stack flex={1} display={"flex"} flexDirection={"row"}>
              <Stack flex={1} display={"flex"}>
                <Typography fontWeight={'700'}>Tempo reale</Typography>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Intensità di corrente</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Tensione</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Ripartizione</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Consumo suddiviso in fasce orarie</Typography>
                </Stack>
              </Stack>
              <Stack flex={1} display={"flex"}>
                <Typography fontWeight={'700'}>Storico</Typography>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Intensità di corrente</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Tensione</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Ripartizione</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Consumo suddiviso in fasce orarie</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Consumo Kw/h</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack display={"flex"} flex={1}>
            <Typography fontWeight={700} textAlign={"center"} marginBottom={2}>
              Consumi energia attiva
            </Typography>
            <Stack flex={1} display={"flex"} flexDirection={"row"}>
              <Stack flex={1} display={"flex"}>
                <Typography fontWeight={'700'}>Sintesi annuale</Typography>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Curva di richiesta elettrica</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Ripartizione dei consumi in fasce orarie</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Ripartizione</Typography>
                </Stack>
                <Typography marginTop={2} fontWeight={'700'}>
                  Sintesi mensili
                </Typography>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Consumo suddiviso in fasce orarie</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Curva di richiesta elettrica</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Curva di richiesta elettrica</Typography>
                </Stack>
              </Stack>
              <Stack flex={1} display={"flex"}>
                <Typography fontWeight={'700'}>Profili medi giornalieri</Typography>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Estivi</Typography>
                </Stack>
                <Stack flexDirection={"row"} alignItems={"center"}>
                  <Checkbox />
                  <Typography>Invernali</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Button
          onClick={onSubmit}
          sx={{marginTop: 3, minWidth: '150px'}}
          variant="contained">
            <Typography>SALVA</Typography>
        </Button>
      </Box>
    </Modal>
  );
}
