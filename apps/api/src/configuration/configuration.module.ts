import { type DynamicModule, Module, type ModuleMetadata } from '@nestjs/common';
import { ConditionalModule } from '@nestjs/config';
import type { ConditionalKeys } from 'type-fest';

import type { Config } from '@/core/config';

type ConditionalModuleOptions =
  | {
      condition: ConditionalKeys<Config, boolean>;
      module: Required<ModuleMetadata>['imports'][number];
      modules?: undefined;
    }
  | {
      condition: ConditionalKeys<Config, boolean>;
      module?: undefined;
      modules: Required<ModuleMetadata>['imports'][number][];
    };

type ConfigurationModuleOptions = {
  conditionalModules: ConditionalModuleOptions[];
};

@Module({})
export class ConfigurationModule {
  static forRoot(options: ConfigurationModuleOptions): DynamicModule {
    return {
      global: true,
      imports: [
        ...options.conditionalModules.flatMap(({ condition, module, modules }) =>
          module
            ? ConditionalModule.registerWhen(module, condition)
            : modules.map((module) => ConditionalModule.registerWhen(module, condition))
        )
      ],
      module: ConfigurationModule
    };
  }
}
