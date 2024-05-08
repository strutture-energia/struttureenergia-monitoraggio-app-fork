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
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { DEVICE_ICONS_SET } from 'constant/configurazionDialog';
import { updateDeviceModalMetadata } from 'service/deviceService';
import DoneIcon from '@mui/icons-material/Done';

const TREE_ITEM_HEIGHT = 90;
const TREE_ITEM_TITLE_HEIGHT = 25;

const DevicesTreeView: React.FC = () => {

  const {
    treeData,
    updateTreeData,
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
    const localTreeData = getTreeDataFromLocalStorage();
    setCanSave(JSON.stringify(localTreeData) === JSON.stringify(treeData) ? false : true)
  }, [treeData])

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

  const renderNotAvailableDot = () => (
    <Stack
      zIndex={10}
      position={'absolute'}
      top={4} right={8}
      width={15} height={15}
      borderRadius={15}
      bgcolor={'red'} />
  )

  const CardItem = (nodeData: ExtendedNodeData) => {
    const { node, path, parentNode } = nodeData;
    const DevIcon = node.metadata?.icon
      ? DEVICE_ICONS_SET[node.metadata.icon as DeviceIcon]
      : null;
    return (
      <Stack
        p={2}
        display={'flex'}
        position={'absolute'}
        flexDirection={'row'}
        top={0} bottom={0} left={0} right={0}
        justifyContent={'space-between'}
        bgcolor={'transparent'}>
        {!node.metadata.available && renderNotAvailableDot()}
        <Stack
          position={'absolute'}
          top={0} left={0} right={0}
          borderBottom={'1px solid grey'}
          borderRadius={'0px 10px 0px 0px'}
          height={TREE_ITEM_TITLE_HEIGHT}
          bgcolor={node.metadata.type !== 'diff' ? 'lightblue' : '#fff8e1'}
          justifyContent={"center"} >
          <Typography
            fontSize={13}
            fontWeight={800}
            color={
              !node.metadata.available
                ? 'red'
                : node.metadata.type === 'diff'
                  ? 'orange'
                  : 'black'
            }
            textAlign={'center'}>
            {node.metadata.customName ?? node.title}
          </Typography>
        </Stack>
        <Stack
          paddingLeft={1}
          paddingRight={1}
          display={'flex'}
          bgcolor={'white'}
          position={'absolute'}
          alignItems={'center'}
          flexDirection={'row'}
          justifyContent={'space-between'}
          borderRadius={'0px 0px 10px 0px'}
          top={TREE_ITEM_TITLE_HEIGHT}
          bottom={0} left={0} right={0}>
          {
            node.metadata.type === 'diff' ?
              <ChangeHistoryIcon sx={{ fontSize: 35, color: 'black' }} /> :
              node.metadata.type === 'union' ?
                <AccountTreeIcon sx={{ fontSize: 35, color: 'black' }} /> :
                DevIcon ?
                  <DevIcon sx={{ fontSize: 35, color: 'black' }} /> :
                  <SpeedIcon sx={{ fontSize: 35, color: 'black' }} />
          }
          <Typography>{node.metadata.value} kw/h</Typography>
          <IconButton
            disabled={node.metadata.type === 'diff'}
            onClick={(e) => onToggleMenuClick(e, node, path, parentNode)}>
            <MenuIcon />
          </IconButton>
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
      //sx={{bgcolor: 'pink'}}
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
          canDrop={(d) => {
            const parentNode = d.nextParent;
            // non posso posizionare nodi come figli di nodi verifica
            if (parentNode && parentNode.metadata.type === 'diff') {
              return false;
            }
            // non posso spostare direttamente nodi verifica
            return d.node.metadata.type !== 'diff';
          }}
          rowHeight={TREE_ITEM_HEIGHT}
          onChange={newTreeData => updateTreeData(newTreeData)}
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
