import { Injectable, Logger } from '@nestjs/common';
import { ScanService } from 'src/scan/scan.service';
import { VulnerabilityService } from 'src/vulnerability/vulnerability.service';
import { ScanStatus } from 'src/schemas/scan/scan.schema';
import { JobInput } from '../interfaces/job.interface';
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamValues } from 'stream-json/streamers/StreamValues';
import { getErrorMessage } from '../../common/utils/error.utils';
import { VulnerabilityTransform } from './transform/vulnerability.transform';
import { pipeline } from 'node:stream/promises';
import { APP_CONSTANTS } from 'src/common/constants/app.constants';

@Injectable()
export class ResultsParserHandler {
	private readonly logger = new Logger(ResultsParserHandler.name);

	constructor(
		private readonly scanService: ScanService,
		private readonly vulnerabilityService: VulnerabilityService,
	) {}

	async handle(job: JobInput): Promise<void> {
		const { jsonResultFilePath, scanId } = job;
		if (!jsonResultFilePath) {
			this.logger.warn(`No JSON result file path found for ${scanId}`);
			return;
		}

		try {
			await this.parseScanResults(scanId, jsonResultFilePath);
			await this.scanService.updateScan(scanId, {
				status: ScanStatus.Finished,
			});
		} catch (err) {
			const errorMessage = `Error while parsing trivy result. ${getErrorMessage(err)}`;
			await this.scanService.updateScan(scanId, {
				status: ScanStatus.Failed,
				errorMessage,
			});
			this.logger.error(errorMessage);
		} finally {
			await this.removeJsonScanResult(jsonResultFilePath);
		}
	}

	private async parseScanResults(scanId: string, filePath: string) {
		await pipeline(
			createReadStream(filePath),
			parser(),
			pick({ filter: APP_CONSTANTS.STREAM_FILTER_REGEX }),
			streamValues(),
			new VulnerabilityTransform(this.vulnerabilityService, scanId),
		);
	}

	private async removeJsonScanResult(
		jsonResultFilePath: string,
	): Promise<void> {
		return unlink(jsonResultFilePath).catch();
	}
}
