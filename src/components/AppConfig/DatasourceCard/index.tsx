import React from 'react';
import { Typography, IconButton, Stack, ButtonBase } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatasourceCongifData } from 'service/plugin';
import influxImage from '../../../assets/influxDs.png';


// Definiamo l'interfaccia per le proprietà della MediaCard
interface MediaCardProps {
  onSelect: () => void;
  onDelete: () => void;
  data: DatasourceCongifData;
  selected: boolean;
}

// Definiamo il componente MediaCard
const DatasourceCard: React.FC<MediaCardProps> = ({ data, selected, onSelect, onDelete }) => {
  return (
    <Stack position={'relative'} mb={2}>
      <ButtonBase
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#F4F5F5',
          p: 2,
          border: selected ? '2px solid #4097EF' : 'none',
        }}
        onClick={onSelect}
      >
        <Stack flexDirection={'row'} gap={2} alignItems={'center'}>
          <img
            src={influxImage}
            style={{ width: 45, height: 45 }}
          />
          <Stack gap={0.5} justifyContent={'flex-start'}>
            <Typography fontWeight={'700'} fontSize={17} textAlign={'start'}>
              {data.name}
            </Typography>
            <Stack flexDirection={'row'} gap={1}>
              <Typography>influxDb</Typography>
              <Typography>|</Typography>
              <Typography fontStyle={'italic'}>{data.serverAddress}</Typography>
              <Typography>|</Typography>
              <Typography>{data.orgName}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </ButtonBase>
      <IconButton
        sx={{ position: 'absolute', right: 24, transform: 'translate(0%, -50%)', top: '50%', width: 32, height: 32 }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete();
        }}
      >
        <DeleteIcon sx={{ color: '#ef5350' }} />
      </IconButton>
    </Stack>
  );
};

export default DatasourceCard;
