import { createTheme } from "@mui/material";
import { muiTypography } from './muiTypography';

export const muiTheme = createTheme({
  components: {
    ...muiTypography
  }
})
