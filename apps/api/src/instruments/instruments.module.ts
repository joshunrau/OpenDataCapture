import { VirtualizationModule } from '@douglasneuroinformatics/libnest/virtualization';
import { Module } from '@nestjs/common';

import { InstrumentsController } from './instruments.controller';
import { InstrumentsService, type InstrumentVirtualizationContext } from './instruments.service';

@Module({
  controllers: [InstrumentsController],
  exports: [InstrumentsService],
  imports: [
    VirtualizationModule.forRoot({
      context: {
        instruments: new Map()
      } satisfies InstrumentVirtualizationContext
    })
  ],
  providers: [InstrumentsService]
})
export class InstrumentsModule {}
