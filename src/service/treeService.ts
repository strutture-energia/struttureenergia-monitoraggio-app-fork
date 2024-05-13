import { deleteJsonData, getJsonData, saveJsonData } from "./influx";
import { TreeItem } from "react-sortable-tree";

interface TreeObj{
  tree: TreeItem[]
}

export const saveTreeOnInflux = async (tree: TreeItem[]) => {
  try {
    await saveJsonData({tree}, "tree", "tree");
  } catch (error) {
    console.log("ERROR DURANTE IL CARICAMENTO", error)
  }
}
export const getTreeFromInflux = async (): Promise<TreeItem[]> => {
  try {
    const treeObj: TreeObj = await getJsonData("tree", "tree");
    return treeObj ? treeObj.tree : [];
  } catch (error) {
    throw error;
  }
}

export const saveToPrintSankey = async (tree: TreeItem[]) => {
  try {
    await saveJsonData({tree}, "tree", "sankey");
  } catch (error) {
    console.log("ERROR DURANTE IL CARICAMENTO", error)
  }
}

export const deleteConfigDataOnInflux = async ()=>{
  try {
    await deleteJsonData("tree", "tree");
  } catch (error) {
    
  }
}
