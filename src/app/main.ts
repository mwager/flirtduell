import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// https://devdactic.com/animations-ionic-app/
// import 'web-animations-js/web-animations.min';

import { AppModule } from './app.module';

import config from './firebase_config';
config.init();


platformBrowserDynamic().bootstrapModule(AppModule);
