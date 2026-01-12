import { InjectQueue } from '@nestjs/bullmq';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Scan, ScanStatus } from '../schemas/scan/scan.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VulnerabilityService } from 'src/vulnerability/vulnerability.service';
import { APP_CONSTANTS } from '../common/constants/app.constants';

export interface InitScanResponse {
	scanId: string;
	scanStatus: ScanStatus;
}

@Injectable()
export class ScanService {
	constructor(
		@InjectQueue(APP_CONSTANTS.SCAN_QUEUE_NAME)
		private readonly scanQueue: Queue,
		@InjectModel(Scan.name) private readonly scanModel: Model<Scan>,
		private readonly vulnerabilityService: VulnerabilityService,
	) {}

	async initScan(repoURL: string): Promise<InitScanResponse> {
		const scan = await this.scanModel.create({
			repoURL,
			status: ScanStatus.Queued,
		});

		const job = {
			repoURL,
			scanId: scan._id.toString(),
			status: ScanStatus.Queued,
		};

		await this.scanQueue.add(APP_CONSTANTS.JOB_TRIVY_SCAN, job);

		return {
			scanId: scan._id.toString(),
			scanStatus: ScanStatus.Queued,
		};
	}

	async getScanStatusWithVulnerabilities(
		scanId: string,
		{ page = '1', limit = '20' },
	) {
		const scan = await this.scanModel.findById(scanId).lean();
		if (!scan) {
			throw new HttpException('Scan not found', HttpStatus.NOT_FOUND);
		}

		if (scan.status !== ScanStatus.Finished) {
			return scan;
		}

		const vulnerabilities =
			await this.vulnerabilityService.getVulnerabilitiesByScanIdPaginated(
				scan._id.toString(),
				Number.parseInt(page, 10),
				Number.parseInt(limit, 10),
			);

		return {
			...scan,
			vulnerabilities,
		};
	}

	public async updateScan(
		scanId: string,
		scan: Partial<Scan>,
	): Promise<Scan | null> {
		return this.scanModel.findByIdAndUpdate(scanId, { ...scan });
	}
}
