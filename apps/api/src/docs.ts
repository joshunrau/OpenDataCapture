import { type NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupDocs(app: NestExpressApplication) {
  const httpAdapter = app.getHttpAdapter().getInstance();

  const config = new DocumentBuilder()
    .setTitle('Open Data Capture')
    .setContact('Douglas Neuroinformatics', '', 'support@douglasneuroinformatics.ca')
    .setDescription('Documentation for the REST API for Open Data Capture')
    .setLicense('Apache-2.0', 'https://www.apache.org/licenses/LICENSE-2.0')
    .setVersion('1')
    .setExternalDoc('Homepage', 'https://opendatacapture.org')
    .addTag('Authentication')
    .addTag('Groups')
    .addTag('Instruments')
    .addTag('Instrument Records')
    .addTag('Subjects')
    .addTag('Users')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  httpAdapter.get('/spec.json', (_, res) => {
    res.send(document);
  });
}
