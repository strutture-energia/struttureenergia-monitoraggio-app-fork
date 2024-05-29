import React, { useState } from 'react';
import { Card, CardActions, CardContent, CardMedia, Typography, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Definiamo l'interfaccia per le proprietà della MediaCard
interface MediaCardProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  onDelete: () => void;
}

// Definiamo il componente MediaCard
const MediaCard: React.FC<MediaCardProps> = ({ imageUrl, title, subtitle, onDelete }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (confirmed: boolean) => {
    setOpen(false);
    if (confirmed) {
      onDelete();
    }
  };

  return (
    <div>
      <Card sx={{ width: 800, height: 100, display: 'flex', flexDirection: 'row' }}>
        <CardMedia
          component="img"
          sx={{ width: 100 }}
          image={imageUrl}
          alt={title}
        />
        <CardContent sx={{ flex: '1 0 auto', padding: '8px' }}>
          <Typography component="div" variant="h5">
            {title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div">
            {subtitle}
          </Typography>
        </CardContent>
        <CardActions sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
          <IconButton aria-label="delete" onClick={handleClickOpen} sx={{ color: 'red' }}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
      <Dialog
        open={open}
        onClose={() => handleClose(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Conferma eliminazione"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Sei sicuro di voler eliminare questo elemento?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)} color="primary">
            Annulla
          </Button>
          <Button onClick={() => handleClose(true)} sx={{ color: 'red' }} autoFocus>
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Definiamo il componente principale App
const DatasourceCard: React.FC = () => {
  const handleDelete = () => {
    console.log('Elemento eliminato');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <MediaCard 
        imageUrl=""
        title="Titolo della Card"
        subtitle="Sotto titolo della Card"
        onDelete={handleDelete}
      />
    </div>
  );
};

export default DatasourceCard;
