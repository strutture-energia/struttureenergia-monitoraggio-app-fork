import { Box, Stack } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import useDevicesData from '../hooks/useDevicesData';
import Chart from 'react-google-charts';
import { getReadClient } from 'service/influx';


interface MainLayoutInterface extends PropsWithChildren {

}

export default function MainLayout({
  children
}: MainLayoutInterface) {


  
  const from = 'now-1y';
  const to = 'now'//new Date();
  const query = ` 
  from(bucket: "homeassistant")
  |> range(start: 0)
  |> filter(fn: (r) => r["_field"] == "value" and r.type_measure == "energia")
  |> map(
      fn: (r) =>
          ({r with _measurement: if r.domain == "switch" then "stato" else r._measurement}),
  )
  |> map(
      fn: (r) =>
          ({
              id_device: r.device_id,
              nome_locale: r.area,
              entityId: r.entity_id,
              nome_sensore: r.device_name,
              tipo_misurazione: r.type_measure,
              trasmissione: r.transmission,
              um_sigla: r._measurement,
              valore: r._value,
              time: r._time,
          }),
  )      
  |> sort(columns: ["time"], desc: true)
  `;
  React.useEffect(()=>{ 
    getReadClient().collectRows(query).then((r)=>{
      console.log("SONO IL RISULTATO DELLA QUERY", r)
    }).catch((e)=>{
      console.log("ERRPR QUERY", e)
    })
  },[])


  const {
    initData,
    fluxAnalisis,
  } = useDevicesData();
  console.log("fluxAnalisis", fluxAnalisis)

  //var colors = ['green', 'yellow', 'red', "blue"];
  const sankeyOptions = React.useMemo(() => {
    return {
      sankey: {

        node: {
          colors: ['green', 'yellow', 'red'],
          nodePadding: 80,
          colorMode: 'unique'
        },
        link: {
          colorMode: 'none',
          colors: ['green', 'yellow', 'red'],
        }
      },
    }
  }, [])

  React.useEffect(() => {
    initData();
  }, [initData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, bgcolor: 'white' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        {children}
      </Box>
      <Stack p={3}>
        {
          fluxAnalisis.length !== 0 &&
          <Chart
            chartType='Sankey'
            width={'calc(50vw) - 48px'}
            height={'60vh'}
            options={sankeyOptions}
            data={fluxAnalisis} />
        }
      </Stack>
    </Box>
  )
}
