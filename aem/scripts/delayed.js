// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';
import { getConfigValue } from './configs.js';
import { setAttributes } from './utils.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// GTM script delayed load
loadScript('https://a.visualcomfort.com/gtm.js?id=GTM-PMG8JJ2', { async: true });

// One Trust Script for cookie settings
function appendOneTrustScript() {
  const script = document.createElement('script');
  setAttributes(script, {
    src: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
    type: 'text/javascript',
    charset: 'UTF-8',
    'data-domain-script': '7516f616-71f9-4d8a-8637-6f189d4d0511',
    'data-document-language': 'true',
    async: true,
  });
  const scriptContent = document.createTextNode(`
    function OptanonWrapper() { }
  `);
  script.appendChild(scriptContent);
  document.querySelector('body').append(script);
}

appendOneTrustScript();

// Human Security
async function appendHumanSecurityScript() {
  const scriptSrc = await getConfigValue('human-security-script-src');
  const script = document.createElement('script');
  setAttributes(script, {
    src: scriptSrc,
    async: 'true',
  });
  document.querySelector('body').append(script);
}

await appendHumanSecurityScript();
