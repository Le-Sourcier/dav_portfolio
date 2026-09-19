export type BackupStatus = "ok" | "partial" | "fail";
export type BackupLanguage = "fr" | "en";

export interface BackupNotice {
  status: BackupStatus;
  stamp: string;
  drive: "ok" | "failed";
  attached: boolean;
  lang: BackupLanguage;
}
