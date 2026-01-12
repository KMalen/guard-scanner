import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class GetScanStatusParams {
	@IsString()
	@IsMongoId()
	scanId: string;
}

export class GetScanStatusQuery {
	@IsString()
	@IsOptional()
	page?: string;

	@IsString()
	@IsOptional()
	limit?: string;
}
