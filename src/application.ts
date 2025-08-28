import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import nconf from 'nconf';
import path from 'path';
import {MySequence} from './sequence';
import {WinstonService} from './services/winston.service';

export {ApplicationConfig};

export class ShiftRosterApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Bind the WinstonService to the application context.
    // This makes the logger service available for dependency injection.
    this.service(WinstonService);

    // Set up the custom sequence
    this.sequence(MySequence);
    // 1. Load the configuration using nconf
    console.log("datasource: " + path.join(__dirname, '../src/config', 'default.json'));
    nconf
      .argv()
      .env()
      .file({
        file: path.join(__dirname, '../src/config', 'default.json')
      });



    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
