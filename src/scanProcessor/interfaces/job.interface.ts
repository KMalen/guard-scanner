import { ScanStatus } from 'src/schemas/scan/scan.schema';

export interface JobInput {
	repoURL: string;
	extractedPath?: string;
	jsonResultFilePath?: string;
	scanId: string;
	status: ScanStatus;
}
