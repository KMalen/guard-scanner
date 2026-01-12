import { Module } from '@nestjs/common';
import { ScanConsumer } from './scan.consumer';
import { BullModule } from '@nestjs/bullmq';
import { ScanModule } from 'src/scan/scan.module';
import { VulnerabilityModule } from 'src/vulnerability/vulnerability.module';
import { APP_CONSTANTS } from '../common/constants/app.constants';
import { TrivyScanHandler } from './handlers/trivy-scan.handler';
import { ResultsParserHandler } from './handlers/results-parser.handler';

@Module({
	imports: [
		BullModule.registerQueue({
			name: APP_CONSTANTS.SCAN_QUEUE_NAME,
		}),
		ScanModule,
		VulnerabilityModule,
	],
	providers: [ScanConsumer, TrivyScanHandler, ResultsParserHandler],
	exports: [],
})
export class ScanProcessorModule {}
