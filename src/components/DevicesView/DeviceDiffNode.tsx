import { Stack, Typography } from '@mui/material';
import React from 'react';
import { DIFF_NODE_BG, TREE_ITEM_TITLE_HEIGHT } from './DevicesTreeView';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';

interface DeviceDiffNodeInterface {
  name: string;
  value: number;
}

export default function DeviceDiffNode({ name, value }: DeviceDiffNodeInterface) {
  return (
    <Stack
      p={2}
      display={'flex'}
      position={'absolute'}
      flexDirection={'row'}
      top={0}
      bottom={0}
      left={20}
      right={0}
      borderLeft={'1px solid #AAAAAA'}
      justifyContent={'space-between'}
      bgcolor={'transparent'}
    >
      <Stack
        position={'absolute'}
        top={0}
        left={0}
        right={0}
        borderBottom={'1px solid grey'}
        borderRadius={'0px 10px 0px 0px'}
        height={TREE_ITEM_TITLE_HEIGHT}
        bgcolor={DIFF_NODE_BG}
        justifyContent={'center'}
      >
        <Typography fontSize={13} fontWeight={800} textAlign={'center'}>
          {name}
        </Typography>
      </Stack>
      <Stack
        paddingLeft={1}
        paddingRight={1}
        display={'flex'}
        bgcolor={'white'}
        position={'absolute'}
        alignItems={'center'}
        gap={1}
        flexDirection={'row'}
        justifyContent={'flex-start'}
        borderRadius={'0px 0px 10px 0px'}
        top={TREE_ITEM_TITLE_HEIGHT}
        bottom={0}
        left={0}
        right={0}
      >
        <ChangeHistoryIcon sx={{ fontSize: 35, color: DIFF_NODE_BG }} />
        <Stack
          gap={0} 
          justifyContent={'center'}
          position={'relative'}>
            <Typography
              fontSize={13}>
              {value.toFixed(2)} kw/h
            </Typography>
            <Typography fontSize={10}
              mt={-0.5}
              color={'gray'}>energia</Typography>
          </Stack>
      </Stack>
    </Stack>
  );
}
