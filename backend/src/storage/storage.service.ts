import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  }

  async uploadImage(file: Buffer, filename: string, folder: string = 'products'): Promise<string[]> {
    const key = `${folder}/${filename}`;
    await this.s3
      .putObject({
        Bucket: this.configService.get<string>('S3_BUCKET') || 'ledvl',
        Key: key,
        Body: file,
        ContentType: 'image/jpeg',
      })
      .promise();

    const url = `${this.configService.get<string>('S3_ENDPOINT')}/${this.configService.get<string>('S3_BUCKET')}/${key}`;
    return [url];
  }
}

