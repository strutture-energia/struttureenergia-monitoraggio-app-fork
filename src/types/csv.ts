export const CSV_FILE_TYPE_15_MINUTES = {title:"Quarto d'ora", value: "quarto"} as const;
export const CSV_FILE_TYPE_TIME_VALUE = {title:"Tempo Valore", value: "tempoValore"} as const;
export const CSV_FILE_TPYES = [CSV_FILE_TYPE_15_MINUTES, CSV_FILE_TYPE_TIME_VALUE] as const;

export type CsvFileType = typeof CSV_FILE_TPYES[number];
