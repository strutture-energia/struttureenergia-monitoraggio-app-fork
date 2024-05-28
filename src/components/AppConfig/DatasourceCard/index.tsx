import React, { useState } from 'react';
import { Card, CardContent, Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Item {
  id: number;
  text: string;
}

interface DatasourceCardProps {
  title: string;
  items: Item[];
}

const DatasourceCard = ({ title, items }: DatasourceCardProps) => {
  const [data, setData] = useState(items);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleOpenModal = (item: Item) => {
    setShowModal(true);
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = () => {
    if (selectedItem) {
      const newData = data.filter((item) => item.id !== selectedItem.id);
      setData(newData);
      handleCloseModal();
    }
  };

  return (
    <>
      <Card sx={{ maxWidth: 400, margin: 'auto', marginTop: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          <Stack spacing={1}>
            {data.map((item) => (
              <Stack key={item.id} direction="row" alignItems="center" justifyContent="space-between">
                <Typography>{item.text}</Typography>
                <Button onClick={() => handleOpenModal(item)} variant="outlined" sx={{ color: 'red' }}>
                  <DeleteIcon />
                </Button>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
      <Dialog open={showModal} onClose={handleCloseModal}>
        <DialogTitle>Elimina elemento</DialogTitle>
        <DialogContent>
          <Typography>Sei sicuro di voler eliminare "{selectedItem?.text}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Annulla</Button>
          <Button onClick={handleDeleteItem} sx={{ color: 'red' }}>Elimina</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DatasourceCard;
