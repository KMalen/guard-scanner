import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StartScanDto } from './dto/start-scan.dto';
import { ScanService } from './scan.service';
import {
	GetScanStatusParams,
	GetScanStatusQuery,
} from './dto/get-scan-status.dto';

@Controller('scan')
export class ScanController {
	constructor(private readonly scanService: ScanService) {}

	@Post()
	startScan(@Body() body: StartScanDto) {
		return this.scanService.initScan(body.repoLink);
	}

	@Get(':scanId')
	getScanStatus(
		@Param() params: GetScanStatusParams,
		@Query() query: GetScanStatusQuery,
	) {
		return this.scanService.getScanStatusWithVulnerabilities(
			params.scanId,
			query,
		);
	}
}
