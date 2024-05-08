import React from 'react';
import { Menu } from '@mui/material';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import './styles.css'

interface PeriodPickerInterface {
  range: Range[];
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

  const onRangeChange = (item: RangeKeyDict) => {
    const newRange: Range = item.selection;
    onChange(newRange);
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={onClose}>
        <DateRange
          months={2}
          //moveRangeOnFirstSelection={false}
          direction='horizontal'
          scroll={{enabled: true}}
          editableDateInputs
          onChange={onRangeChange}
          ranges={range} />
    </Menu>
  )
}
