import { cartApi } from '../../minicart/api.js';
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import {
  createTabsList,
  createTabPanels,
  attachTabEventHandlers,
  createMenuAccordion,
} from './header-utils.js';

/**
 * loads the nav content fragment
 * @returns {HTMLElement}
 */

async function loadNavFragment() {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  return fragment;
}

/**
 * returns a nav element with the fragment as contents
 * @param {HTMLElement} fragment
 * @returns {HTMLElement}
 */

function buildNavElement(fragment) {
  const navElement = document.createElement('nav');
  navElement.id = 'nav';
  navElement.setAttribute('aria-expanded', false);
  while (fragment.firstElementChild) navElement.append(fragment.firstElementChild);
  return navElement;
}

/**
 * returns the nav wrapped in a div with .nav-wrapper class
 * @param {HTMLElement} nav
 * @returns {HTMLElement}
 */

function wrapNav(nav) {
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  return navWrapper;
}

/**
 * deal with the section of the nav that is
 * visible when page is loaded
 * @param {Element} navHeaderContent
 */

function createNavHeader(navHeaderContent) {
  const navToggle = document.createElement('button');
  navToggle.id = 'nav-toggle';
  navToggle.classList.add('nav-toggle');
  navToggle.innerHTML = '<span class="nav-hamburger-icon"></span>';
  navHeaderContent.prepend(navToggle);

  navToggle.addEventListener('click', () => {
    const nav = document.querySelector('#nav');
    nav.setAttribute('aria-expanded', true);
    const navOverlay = document.querySelector('#nav-overlay');
    navOverlay.classList.add('active');
    document.querySelector('body').classList.add('no-scroll');
    document.querySelector('#close-menu-button').focus();
  });
}

function createMiniCart(nav) {
  const cartIcon = nav.querySelector('.icon-shopping-bag');

  // Minicart
  const minicartButton = document.createRange().createContextualFragment(`<div class="minicart-wrapper" data-count="">
    <button type="button" class="nav-cart-button">0</button>
    <div></div>
  </div>`);
  cartIcon.append(minicartButton);

  // toggle minicart on hover
  cartIcon.addEventListener('mouseover', function() {
      cartApi.toggleCart();
    });
  
  cartIcon.addEventListener('mouseout', function() {
    cartApi.toggleCart();
  });
  
  // add click event listener to minicart icon
  cartIcon.addEventListener('click', function(event) {
    event.preventDefault();
    window.location.href = '/checkout/cart/';
  });

  // listen for updates to cart item count and update UI accordingly
  cartApi.cartItemsQuantity.watch((quantity) => {
    cartIcon.querySelector('.nav-cart-button').textContent = quantity;
    cartIcon.querySelector('.minicart-wrapper').dataset.count = quantity;
  });
}

/**
 * close the nav menu
 */

function closeMenu() {
  document.querySelector('#nav').setAttribute('aria-expanded', false);
  document.querySelector('body').classList.remove('no-scroll');
  document.querySelector('#nav-overlay').classList.remove('active');
  document.querySelector('#nav-toggle').focus();
}

/**
 * create a mobile-only header that contains
 * the logo and the close menu button
 * @param {Element} navHeaderContent
 * @param {Element} menuContent
 */

function createMobileHeader(navHeaderContent, menuContent) {
  const mobileMenuHeader = document.createElement('div');
  mobileMenuHeader.classList.add('nav-mobile-menu-header');
  const closeMenuButton = document.createElement('button');
  closeMenuButton.id = 'close-menu-button';

  const navImage = navHeaderContent.querySelector(':scope > p > picture');
  const mobileNavHeaderLogoImage = document.createElement('div');
  mobileNavHeaderLogoImage.classList.add('mobile-nav-header-logo-image');
  mobileNavHeaderLogoImage.innerHTML = navImage.outerHTML;
  mobileMenuHeader.append(mobileNavHeaderLogoImage);

  closeMenuButton.innerHTML = '<span class="close-menu-button-icon">&#10799;</span>';
  mobileMenuHeader.append(closeMenuButton);
  menuContent.prepend(mobileMenuHeader);

  // close menu event handler
  closeMenuButton.addEventListener('click', () => {
    closeMenu();
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  // load nav contents and create initial element
  const nav = buildNavElement(await loadNavFragment());

  // the first section in the block is the nav header content
  const navHeaderContent = nav.querySelector(':scope > div:nth-child(1) > div');
  navHeaderContent.classList.add('nav-header-content');

  // create the overlay that display behind the menu and over page content
  const navOverlay = document.createElement('div');
  navOverlay.id = 'nav-overlay';
  navOverlay.classList.add('nav-overlay');
  document.querySelector('body').prepend(navOverlay);

  // the second section in the block is the nav menu content
  const menuContent = nav.querySelector(':scope > div:nth-child(2)');
  menuContent.classList.add('nav-menu-content');

  // find the <p> tags in the nav, which will be used
  // to designate the "tabs" for the mobile view
  const paragraphs = [...menuContent.querySelectorAll(':scope > div > p')];

  // create the nav header with hamburger expand/collapse
  createNavHeader(navHeaderContent);

  // create the minicart with item count badge and dropdown
  createMiniCart(nav);

  // create tabs list
  createTabsList(nav, paragraphs);

  // create tabs panels
  createTabPanels(nav, paragraphs);

  // attach tab handlers
  attachTabEventHandlers(nav);

  // create accordions for menu
  createMenuAccordion(nav);

  // create the mobile header
  createMobileHeader(navHeaderContent, menuContent);

  // wrap nav and append to header
  const navWrapper = wrapNav(nav);
  block.append(navWrapper);
}
