import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false, timestamps: true })
export class User extends AbstractDocument {
  @Prop({ type: String, unique: true })
  email: string;

  @Prop(String)
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationToken?: string;

  @Prop()
  verificationTokenExpires?: Date;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({
    type: {
      emailNotifications: { type: Boolean, default: true },
      webhookUrl: { type: String },
      pushoverKey: { type: String },
    },
  })
  preferences: {
    emailNotifications: boolean;
    webhookUrl?: string;
    pushoverKey?: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
