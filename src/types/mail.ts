export interface EmailHeader {
  name: string;
  value: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  sizeBytes: number;
  isMalicious?: boolean;
  fileExtension: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  folder: 'inbox' | 'junk' | 'quarantine';
  isRead: boolean;
  isPhishing: boolean;
  spfStatus: 'pass' | 'fail' | 'neutral';
  dkimStatus: 'pass' | 'fail' | 'neutral';
  dmarcStatus: 'pass' | 'fail';
  originatingIp: string;
  headers: EmailHeader[];
  attachments: EmailAttachment[];
  quarantined?: boolean;
}
