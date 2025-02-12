import { $BaseRuntimeConfig } from '@douglasneuroinformatics/libnest/config';
import { AppFactory } from '@douglasneuroinformatics/libnest/core';

export default async function main() {
  await AppFactory.createApp({
    callback: async (app, config, logger) => {
      const port = config.API_DEV_SERVER_PORT;
      await app.listen(port);
      const url = await app.getUrl();
      logger.log(`Application is running on: ${url}`);
    },
    modules: [],
    schema: $BaseRuntimeConfig,
    version: '1'
  });
}
