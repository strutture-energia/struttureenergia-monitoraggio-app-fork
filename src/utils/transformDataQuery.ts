
//TODO: definire correttamente i tipo
export const transformInfluxResult = (data: any, refId = 'A', frameIndex = 0): any => {
  const queryResult = data[refId];
  if (!queryResult) {
    throw 'query reference not found'
  }
  const selectedFrame = queryResult?.frames[frameIndex];
  if (!selectedFrame) {
    throw 'frame not found'
  }

  let results: any[] = [];
  const fields = selectedFrame?.schema?.fields.labels;
  const dataValues = selectedFrame?.data?.values;
  if (fields == null || dataValues == null) {
    throw 'fields or data values must be defined'
  }
  fields?.map((field: any, idx: number) => {
    results[idx] = {
      name: field.name,
      type: field.type,
      values: dataValues[idx]
    }
  })
  return results;
}

export function formatInfluxQueryResponse(
  data: any,
  refId = 'A'
): any[] {
  const response: any[] = [];
  if (!data) {
    throw 'Error in influx query';
  }
  const queryResult = data[refId];
  if (!queryResult) {
    throw 'Query reference not found';
  }
  const frames: any[] = queryResult?.frames;
  if (!frames || !(frames instanceof Array)) {
    'Frames not found';
  }
  frames.map(frame => {
    const frameData = frame?.data;
    const frameFields = frame?.schema?.fields;
    if (frameData && frameFields) {
      const deviceValue = frameData.values[0][0];
      const deviceData = frameFields[0].labels;
      const deviceObj = { valore: deviceValue, ...deviceData };
      response.push(deviceObj);
    }
  })
  return response;
}