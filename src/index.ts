import nconf from 'nconf';
import path from 'path';
import {ApplicationConfig, ShiftRosterApplication} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new ShiftRosterApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  nconf
    .argv()
    .env()
    .file({
      file: path.join(__dirname, '../src/config', 'default.json')
    });
  const securityConfig = nconf.get('security');
  console.log(securityConfig)
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? nconf.get('port')),
      host: process.env.HOST || '127.0.0.1',
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      cors: {
        origin: (origin: string, callback: any) => {
          // If the origin is not on the whitelist, deny the request
          /*if (securityConfig.cors.allowedOrigins.indexOf(origin) === -1) {
            const error = new Error('Not allowed by CORS');
            callback(error);
          } else {
            // Allow the request
            callback(null, true);
          }*/
          callback(null, true);
        },
        methods: securityConfig.cors.methods,
        preflightContinue: securityConfig.cors.preflightContinue,
        optionsSuccessStatus: securityConfig.cors.optionsSuccessStatus,
        credentials: securityConfig.cors.credentials,
        maxAge: securityConfig.cors.maxAge
      }
    },
  };
  console.log(config)
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
