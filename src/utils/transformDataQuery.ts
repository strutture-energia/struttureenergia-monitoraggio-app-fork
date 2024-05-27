
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
