import { TreeItem } from "react-sortable-tree";

export function createTreeFluxAnalysis(treeData: TreeItem[]): any {
  const sankeySeries: any = [{ fields: [
    { name: "title", values: [] },
    { name: "meta", values: [] },
    { name: "children", values: [] }
  ]}];
  treeData.forEach((node) => {
    const nodeTitle = node.title as string;
    const nodeValue = node.metadata.value;
    sankeySeries[0].fields[0].values.push(nodeTitle);
    sankeySeries[0].fields[1].values.push({"tot-en": nodeValue});
    const nodeChildren = node.children as TreeItem[];
    if (nodeChildren && nodeChildren.length > 0) {
      const nodeFluxAnalysis = nodeChildren.map(child => _createNodeFluxAnalysis(child));
      sankeySeries[0].fields[2].values.push(nodeFluxAnalysis);
    }
  })
  return {sankeySeries};
}

function _createNodeFluxAnalysis(nodeData: TreeItem) {
  const nodeTitle = nodeData.title;
  const nodeValue = nodeData.metadata?.value;
  const nodeChildren = nodeData.children as TreeItem[];
  const nodeFluxAnalysis: any = {title: nodeTitle, meta: {"tot-en": nodeValue}, children: []};
  if (nodeChildren && nodeChildren.length > 0) {
    nodeFluxAnalysis.children = nodeChildren.map(child => _createNodeFluxAnalysis(child));
  }
  return nodeFluxAnalysis;
}