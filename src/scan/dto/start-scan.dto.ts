import { IsString } from 'class-validator';

export class StartScanDto {
	@IsString()
	repoLink: string;
}
