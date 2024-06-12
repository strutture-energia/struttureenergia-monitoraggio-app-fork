import { Box, Button, CircularProgress, Modal, Stack, TextField, Typography } from '@mui/material';
import React from 'react';

interface CreateDatasourceDialogInterface {
  open: boolean;
  onClose: () => void;
  onSubmit: (n: string, a: string, o: string, t: string, to: number) => void;
  loading: boolean;
}

export default function CreateDatasourceDialog({ open, onClose, onSubmit, loading }: CreateDatasourceDialogInterface) {
  const [dsName, setDsName] = React.useState<string>('InfluxDB');
  const [dsAddress, setDsAddress] = React.useState<string>('http://164.92.195.222:8086');
  const [dsOrg, setDsOrg] = React.useState<string>('Strutture Energia');
  const [dsToken, setDsToken] = React.useState<string>('HtRUtF9LsIBWgcNilRcVMJxM654y0ydmqeyfUWF1l5ig8KDjwMosTXF-ZJajivoIFnzFlIxlcqwigsYcTnLG2A==');
  const [dsTimeout, setDsTimeout] = React.useState<number>(3000);

  const saveDsDisabled = React.useMemo(() => {
    return dsName.length === 0 || dsAddress.length === 0 || dsOrg.length === 0 || dsToken.length === 0;
  }, [dsName, dsAddress, dsOrg, dsToken]);

  const onCreate = () => {
    onSubmit(dsName, dsAddress, dsOrg, dsToken, dsTimeout)
  }

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
        top={'50%'}
        display={'flex'}
        flexDirection={'column'}
        left={'50%'}
        sx={{ transform: 'translate(-50%, -50%)' }}
        width={'70vw'}
        minHeight={'500px'}
        maxHeight={'70vh'}
        bgcolor={'white'}
        boxShadow={24}
        position={'absolute'}
        overflow={'auto'}
      >
        <Typography variant="h6" component="h4" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
          Configurazione Datasource
        </Typography>
        <TextField
          label="Name"
          fullWidth
          variant="outlined"
          value={dsName}
          onChange={(e) => setDsName(e.target.value)}
        />
        <TextField
          label="Adress server ex. (http://164.92.195.222:8086)"
          fullWidth
          variant="outlined"
          margin="normal"
          value={dsAddress}
          onChange={(e) => setDsAddress(e.target.value)}
        />
        <TextField
          label="Organizazione nome"
          fullWidth
          variant="outlined"
          margin="normal"
          value={dsOrg}
          onChange={(e) => setDsOrg(e.target.value)}
        />
        <TextField
          label="Token"
          fullWidth
          variant="outlined"
          type="password"
          margin="normal"
          value={dsToken}
          onChange={(e) => setDsToken(e.target.value)}
        />
        <TextField
          label="Timeout (secondi)"
          fullWidth
          variant="outlined"
          margin="normal"
          value={dsTimeout}
          onChange={(e) => setDsTimeout(Number(e.target.value))}
        />
        <Stack flexDirection={'row'} gap={3} mt={3} justifyContent={'flex-end'}>
          <Button onClick={onClose} variant='outlined' color='error' sx={{minWidth: '150px'}} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={onCreate} variant='contained' color='primary' sx={{minWidth: '150px', gap: 2}} disabled={saveDsDisabled || loading}>
            {loading && <CircularProgress size={16} sx={{color: 'white'}} />} Crea
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
