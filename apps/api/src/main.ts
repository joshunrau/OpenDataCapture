import { AppFactory } from '@douglasneuroinformatics/libnest/core';

import { $Config } from './config';

export default async function main() {
  await AppFactory.createApp({
    callback: async (app, config, logger) => {
      const isProduction = config.NODE_ENV === 'production';
      const port = config[isProduction ? 'API_PROD_SERVER_PORT' : 'API_DEV_SERVER_PORT'];
      await app.listen(port);
      const url = await app.getUrl();
      logger.log(`Application is running on: ${url}`);
    },
    modules: [],
    schema: $Config,
    version: '1'
  });
}
