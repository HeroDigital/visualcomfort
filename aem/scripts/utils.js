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
