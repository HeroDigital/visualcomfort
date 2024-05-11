import { getConfigValue } from '../../scripts/configs.js';
import { countries } from '../../scripts/constants.js';
import { getSelectedLanguage, setAttributes } from '../../scripts/utils.js';

export function insertFormAfterDescription(index, columnDiv) {
  if (index !== 1) return;
  const formWrapper = document.createElement('div');
  formWrapper.innerHTML = `
    <div class="signup-form">
      <form class="form subscribe" novalidate="novalidate" method="post">
        <div class="field newsletter">
          <div class="control">
            <label for="newsletter">
            <span>Email </span>
              <input name="email" type="email" id="newsletter" placeholder="email@domain.com" data-validate="{required:true, 'validate-email':true}" data-uw-rm-form="nfx">
            </label>
          </div>
        </div>
        <div class="actions">
          <button class="action subscribe primary" title="Sign Up" type="submit" aria-label="Sign Up">SUBMIT</button>
        </div>
      </form>
    </div>
    <div class="subscribe-msg" style="display: none;">
      <div class="message">
        <div></div>
      </div>
    </div>
  `;
  columnDiv.appendChild(formWrapper);
}

export function generateLanguageDropdown() {
  // Create the outer div
  const locationsDropdown = document.createElement('div');
  locationsDropdown.classList.add('locations-dropdown', 'footer');

  // Get the language selected from the URL
  const language = getSelectedLanguage();

  // check if the language is part of the params of the countries array
  const countrySelected = countries.find((c) => c.param === language) || countries[0];

  // Create the span
  const toggleSpan = document.createElement('span');
  toggleSpan.dataset.toggle = 'dropdown';
  toggleSpan.setAttribute('aria-haspopup', 'true');
  toggleSpan.setAttribute('aria-expanded', 'false');
  toggleSpan.setAttribute('id', 'dropdownMenuButton');
  toggleSpan.setAttribute('role', 'button');
  toggleSpan.setAttribute('tabindex', '0');
  toggleSpan.classList.add('action', 'toggle', 'flag', countrySelected.flag);
  toggleSpan.textContent = countrySelected.name;

  // Create the ul
  const dropdownUl = document.createElement('ul');
  dropdownUl.classList.add('dropdown');
  dropdownUl.dataset.target = 'dropdown';
  dropdownUl.setAttribute('aria-hidden', 'true');

  countries.forEach((country) => {
    const li = document.createElement('li');

    if (country.href && country.param !== language) {
      // create the a if is not the country selected
      const a = document.createElement('a');
      a.href = country.href;
      a.dataset.uwRmBrl = 'PR';
      a.dataset.uwOriginalHref = country.href;

      const flagDiv = document.createElement('div');
      flagDiv.classList.add('flag', country.flag);

      const span = document.createElement('span');
      span.textContent = country.name;

      a.append(flagDiv, span);
      li.append(a);
    } else {
      const flagDiv = document.createElement('div');
      flagDiv.classList.add('flag', country.flag);

      const span = document.createElement('span');
      span.textContent = country.name;

      li.append(flagDiv, span);
    }

    dropdownUl.append(li);
  });

  // Append the span and ul to the outer div
  locationsDropdown.append(toggleSpan, dropdownUl);

  // return toggleSpan and locationsDropdown
  return { toggleSpan, locationsDropdown };
}

export function updateFormMessage(text, status) {
  const message = document.querySelector('.subscribe-msg');
  if (!message) return;

  message.style.display = 'flex';
  message.classList.remove('success', 'error');
  message.classList.add(status);
  const messageDiv = message.querySelector('.message > div');
  messageDiv.textContent = text;
}

export function resetFormMessage() {
  const message = document.querySelector('.subscribe-msg');
  if (!message) return;

  message.style.display = 'none';
  message.classList.remove('success', 'error');
  const messageDiv = message.querySelector('.message > div');
  messageDiv.textContent = '';
}

export function validateForm(element) {
  const form = element.querySelector('form');
  if (!form) return;

  const messages = {
    successMessage: 'Thank you for your subscription.',
    errorMessageIdentify: 'There was an error identifying the user.',
    errorMessageTrack: 'There was an error tracking the user.',
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    resetFormMessage();
    const email = form.querySelector('input[name="email"]');
    const emailValue = email.value;
    if (email.checkValidity() && emailValue) {
      const errorMessage = form.querySelector('.error-message');
      if (errorMessage) errorMessage.remove();
      form.reset();

      window.exponea.identify(
        { email_id: emailValue },
        { email: emailValue },
        () => {
          window.exponea.track(
            'consent',
            {
              category: 'email',
              action: 'accept',
              valid_until: 'unlimited',
              email: emailValue,
            },
            () => {
              updateFormMessage(messages.successMessage, 'success');
            },
            () => {
              updateFormMessage(messages.errorMessageTrack, 'error');
            },
          );
        },
        () => {
          updateFormMessage(messages.errorMessageIdentify, 'error');
        },
        false,
      );
    } else {
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('error-message');
      errorMessage.textContent = 'Please enter a valid email address.';
      email.insertAdjacentElement('afterend', errorMessage);
    }
  });
}

export async function appendBloombreachScript() {
  const token = await getConfigValue('bloomreach-token');
  const script = document.createElement('script');
  const scriptContent = document.createTextNode(`
    !function(e,n,t,i,o,r){function a(e){if("number"!=typeof e)return e;var n=new Date;return new Date(n.getTime()+1e3*e)}var c=4e3,s="xnpe_async_hide";function p(e){return e.reduce((function(e,n){return e[n]=function(){e._.push([n.toString(),arguments])},e}),{_:[]})}function m(e,n,t){var i=t.createElement(n);i.src=e;var o=t.getElementsByTagName(n)[0];return o.parentNode.insertBefore(i,o),i}function u(e){return"[object Date]"===Object.prototype.toString.call(e)}r.target=r.target||"https://br.visualcomfort.com",r.file_path=r.file_path||r.target+"/js/exponea.min.js",o[n]=p(["anonymize","initialize","identify","getSegments","update","track","trackLink","trackEnhancedEcommerce","getHtml","showHtml","showBanner","showWebLayer","ping","getAbTest","loadDependency","getRecommendation","reloadWebLayers","_preInitialize"]),o[n].notifications=p(["isAvailable","isSubscribed","subscribe","unsubscribe"]),o[n]["snippetVersion"]="v2.5.0",function(e,n,t){e[n]["_"+t]={},e[n]["_"+t].nowFn=Date.now,e[n]["_"+t].snippetStartTime=e[n]["_"+t].nowFn()}(o,n,"performance"),function(e,n,t,i,o,r){e[o]={sdk:e[i],sdkObjectName:i,skipExperiments:!!t.new_experiments,sign:t.token+"/"+(r.exec(n.cookie)||["","new"])[1],path:t.target}}(o,e,r,n,i,RegExp("__exponea_etc__"+"=([\\w-]+)")),function(e,n,t){m(e.file_path,n,t)}(r,t,e),function(e,n,t,i,o,r,p){if(e.new_experiments){!0===e.new_experiments&&(e.new_experiments={});var l,f=e.new_experiments.hide_class||s,_=e.new_experiments.timeout||c,d=encodeURIComponent(r.location.href.split("#")[0]);e.cookies&&e.cookies.expires&&("number"==typeof e.cookies.expires||u(e.cookies.expires)?l=a(e.cookies.expires):e.cookies.expires.tracking&&("number"==typeof e.cookies.expires.tracking||u(e.cookies.expires.tracking))&&(l=a(e.cookies.expires.tracking))),l&&l<new Date&&(l=void 0);var x=e.target+"/webxp/"+n+"/"+r[t].sign+"/modifications.min.js?http-referer="+d+"&timeout="+_+"ms"+(l?"&cookie-expires="+Math.floor(l.getTime()/1e3):"");"sync"===e.new_experiments.mode&&r.localStorage.getItem("__exponea__sync_modifications__")?function(e,n,t,i,o){t[o][n]="<"+n+' src="'+e+'"></'+n+">",i.writeln(t[o][n]),i.writeln("<"+n+">!"+o+".init && document.writeln("+o+"."+n+'.replace("/'+n+'/", "/'+n+'-async/").replace("><", " async><"))</'+n+">")}(x,n,r,p,t):function(e,n,t,i,o,r,a,c){r.documentElement.classList.add(e);var s=m(t,i,r);function p(){o[c].init||m(t.replace("/"+i+"/","/"+i+"-async/"),i,r)}function u(){r.documentElement.classList.remove(e)}s.onload=p,s.onerror=p,o.setTimeout(u,n),o[a]._revealPage=u}(f,_,x,n,r,p,o,t)}}(r,t,i,0,n,o,e),function(e,n,t){var i;(null===(i=t.experimental)||void 0===i?void 0:i.non_personalized_weblayers)&&e[n]._preInitialize(t),e[n].start=function(i){i&&Object.keys(i).forEach((function(e){return t[e]=i[e]})),e[n].initialize(t)}}(o,n,r)}(document,"exponea","script","webxpClient",window,{
      target: "https://br.visualcomfort.com",
      token: "${token}",
      new_experiments: false,
      // replace with current customer ID or leave commented out for an anonymous customer
      // customer: window.currentUserId,
      track: {
          visits: true,
      },
    });
    exponea.start();
  `);
  script.appendChild(scriptContent);
  document.head.appendChild(script);
}

export function appendCookieSettingsButton(element, buttonText) {
  const listItem = document.createElement('li');
  const button = document.createElement('button');
  listItem.append(button);
  const targetList = element.querySelector('div.list > ul:last-child > li > ul');
  setAttributes(button, {
    id: 'ot-sdk-btn',
    class: 'ot-sdk-show-settings',
  });
  button.textContent = buttonText;
  targetList.append(listItem);
}
