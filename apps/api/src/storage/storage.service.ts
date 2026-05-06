import { CreateBucketCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly bucket: string;
  private readonly publicStorageEndpoint: string;
  private readonly storageEndpoint: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly s3: S3Client
  ) {
    this.bucket = this.configService.get('STORAGE_BUCKET');
    this.storageEndpoint = this.configService.get('STORAGE_ENDPOINT');
    this.publicStorageEndpoint = this.configService.get('STORAGE_PUBLIC_ENDPOINT') ?? this.storageEndpoint;
  }

  async onModuleInit(): Promise<void> {
    if (this.configService.get('NODE_ENV') !== 'test') {
      try {
        await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      } catch {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      }
    }
  }
}
