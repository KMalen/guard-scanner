import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { APP_CONSTANTS } from '../common/constants/app.constants';
import { JobInput } from './interfaces/job.interface';
import { TrivyScanHandler } from './handlers/trivy-scan.handler';
import { ResultsParserHandler } from './handlers/results-parser.handler';

@Processor(APP_CONSTANTS.SCAN_QUEUE_NAME)
export class ScanConsumer extends WorkerHost {
	private readonly logger = new Logger(ScanConsumer.name);

	constructor(
		private readonly trivyScanHandler: TrivyScanHandler,
		private readonly resultsParserHandler: ResultsParserHandler,
		@InjectQueue(APP_CONSTANTS.SCAN_QUEUE_NAME)
		private readonly scanQueue: Queue,
	) {
		super();
	}

	async process(job: Job<JobInput, any, string>): Promise<void> {
		switch (job.name) {
			case APP_CONSTANTS.JOB_TRIVY_SCAN: {
				await this.trivyScanHandler.handle(job.data, this.scanQueue);
				break;
			}
			case APP_CONSTANTS.JOB_JSON_PARSE: {
				await this.resultsParserHandler.handle(job.data);
				break;
			}
			default: {
				this.logger.warn(`Unknown job type: ${job.name}`);
			}
		}
	}
}
