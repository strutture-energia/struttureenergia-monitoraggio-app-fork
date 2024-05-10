export const CSV_FILE_TYPE_15_MINUTES = "Quarto d'ora" as const;
export const CSV_FILE_TYPE_TIME_VALUE = 'Tempo Valore' as const;
export const CSV_FILE_TPYES = [CSV_FILE_TYPE_15_MINUTES, CSV_FILE_TYPE_TIME_VALUE] as const;

export type CsvFileType = typeof CSV_FILE_TPYES[number];
