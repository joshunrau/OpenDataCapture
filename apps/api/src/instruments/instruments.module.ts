import { PrismaModule } from '@douglasneuroinformatics/libnest/prisma';
import { VirtualizationModule } from '@douglasneuroinformatics/libnest/virtualization';
import { Module } from '@nestjs/common';

import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

@Module({
  controllers: [InstrumentsController],
  exports: [InstrumentsService],
  imports: [PrismaModule.forFeature('Instrument'), VirtualizationModule],
  providers: [InstrumentsService]
})
export class InstrumentsModule {}
