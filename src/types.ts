export interface CaseRow {
  caseNo: string;
  program: string;
  name: string;
  address: string;
  filedCases: string;
  complainant: string;
  nature: string;
  remarks: string;
  status: string;
}

export type CaseGroup = CaseRow[];

export interface User {
  username: string;
  password: string;
}

export interface SystemBackup {
  years: string[];
  cases: Record<string, string>;
}
