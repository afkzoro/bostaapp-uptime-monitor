import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UrlProtocol } from '../typings/protocols.enum';

export class AuthenticationDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class AssertDto {
  @IsNumber()
  @IsOptional()
  statusCode?: number;
}

export class HeaderDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class CreateCheckDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsString()
  protocol: UrlProtocol;

  @IsString()
  @IsOptional()
  path?: string;

  @IsNumber()
  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  webhook?: string;

  @IsNumber()
  @IsOptional()
  timeout?: number = 5000;

  @IsNumber()
  @IsOptional()
  interval?: number = 600000;

  @IsNumber()
  @IsOptional()
  threshold?: number = 1;

  @ValidateNested()
  @Type(() => AuthenticationDto)
  @IsOptional()
  authentication?: AuthenticationDto;

  @ValidateNested({ each: true })
  @Type(() => HeaderDto)
  @IsOptional()
  httpHeaders?: HeaderDto[];

  @ValidateNested()
  @Type(() => AssertDto)
  @IsOptional()
  assert?: AssertDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  ignoreSSL?: boolean = false;
}
