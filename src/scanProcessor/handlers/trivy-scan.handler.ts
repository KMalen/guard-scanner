import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ScanService } from 'src/scan/scan.service';
import { ScanStatus } from 'src/schemas/scan/scan.schema';
import { APP_CONSTANTS } from '../../common/constants/app.constants';
import { JobInput } from '../interfaces/job.interface';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { constants, access, mkdir } from 'node:fs/promises';
import { getErrorMessage } from '../../common/utils/error.utils';

const execAsync = promisify(exec);

@Injectable()
export class TrivyScanHandler {
	private readonly logger = new Logger(TrivyScanHandler.name);
	private readonly resultsDir = join(
		process.cwd(),
		APP_CONSTANTS.SCAN_RESULTS_DIR,
	);

	constructor(private readonly scanService: ScanService) {}

	async handle(job: JobInput, scanQueue: Queue): Promise<void> {
		const { scanId, repoURL } = job;

		try {
			await this.scanService.updateScan(scanId, {
				status: ScanStatus.Scanning,
			});
			const jsonResultFilePath = await this.runTrivyScanWithRepoURL(
				repoURL,
				scanId,
			);
			await scanQueue.add(APP_CONSTANTS.JOB_JSON_PARSE, {
				scanId: job.scanId,
				jsonResultFilePath,
				status: ScanStatus.Scanning,
			});
		} catch (err) {
			const errorMessage = `Error while running trivy scan. ${getErrorMessage(err)}`;
			await this.scanService.updateScan(scanId, {
				status: ScanStatus.Failed,
				errorMessage,
			});
			this.logger.error(err);
		}
	}

	async runTrivyScanWithRepoURL(
		repoURL: string,
		scanId: string,
	): Promise<string> {
		const outputPath = join(this.resultsDir, `${scanId}.json`);

		const jsonOutputDir = join(
			process.cwd(),
			APP_CONSTANTS.SCAN_RESULTS_DIR,
		);
		await mkdir(jsonOutputDir, { recursive: true });

		const { stderr } = await execAsync(
			`trivy repo --scanners vuln --format json --output "${outputPath}" ${repoURL}`,
		);

		if (stderr) this.logger.warn(`Trivy: ${stderr}`);

		try {
			await access(outputPath, constants.F_OK);
			return outputPath;
		} catch (err) {
			this.logger.error(
				`Trivy scan failed to create output file: ${getErrorMessage(err)}`,
			);
			throw new Error('Trivy scan failed to create output file');
		}
	}
}
