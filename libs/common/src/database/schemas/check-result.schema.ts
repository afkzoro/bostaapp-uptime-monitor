import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../abstract.schema';
import { Types } from 'mongoose';
import { UrlCheckStatus } from '@app/common/typings/urlCheckStatus.enum';

@Schema({
  timestamps: true,
  timeseries: {
    timeField: 'timestamp',
    metaField: 'checkId',
    granularity: 'seconds',
  },
})
export class CheckResult extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'Check' })
  checkId: string;

  @Prop()
  timestamp: Date;

  @Prop()
  isUp: boolean;

  @Prop()
  responseTime: number;

  @Prop()
  statusCode?: number;

  @Prop()
  error?: string;

  @Prop({ type: Object })
  metadata?: {
    ipAddress?: string;
    region?: string;
    headers?: Record<string, string>;
  };
    
  @Prop({ type: String })
  status: UrlCheckStatus;

}

export const CheckResultSchema = SchemaFactory.createForClass(CheckResult);
CheckResultSchema.index({ checkId: 1, timestamp: -1 });
CheckResultSchema.index({ checkId: 1, isUp: 1 });
