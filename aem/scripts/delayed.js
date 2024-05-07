// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// GTM script delayed load
loadScript('https://a.visualcomfort.com/gtm.js?id=GTM-PMG8JJ2', { async: true });
