import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import CSVReader from "react-csv-reader";
import { createNewDeviceByData } from "service/deviceService";

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


  const onSubmit = async () => {
    //const customName = nameRef.current?.value as string;
    const deviceData: any = {
      deviceName: deviceName,
      idDevice: idDevice,
      dateHourValue: dateHourValue
    }
    await createNewDeviceByData(deviceData);
    onSave(deviceData);
  }


  const convertToDateHourValueFormat = (fileCsv:any)=>{
    let dateHourValue:any[] = [];
    if(fileCsv && fileCsv.length > 0){
      fileCsv.shift() // rimuovo header csv
      fileCsv.map((row:any)=>{
        const date = row['0']; // Assumendo che la colonna della data sia chiamata 'Giorno'
        row.shift(); // Rimuovi la colonna della data dal resto dei dati
    
        const splitDate = date.split('/');
        let startDate = new Date(splitDate[2], +splitDate[1]-1, splitDate[0]);
        startDate.setHours(startDate.getHours(), 0, 0)
        console.log("DATE", date)
        if(date === '31/10/2021' ||date === '28/03/2021' ){
          console.log("CAMBIO ORA SOLARE/LEGALE")
        }
    
        let dayValue:any = {}
    
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
          let _value = Math.floor(value*1000)/1000
          dateHourValue.push([date, hour, value])
        }
      })
    }
    return dateHourValue;
  }

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
            <TextField label="Nome Device" sx={{ flex: 1 }} value={deviceName} onChange={e => setDeviceName(e.target.value)} />
            <TextField label="ID Device(es. id_del_device_01)" sx={{ flex: 1 }} value={idDevice} onChange={e => setIdDevice(e.target.value)} />
          </Stack>
        </Stack>

        <Stack mt={20}>
          <Typography variant="body1">Carica CSV ENEL</Typography>
          <CSVReader
            accept=".csv"
            onFileLoaded={(data) => {
              setDateHourValue(convertToDateHourValueFormat(data));
            }}
          />
        </Stack>

        <Button
          onClick={onSubmit}
          sx={{ marginTop: 3, minWidth: '150px' }}
          variant="contained">
          <Typography>SALVA</Typography>
        </Button>
      </Box>
    </Modal>
  );
}
