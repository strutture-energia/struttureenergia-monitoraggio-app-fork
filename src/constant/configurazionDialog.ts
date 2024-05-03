import { CSV_ENEL_ICON, ELECTRICAL_PANEL_ICON, FRIDGE_ICON, HEAT_PUMP_ICON, MEASURE_ICON, OVEN_ICON } from './../types/devices';
import { DeviceIcon } from "types/devices";
import SpeedIcon from '@mui/icons-material/Speed';
import DvrIcon from '@mui/icons-material/Dvr';
import MicrowaveIcon from '@mui/icons-material/Microwave';
import KitchenIcon from '@mui/icons-material/Kitchen';
import HeatPumpIcon from '@mui/icons-material/HeatPump';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material';

export const DEVICE_ICONS_SET: {[key in DeviceIcon]: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
  muiName: string;
}} = {
  [MEASURE_ICON]: SpeedIcon,
  [ELECTRICAL_PANEL_ICON]: DvrIcon,
  [OVEN_ICON]: MicrowaveIcon,
  [FRIDGE_ICON]: KitchenIcon,
  [HEAT_PUMP_ICON]: HeatPumpIcon,
  [CSV_ENEL_ICON]: BackupTableIcon
}
