import { deleteJsonData, saveJsonData } from "./influx";
import { TreeItem } from "react-sortable-tree";



export const saveTreeOnInflux = async (tree: TreeItem[]) => {
  try {
    await saveJsonData({tree}, "tree", "tree");
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
