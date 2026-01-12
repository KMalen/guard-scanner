import { Module } from '@nestjs/common';
import { ScanService } from './scan.service';
import { Scan, ScanSchema } from 'src/schemas/scan/scan.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { VulnerabilityModule } from 'src/vulnerability/vulnerability.module';
import { ScanController } from './scan.controller';
import { BullModule } from '@nestjs/bullmq';
import { APP_CONSTANTS } from '../common/constants/app.constants';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Scan.name, schema: ScanSchema }]),
		VulnerabilityModule,
		BullModule.registerQueue({
			name: APP_CONSTANTS.SCAN_QUEUE_NAME,
		}),
	],
	providers: [ScanService],
	exports: [ScanService],
	controllers: [ScanController],
})
export class ScanModule {}
