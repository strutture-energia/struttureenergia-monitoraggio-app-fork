import { Components, Theme } from "@mui/material";

export const muiTypography: Components<Omit<Theme, "components">> = {
  MuiTypography: {
    styleOverrides: {
      root: {
        color: 'black'
      }
    }
  }
}
