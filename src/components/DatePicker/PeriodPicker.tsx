import React from 'react';
import { Box, Button, Menu, Typography } from '@mui/material';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import './styles.css'

interface PeriodPickerInterface {
  range: Range;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onChange: (range: Range) => void;
}

export default function PeriodPicker({
  range,
  onChange,
  anchorEl,
  onClose
}: PeriodPickerInterface) {

  const [localRange, setLocalRange] = React.useState<Range>(range);

  const onRangeChange = () => {
    onChange(localRange);
  }

  const onLocalChange = (item: RangeKeyDict) => {
    const newLocal: Range = item.selection;
    setLocalRange(newLocal);
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={!!anchorEl}
      sx={{overflow: 'hidden'}}
      onClose={onClose}>
        <Box display={'flex'} flexDirection={'column'}>
        <DateRange
          months={2}
          //moveRangeOnFirstSelection={false}
          direction='horizontal'
          //scroll={{enabled: true}}
          editableDateInputs
          onChange={onLocalChange}
          ranges={[localRange]} />
        <Button sx={{
          marginLeft: 'auto', 
          mr: 3, 
          bgcolor: '#3D91FF',
          '&:hover': {
            backgroundColor: '#3D91FF99',
          }
        }} onClick={onRangeChange}>
          <Typography color={'white'}>Conferma</Typography>
        </Button>
        </Box>
    </Menu>
  )
}
