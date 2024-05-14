//DEBUG 
console.log(',,,m', data.series)

var influxResponse = data?.series[0]?.fields;
var treeData = influxResponse[0]?.values[0] || [];
treeData = JSON.parse(treeData)?.tree;

const sankeyConfig = createTreeFluxAnalysis(treeData);


var tree = []

for (const s of sankeyConfig) {
    for (let j=0; j < s.fields[0].values.length; j++) {
        //Cicla sul numero di valori in modo da sapere quanti oggetti ci sono
         let tmpObj = {}
        for (let i=0; i < s.fields.length; i++) {
            //console.log(s)
            if (s.fields[i].name !== 'title') {
                // console.log('jsonparse',s.fields[i].name,JSON.parse(s.fields[i].values.buffer[j]))
                tmpObj[s.fields[i].name] = s.fields[i].values[j]
            } else {
                tmpObj[s.fields[i].name] = (s.fields[i].values[j])
            }                    
        } 
        tree.push(tmpObj)           
    }
}
console.log('objs:',tree)
//return 1

let sankeyData = null
var obj

let label = new Set()
let customdata = []
let linkcustomdata = []

/**
 * Visita il tree e crea l'elenco label
*/
function walkMakeLabel(tree, label) {
    for(const [k, x] of Object.entries(tree)) {        
        label.add(x.title)
        if (x.children && x.children.length > 0) {                        
            walkMakeLabel(x.children, label)            
        }
    }    
}

/** 
 * Visita il tree e crea la struttura link per il sankey
*/
function walkMakeLink(tree, label, link) {
    for(const [k, x] of Object.entries(tree)) {        
        const id = label.indexOf(x.title)
        customdata[id] = (parseFloat(x.meta['tot-en']).toFixed(2)+'KWh')
        //link.source.push(id)
        //link.target.push(id)                
        //link.value.push(x.meta['tot-en'])            
        //link.label.push(x.title)        

        if (x.children && x.children.length > 0) {
            for(const [k1, x1] of Object.entries(x.children)) {                            
                idTarget = label.indexOf(x1.title)
                link.source.push(id)
                link.target.push(idTarget)
                       
                if (x1.meta['tot-en'] == 0) {
                    link.color.push('#FF33EC')
                    link.value.push(0.1)
                    linkcustomdata.push(parseFloat(0).toFixed(2)+'KWh')        
                } else {
                  
                  if (x1.meta['tot-en'] > 0) {
                    link.color.push('#C0C0C0')
                  } else {
                    link.color.push('#FF0000')
                  }
                  let powerCons = Math.abs(x1.meta['tot-en'])
                  console.log("PoweCons:")
                  console.log(x1.meta['tot-en'])
                  link.value.push(powerCons)                    
                  linkcustomdata.push(parseFloat(powerCons.toFixed(2)+'KWh'))
                }

                link.label.push(x.title + ' - ' + x1.title)
                
                if (x1.children.length > 0) {
                    walkMakeLink([x1], label, link)            
                } else {
                    customdata[idTarget] = (parseFloat(x1.meta['tot-en']).toFixed(2)+'KWh')
                }
            }
        }
    }
}


function createTreeFluxAnalysis(treeData) {
    const sankeySeries = [{ fields: [
      { name: "title", values: [] },
      { name: "meta", values: [] },
      { name: "children", values: [] }
    ]}];
    treeData.forEach((node) => {
      const nodeTitle = node.title;
      const nodeValue = node.metadata.value;
      const nodeChildren = node.children;
      if (nodeChildren && nodeChildren.length > 0) {
        sankeySeries[0].fields[0].values.push(nodeTitle);
        sankeySeries[0].fields[1].values.push({"tot-en": nodeValue});
        const nodeFluxAnalysis = nodeChildren.map(child => _createNodeFluxAnalysis(child));
        sankeySeries[0].fields[2].values.push(nodeFluxAnalysis);
      }
    })
    return sankeySeries;
  }
  
  function _createNodeFluxAnalysis(nodeData) {
    const nodeTitle = nodeData.title;
    const nodeValue = nodeData.metadata?.value;
    const nodeChildren = nodeData.children;
    const nodeFluxAnalysis = {title: nodeTitle, meta: {"tot-en": nodeValue}, children: []};
    if (nodeChildren && nodeChildren.length > 0) {
      nodeFluxAnalysis.children = nodeChildren.map(child => _createNodeFluxAnalysis(child));
    }
    return nodeFluxAnalysis;
  }




let link = {source: [], target: [], value: [], label: [], color: []}

var obj 

walkMakeLabel(tree, label)
label = [...label]
console.log(label)
walkMakeLink(tree, label, link)

sankeyData = {    
    "hoverinfo": "all",
    "valueformat": ".2f",
    "valuesuffix": "kWh",
    "node": {
            "pad": 100,
            "thickness": 15,
            "line": {
                "color": "black",
                "width": 1
            },
            "label": label,
            "customdata": customdata,
            "hovertemplate": "%{customdata} <extra></extra>"
    },
    
    "link": {
        "source": link.source,
        "target": link.target,
        "value": link.value,
        "label": link.label,
        "color": link.color,
        "customdata": linkcustomdata,
        "hovertemplate": "value: %{customdata}<br>source: %{source.label}<br />target: %{target.label}<extra></extra>"
    }
}
console.log(sankeyData)

return {data:[sankeyData], layout: {
  //"width": "100%",
  // "height": "100%",
  "autosize": "true"
}};
