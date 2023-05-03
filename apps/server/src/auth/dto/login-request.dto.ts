import { ApiProperty } from '@nestjs/swagger';

import { Fingerprint, LoginRequest, loginRequestSchema } from '@douglasneuroinformatics/common/auth';

import { ValidationSchema } from '@/core/decorators/validation-schema.decorator';

@ValidationSchema<LoginRequest>(loginRequestSchema)
export class LoginRequestDto implements LoginRequest {
  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'password' })
  password: string;

  @ApiProperty()
  fingerprint?: Fingerprint | null;
}