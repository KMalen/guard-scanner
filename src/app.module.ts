import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScanProcessorModule } from './scanProcessor/scanProcessor.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScanModule } from './scan/scan.module';
import { VulnerabilityModule } from './vulnerability/vulnerability.module';

@Module({
	imports: [
		BullModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				connection: {
					host: configService.get('QUEUE_HOST'),
					port: configService.get('QUEUE_PORT'),
				},
			}),
			inject: [ConfigService],
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				uri: configService.get<string>('MONGODB_URI'),
			}),
			inject: [ConfigService],
		}),
		ScanProcessorModule,
		ScanModule,
		VulnerabilityModule,
		ConfigModule.forRoot(),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
