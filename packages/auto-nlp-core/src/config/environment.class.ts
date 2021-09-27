import { Injectable } from '@nestjs/common';
import { IsOptional, IsString, IsUrl, Matches } from 'class-validator';

@Injectable()
export class Environment {
  @IsUrl({
    protocols: ['mongodb'],
    require_tld: false,
  })
  @IsOptional()
  MONGODB_URI: string;

  @IsString()
  @IsOptional()
  MONGODB_USER: string;

  @IsString()
  @IsOptional()
  MONGODB_PASSWORD: string;

  @IsUrl({
    require_tld: false,
  })
  AUTONLP_CORE_PUBLIC_URL: string;

  @IsUrl({
    require_tld: false,
  })
  AUTONLP_HF_SEARCH_SERVICE_URL: string;

  @IsUrl({
    require_tld: false,
  })
  AUTONLP_DEPLOYMENT_URL: string;

  @IsUrl({
    require_tld: false,
  })
  @IsOptional()
  AUTONLP_DEPLOYMENT_PROXY_ENTRYPOINT_URL: string;

  @IsString()
  @IsOptional()
  GITHUB_TOKEN: string;
}
