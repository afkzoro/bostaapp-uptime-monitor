// src/checks/schemas/check.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  SchemaTypes, Types } from 'mongoose';
import { AbstractDocument } from '../abstract.schema';
import { UrlCheckStatus } from '@app/common/typings/urlCheckStatus.enum';
import { UrlProtocol } from '@app/common/typings/protocols.enum';

@Schema({ versionKey: false, timestamps: true })
export class Check extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'User'})
  user: string

  @Prop()
  name: string;

  @Prop()
  url: string;

  @Prop({ type: String, default: UrlProtocol.HTTP})
  protocol: UrlProtocol

  @Prop()
  path?: string;

  @Prop()
  port?: number;

  @Prop()
  webhook?: string;

  @Prop({ default: 5000 }) // 5 seconds
  timeout: number;

  @Prop({ default: 600000 }) // 10 minutes
  interval: number;

  @Prop({ default: 1 })
  threshold: number;

  @Prop({ type: Object })
  authentication?: {
    username: string;
    password: string;
  };

  @Prop({ type: [{ key: String, value: String }] })
  httpHeaders?: Array<{ key: string; value: string }>;

  @Prop({ type: Object })
  assert?: {
    statusCode?: number;
  };

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ default: false })
  ignoreSSL: boolean;

  @Prop({type: String, default: UrlCheckStatus.ACTIVE})
  status: UrlCheckStatus

  @Prop(SchemaTypes.Date)
  lastCheck?: string
}

export const CheckSchema = SchemaFactory.createForClass(Check);
CheckSchema.index({ userId: 1 });
CheckSchema.index({ tags: 1 });
CheckSchema.index({ status: 1, lastCheck: 1 });