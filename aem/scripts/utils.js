/**
 * sets multiple attributes on an element
 * @param {HTMLElement} el
 * @param {object} attrs
 */

/* eslint-disable import/prefer-default-export */
export function setAttributes(el, attrs) {
  Object.keys(attrs).forEach((key) => {
    el.setAttribute(key, attrs[key]);
  });
}

/**
 * determine form factor
 * @returns {Boolean}
 */

// media query match that indicates mobile/tablet width
export function isDesktop() {
  return window.matchMedia('(min-width: 1280px)').matches;
}

// get the language selected from the URL
export function getSelectedLanguage(url) {
  // Create a new URL object if url is provided, otherwise use window.location
  const targetUrl = url ? new URL(url) : window.location;
  const path = targetUrl.pathname;
  const pathParts = path.split('/');
  const validLanguages = ['uk', 'eu'];
  const languageFromPath = pathParts[1];

  // If the language from the path is a valid language, return it
  if (languageFromPath && validLanguages.includes(languageFromPath)) {
    return languageFromPath;
  }

  return 'us';
}
