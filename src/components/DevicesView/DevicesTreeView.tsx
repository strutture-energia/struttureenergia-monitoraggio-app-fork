import React from 'react';
import { Box, ButtonBase, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import SortableTree, { ExtendedNodeData, TreeItem, changeNodeAtPath } from 'react-sortable-tree';
import useDevicesData from '../../hooks/useDevicesData';
import './styles.css'
import MeasurementPointDialog from '../Form/MeasurementPointDialog';
import { getTreeDataFromLocalStorage, saveDeviceToLocalStorage } from '../../service/localData';
import { DeviceIcon, DeviceModalValues } from 'types/devices';
import SpeedIcon from '@mui/icons-material/Speed';
import MenuIcon from '@mui/icons-material/Menu';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { DEVICE_ICONS_SET } from 'constant/configurazionDialog';
import { updateDeviceModalMetadata } from 'service/deviceService';
import DoneIcon from '@mui/icons-material/Done';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeviceDiffNode from './DeviceDiffNode';

const TREE_ITEM_HEIGHT = 90;
export const TREE_ITEM_TITLE_HEIGHT = 30;
const NOT_AVAILABLE_NODE_BG = '#F8A392';
export const DIFF_NODE_BG = '#FCE387';
const UNION_NODE_BG = '#000000';
const DEV_NODE_BG = '#85D3C4';

const DevicesTreeView: React.FC = () => {

  const {
    treeData,
    loadingDevices,
    updateTreeData,
    onTreeDataChange,
    saveData,
    moveToList,
  } = useDevicesData();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedNode, setSelectedNode] = React.useState<{
    node: TreeItem,
    path: Array<number | string>
    parentNode: TreeItem | null
  } | null>(null);
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [canSave, setCanSave] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (loadingDevices) {
      setCanSave(false)
    } else {
      const localTreeData = getTreeDataFromLocalStorage();
      setCanSave(JSON.stringify(localTreeData) === JSON.stringify(treeData) ? false : true);
    }
  }, [treeData, loadingDevices])

  const onToggleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    selNode: TreeItem,
    path: Array<number | string>,
    parentNode: TreeItem,
  ): void => {
    setAnchorEl(event.currentTarget);
    setSelectedNode({ node: selNode, path, parentNode });
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
  }

  const getNodeKey = ({ treeIndex }: any) => treeIndex;

  const onTreeNodeDelete = (
    treeNode: TreeItem,
    path: Array<number | string>
  ) => {
    moveToList(treeNode, path, getNodeKey);
    onModalClose();
  }

  const onModalOpen = (): void => {
    setModalOpen(true);
  }

  const onModalClose = (): void => {
    setModalOpen(false);
    setAnchorEl(null);
  }

  const onModalSubmit = (customData: DeviceModalValues) => {
    const nodePath = selectedNode?.path as Array<number | string>;
    const newNode = updateDeviceModalMetadata(customData, (selectedNode?.node as TreeItem));
    const newTree = changeNodeAtPath({
      treeData,
      path: nodePath,
      newNode: newNode,
      ignoreCollapsed: true,
      getNodeKey
    });
    saveDeviceToLocalStorage(newNode);
    updateTreeData(newTree);
    onModalClose();
  }

  const CardItem = (nodeData: ExtendedNodeData) => {
    const { node, path, parentNode } = nodeData;
    const DevIcon = node.metadata?.icon
      ? DEVICE_ICONS_SET[node.metadata.icon as DeviceIcon]
      : null;
    if (node.metadata.type === 'diff') {
      return <DeviceDiffNode name={'DIFFERENZA'} value={node.metadata.value} />
    }
    const available = node.metadata.available;
    const union = node.metadata.type === 'union';
    const nodeColor = !available ? NOT_AVAILABLE_NODE_BG : union ? UNION_NODE_BG: DEV_NODE_BG;
    return (
      <Stack
        p={2}
        display={'flex'}
        position={'absolute'}
        flexDirection={'row'}
        top={0} bottom={0} left={0} right={0}
        justifyContent={'center'}
        bgcolor={'transparent'}>
        <Stack
          position={'absolute'}
          top={0} left={0} right={0}
          borderBottom={'1px solid grey'}
          borderRadius={'0px 10px 0px 0px'}
          justifyContent={'center'}
          alignItems={'center'}
          height={TREE_ITEM_TITLE_HEIGHT}
          bgcolor={union ? '#FFFFFF' : nodeColor}>
          <Typography
            fontSize={11}
            fontWeight={800}
            textAlign={'center'}>
            {union ? 'NODO' : node.metadata.customName ?? node.title}
          </Typography>
          {!union && <Typography fontSize={9} mt={'-4px'} fontStyle={'italic'}>Nome zona</Typography>}
        </Stack>
        <Stack
          paddingLeft={1}
          paddingRight={1}
          display={'flex'}
          bgcolor={'white'}
          position={'absolute'}
          alignItems={'center'}
          flexDirection={'row'}
          gap={1}
          justifyContent={'flex-start'}
          borderRadius={'0px 0px 10px 0px'}
          top={TREE_ITEM_TITLE_HEIGHT}
          bottom={0} left={0} right={0}>
          {
            union 
              ? <AccountTreeIcon sx={{ fontSize: 35, color: nodeColor }} /> 
              : DevIcon
                ? <DevIcon sx={{ fontSize: 35, color: nodeColor }} />
                : <SpeedIcon sx={{ fontSize: 35, color: nodeColor }} />
          }
          <Stack
            gap={0} 
            justifyContent={'center'}
            position={'relative'}>
            <Typography
              fontSize={13}>
              {node.metadata.value.toFixed(2)} kw/h
            </Typography>
            <Typography fontSize={10}
              mt={-0.5}
              color={'gray'}>energia</Typography>
          </Stack>
          {
            union
              ? <IconButton
                  sx={{marginLeft: 'auto'}}
                  onClick={() => onTreeNodeDelete(node, path)}>
                    <DeleteOutlineIcon sx={{color: 'black'}} />
                  </IconButton>
                : <IconButton
                    sx={{marginLeft: 'auto'}}
                    onClick={(e) => onToggleMenuClick(e, node, path, parentNode)}>
                    <MenuIcon sx={{color: 'black'}} />
                  </IconButton>
          }
        </Stack>
      </Stack>
    )
  }

  const renderHeader = () => (
    <Stack
      p={1}
      flexDirection={'row'}
      justifyContent={'flex-end'}
      height={'50px'}>
        <ButtonBase
          disabled={!canSave}
          sx={{
            p: 1.5,
            borderRadius: 2,
            minWidth: '120px',
            justifyContent: 'center',
            opacity: canSave ? 1 : 0.3,
            border: '1px solid green',
            bgcolor: '#00800133',
            gap: 2
          }} onClick={saveData}>
          <DoneIcon sx={{color: 'green'}} fontWeight={'700'}/>
          <Typography color={'green'} fontWeight={'600'}>
            Salva
          </Typography>
        </ButtonBase>
    </Stack>
  )

  return (
    <Box
      bgcolor={'white'}
      height={'100%'}
      flex={0.7}>
      {renderHeader()}
      {
        treeData.length > 0 &&
        <SortableTree
          style={{ height: 'calc(100% - 50px)' }}
          treeData={treeData}
          getNodeKey={getNodeKey}
          canDrag={(e) => e.node.metadata.type !== 'diff'}
          canDrop={(d) => {
            if (loadingDevices) {
              return false;
            }
            const parentNode = d.nextParent;
            // non posso posizionare nodi come figli di nodi verifica
            if (parentNode && parentNode.metadata.type === 'diff') {
              return false;
            }
            // non posso spostare direttamente nodi verifica
            return d.node.metadata.type !== 'diff';
          }}
          rowHeight={TREE_ITEM_HEIGHT}
          onChange={newTreeData => onTreeDataChange(newTreeData)}
          generateNodeProps={(nodeData: ExtendedNodeData) => ({
            title: CardItem(nodeData)
          })}
        />
      }
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        sx={{ marginLeft: 2, overflow: 'visible' }}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {
          selectedNode && selectedNode.node.metadata.type !== 'union' &&
          <MenuItem onClick={onModalOpen}>Edit</MenuItem>
        }
        {
          selectedNode &&
          <MenuItem onClick={() => onTreeNodeDelete(selectedNode.node, selectedNode?.path)}>Delete</MenuItem>
        }
      </Menu>
      <MeasurementPointDialog
        onSave={onModalSubmit}
        open={modalOpen}
        nodeData={selectedNode}
        onClose={onModalClose} />
    </Box >
  );
};

export default DevicesTreeView;
