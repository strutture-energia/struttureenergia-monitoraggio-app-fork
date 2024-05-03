export function brkRef(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export function dateFormatting(date: Date, format: string | null, separator = '/') {
  let month: number | string = date.getMonth() + 1;
  month = getTwoDigitsNumber(month);
  let endDate = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  if (separator && separator !== "/" && separator !== "-") {
    throw "separator not recognized "
  }
  if (!format) {
    return endDate + "/" + month + "/" + date.getFullYear();
  }
  switch (format) {
    case "YYYMMDD":
      return date.getFullYear() + separator + month + separator + endDate;
    case "DD/MM":
      return endDate + separator + month;
    default:
      throw "format not recognized sss" + date + format
  }
}

export function getTwoDigitsNumber(number: number) {
  const stringNumber = JSON.stringify(number);
  if (stringNumber.length === 1) {
    return '0' + stringNumber;
  }
  return stringNumber;
} 
