import {
  Box,
  Button,
  ButtonBase,
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
import { createNewDeviceByData } from "service/deviceService";
import CloseIcon from '@mui/icons-material/Close';
import { CSV_FILE_TPYES, CsvFileType } from "types/csv";

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


  const [deviceName, setDeviceName] = React.useState<string>('');
  const [idDevice, setIdDevice] = React.useState<string>('');
  const [dateHourValue, setDateHourValue] = React.useState<any>(null);
  const [userId, setUserId] = React.useState<string>('');
  const [area, setArea] = React.useState<string>('');
  const [fileType, setFileType] = React.useState<CsvFileType>('Quarto d\'ora');

  const currentTs: number = React.useMemo(() => Date.now(), [])

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
    if (deviceName === '') {
      alert('Nome dispositivo non valido');
      return;
    }
    //const customName = nameRef.current?.value as string;
    const deviceData: any = {
      deviceName: deviceName,
      idDevice: idDevice,
      dateHourValue: dateHourValue
    }
    await createNewDeviceByData(deviceData);
    onSave(deviceData);
  }


  const convertToDateHourValueFormat = (fileCsv: any)=>{
    let dateHourValue: any[] = [];
    if(fileCsv && fileCsv.length > 0){
      fileCsv.shift() // rimuovo header csv
      fileCsv.map((row: any)=>{
        const date = row['0']; // Assumendo che la colonna della data sia chiamata 'Giorno'
        row.shift(); // Rimuovi la colonna della data dal resto dei dati
    
        const splitDate = date.split('/');
        let startDate = new Date(splitDate[2], +splitDate[1]-1, splitDate[0]);
        startDate.setHours(startDate.getHours(), 0, 0)
        console.log("DATE", date)
        if(date === '31/10/2021' ||date === '28/03/2021' ){
          console.log("CAMBIO ORA SOLARE/LEGALE")
        }
    
        let dayValue: any = {}
    
        for (let i = 0; i < row.length; i++) {
          const value = row[i];
          //i > 95 is the ex column in csv enel quarto d'ora
          if(i > 95 && !value){
            console.log("NOOO")
            continue
          }
    
          let hours = startDate.getHours();
          if(!dayValue[hours]){
            dayValue[hours] = 0
          }
          dayValue[hours] += +value.replace(",",".");
    
          startDate.setTime(startDate.getTime() + 900000); // add 15min
        }
    
        for (const [hour, value] of Object.entries(dayValue) as any) {
          //let _value = Math.floor(value*1000)/1000
          dateHourValue.push([date, hour, value])
        }
      })
    }
    return dateHourValue;
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
        <ButtonBase onClick={onClose} sx={{gap: 1, flexDirection: 'row', alignItems: 'center'}}>
          <Typography color={'white'}>Chiudi</Typography>
          <CloseIcon sx={{color: 'white', fontWeight: '700'}}/>
        </ButtonBase>
    </Stack>
  )

  const renderFileType = () => (
    <FormControl sx={{p: 2}}>
      <FormLabel>Tipo di File</FormLabel>
      <RadioGroup row value={fileType} onChange={event => setFileType(event.target.value as CsvFileType)}>
        {CSV_FILE_TPYES.map((ft) => <FormControlLabel key={ft} value={ft} control={<Radio />} label={ft} />)}
      </RadioGroup>
    </FormControl>
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
            <TextField label="ID Utente" sx={{ flex: 1 }} value={userId} onChange={e => setUserId(e.target.value)} />
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
          <Typography variant="body1" mb={0.5} mt={1}>Carica CSV ENEL</Typography>
          <CSVReader
            accept=".csv"
            onFileLoaded={(data) => {
              setDateHourValue(convertToDateHourValueFormat(data));
            }}
          />
        </Stack>

        <Button
          onClick={onSubmit}
          sx={{ marginTop: 'auto', minWidth: '150px', ml: 'auto' }}
          variant="contained">
          <Typography color={'white'}>SALVA</Typography>
        </Button>
      </Box>
    </Modal>
  );
}
