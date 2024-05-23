import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import CSVReader from "react-csv-reader";
import CloseIcon from '@mui/icons-material/Close';
import { CSV_FILE_TPYES, CSV_FILE_TYPE_15_MINUTES, CSV_FILE_TYPE_TIME_VALUE, CsvFileType } from "types/csv";
import { createNewDeviceByData } from "service/deviceService";
import useDevicesData from "hooks/useDevicesData";
import { getIdUserFromLocalStorage } from "service/localData";

interface CreateDeviceByCSVDialogInterface {
  open: boolean;
  onClose: () => void;
  onSave: (customData: any) => void;
}

export default function CreateDeviceByCSVDialog({
  open,
  onClose,
  onSave,
}: CreateDeviceByCSVDialogInterface) {

  const { devicesList } = useDevicesData();

  const [deviceName, setDeviceName] = React.useState<string>('');
  const [idDevice, setIdDevice] = React.useState<string>('');
  const [userId, setUserId] = React.useState<string | null>(null);
  const [area, setArea] = React.useState<string>('');
  const [fileType, setFileType] = React.useState<CsvFileType>(CSV_FILE_TYPE_TIME_VALUE);
  const [csvData, setCsvData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [invalidUserId, setInvalidUserId] = React.useState<boolean>(false);

  const currentTs: number = React.useMemo(() => Date.now(), [])

  const canSubmit: boolean = (csvData && csvData.length > 0 && !!deviceName && !!idDevice && !!userId && !!area && !!userId);

  React.useEffect(() => {
    if (open) {
      const lsIdUser = getIdUserFromLocalStorage();
      if (lsIdUser != null) {
        setUserId(lsIdUser);
        setInvalidUserId(false);
      } else {
        setInvalidUserId(true);
        setUserId(null);
      }
    }
  }, [open]);

  const onNameChange = (name: string) => {
    setDeviceName(name);
    if (name === '') {
      setIdDevice('');
      return;
    }
    const formatted = name.replace(' ', '_');
    const id = formatted + '_' + currentTs;
    setIdDevice(id);
  }

  const onSubmit = async () => {
    try {
      if (deviceName === '') {
        alert('Nome dispositivo non valido');
        return;
      }

      setLoading(true);
      const timeValue = convertCsvToTimeValue(csvData, fileType);

      //const customName = nameRef.current?.value as string;
      const deviceData: any = {
        deviceName: deviceName,
        idDevice: idDevice,
        timeValue: timeValue
      }
      console.log("deviceData", deviceData)
      await createNewDeviceByData(deviceData);
      onSave(deviceData)
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  }

  const convertCsvToTimeValue = (csvDate: any[], fileType: CsvFileType) => {
    try {
      if (fileType === CSV_FILE_TYPE_15_MINUTES) {
        return convertFromQuartoDora(csvDate);
      }

      if (fileType === CSV_FILE_TYPE_TIME_VALUE) {
        return convertFromTimeSecondValue(csvDate);
      }

      throw "tipo di file non trovato"

    } catch (error) {
      throw error
    }
  }

  const convertFromQuartoDora = (fileCsv: any[]) => {
    let timeValue: any[] = [];
    if (fileCsv && fileCsv.length > 0) {
      fileCsv.shift() // rimuovo header csv
      fileCsv.map((row: any) => {
        const date = row['0']; // Assumendo che la colonna della data sia chiamata 'Giorno'
        row.shift(); // Rimuovi la colonna della data dal resto dei dati

        const splitDate = date.split('/');
        let startDate = new Date(splitDate[2], +splitDate[1] - 1, splitDate[0]);
        startDate.setHours(startDate.getHours(), 0, 0)
        console.log("DATE", date)
        if (date === '31/10/2021' || date === '28/03/2021') {
          console.log("CAMBIO ORA SOLARE/LEGALE")
        }

        let dayValue: any = {}

        for (let i = 0; i < row.length; i++) {
          const value = row[i];
          //i > 95 is the ex column in csv enel quarto d'ora
          if (i > 95 && !value) {
            console.log("NOOO")
            continue
          }

          let hours = startDate.getHours();
          if (!dayValue[hours]) {
            dayValue[hours] = 0
          }
          dayValue[hours] += +value.replace(",", ".");

          startDate.setTime(startDate.getTime() + 900000); // add 15min
        }
          //let _value = Math.floor(value*1000)/1000
        for (const [hour, value] of Object.entries(dayValue) as any) {
          let parts = date.split('/');
          let timestamp = new Date(parts[2], parts[1] - 1, parts[0], hour).getTime();
          timeValue.push([timestamp, value])
        }
      })
    }
    return timeValue;
  }

  const convertFromTimeSecondValue = (csvDate: any[]) => {
    let timeValue: any[] = [];
    if (csvDate && csvDate.length > 0) {
      csvDate.shift() // rimuovo header csv
      csvDate.map((row: any) => {
        const date = new Date(+row[0] * 1000);
        const timestamp = date.getTime();
        const value = +row[1].replace(",", ".");

        timeValue.push([timestamp, value])
      });
    }
    return timeValue;
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
      <Typography color={'white'} fontSize={20} fontWeight={'500'}>Importa CSV</Typography>
      <ButtonBase onClick={loading ? undefined : onClose} sx={{ gap: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Typography color={'white'}>Chiudi</Typography>
        <CloseIcon sx={{ color: 'white', fontWeight: '700' }} />
      </ButtonBase>
    </Stack>
  )

  const renderFileType = () => (
    <FormControl sx={{ p: 2 }}>
      <FormLabel>Tipo di File</FormLabel>
      <RadioGroup
        row
        value={fileType.value}
        onChange={(event) => {
          const selectedFileType = CSV_FILE_TPYES.find(ft => ft.value === event.target.value);
          if (selectedFileType) {
            setFileType(selectedFileType);
          }
        }}
      >
        {CSV_FILE_TPYES.map((ft) => <FormControlLabel key={ft.value} value={ft.value} control={<Radio />} label={ft.title} />)}
      </RadioGroup>
    </FormControl>
  )

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        pl={4}
        pr={4}
        pb={4}
        pt={6}
        top={"50%"}
        display={'flex'}
        flexDirection={'column'}
        left={"50%"}
        sx={{ transform: "translate(-50%, -50%)" }}
        width={"70vw"}
        minHeight={'500px'}
        maxHeight={'70vh'}
        bgcolor={"white"}
        boxShadow={24}
        position={"absolute"}
        overflow={"auto"}
      >
        {renderToolBar()}
        <Stack gap={2} p={2}>
          <Stack gap={3} display={"flex"} flexDirection={"row"}>
            <TextField label="ID Utente" sx={{ flex: 1 }} value={userId ?? ''} disabled/>
            <TextField label="Area" sx={{ flex: 1 }} value={area} onChange={e => setArea(e.target.value)} />
          </Stack>
        </Stack>
        <Stack gap={2} p={2}>
          <Stack gap={3} display={"flex"} flexDirection={"row"}>
            <TextField label="Nome Device" sx={{ flex: 1 }} value={deviceName} onChange={e => onNameChange(e.target.value)} />
            <TextField label="ID Device" sx={{ flex: 1 }} value={idDevice} disabled />
          </Stack>
        </Stack>
        {renderFileType()}

        <Stack pl={2}>
          <Typography variant="body1" mb={0.5} mt={1}>Seleziona file CSV</Typography>
          <CSVReader
            accept=".csv"
            onFileLoaded={(data) => {
              console.log("csv loaded", data)
              setCsvData(data);
            }}
          />
        </Stack>

        <Stack
          flexDirection={'row'}
          alignItems={'center'}
          marginTop={'auto'}
          justifyContent={'flex-end'}
          gap={3}>
            {
              invalidUserId && 
              <Typography color={'#F3C612'}>
                Non è stato possibile ricavare l'id utente. Per procedere è necessario avere almeno un dispositivo in lista
              </Typography>
            }
            <Button
              disabled={!canSubmit || loading}
              onClick={onSubmit}
              sx={{ minWidth: '150px'}}
              variant="contained">
              {loading ? <CircularProgress size={24} color="inherit" /> : <Typography color={'white'}>CREA</Typography>}
            </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
