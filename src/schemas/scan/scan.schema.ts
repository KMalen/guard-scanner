import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ScanDocument = HydratedDocument<Scan>;

export enum ScanStatus {
	Queued = 'Queued',
	Scanning = 'Scanning',
	Finished = 'Finished',
	Failed = 'Failed',
}

@Schema({ timestamps: true })
export class Scan {
	@Prop()
	status: ScanStatus;

	@Prop()
	repoURL: string;

	@Prop({ required: false })
	errorMessage?: string;
}

export const ScanSchema = SchemaFactory.createForClass(Scan);
