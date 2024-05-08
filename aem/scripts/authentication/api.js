import { addMagentoCacheListener, getLoggedInFromLocalStorage, isTradeCustomer, getCustomerFullname } from '../../storage/util.js';
import { getConfigValue } from '../configs.js';

// eslint-disable-next-line import/prefer-default-export
export const authApi = {
  /**
   * An authentication helper method to check if the user is
   * logged in based on data in local storage.
   *
   * @returns Whether the current user is logged in
   */
  isLoggedIn: () => getLoggedInFromLocalStorage(),

  /**
   * Login with the existing Magento implementation.
   *
   * @param {*} input required input
   * @param {Object} input.formFields the form fields
   * @returns void
   */
  login: async (input) => {
    const { formFields: loginData } = input;
    loginData.captcha_form_id = 'user_login';
    loginData.context = 'checkout';

    // We'll use an abort controller to make sure we don't hang for too long blocking the user.
    const loginAbortController = new AbortController();
    setTimeout(() => loginAbortController.abort('Too long.'), 6000);

    const response = await fetch('/customer/ajax/login/', {
      signal: loginAbortController.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Store: await getConfigValue('commerce-store-code'),
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
      body: JSON.stringify(loginData),
    });
    const result = await response.json();

    return result;
  },

  /**
   * Triggers the display updates the account section.
   * Can be extended to update other areas of the nav (i.e. 'reward points')
   */
  updateAuthenticationDisplays: () => {
    const isLoggedIn = getLoggedInFromLocalStorage();
    const userIcon = document.querySelector('.icon-user');

    // dont update anything if user is logged in and the account menu is already present
    if (isLoggedIn && userIcon.querySelector('.account-menu-wrapper')) {
      return;
    }

    // if user is logged in and the account menu has not already been rendered in DOM yet
    if (isLoggedIn && userIcon.querySelector('.account-menu-wrapper') === null) {
      // updating account display
      userIcon.classList.add(isLoggedIn ? 'logged-in' : 'logged-out');
      userIcon.classList.remove(isLoggedIn ? 'logged-out' : 'logged-in');

      // build a <ul> of <li> items
      const accountMenu = document.createElement('ul');
      accountMenu.classList.add('account-menu');

      let tradeCustomerLink = '';
      if (isTradeCustomer()) {
        tradeCustomerLink = '<li><a href="/requisition_list/requisition/index/">Quotes</a></li>';
      }

      accountMenu.innerHTML = `
        <li><a href="/customer/account/">Account</a></li>
        <li><a href="/orderview/orders/history/">Orders</a></li>
        ${tradeCustomerLink}
        <li><a href="/wishlist/index/list/">Projects</a></li>
        <li><a href="/customer/account/logout">Logout</a></li>
      `;

      // create a <div> and append the <ul> to it
      // TODO consider appending this element to the mobile menu as well since that is currently missing in mobile.
      const accountMenuWrapper = document.createElement('div');
      accountMenuWrapper.classList.add('account-menu-wrapper');
      accountMenuWrapper.appendChild(accountMenu);

      // create a <div> with the text 'Welcome, ${name}' inside of it, add this div to the accountMenuWrapper
      const welcomeDiv = document.createElement('div');
      welcomeDiv.classList.add('welcome');
      welcomeDiv.textContent = `Welcome, ${getCustomerFullname()}`;
      accountMenuWrapper.prepend(welcomeDiv);

      // append the <div> to the '.icon-user' element
      userIcon.appendChild(accountMenuWrapper);

      // add click event listener to '.icon-user' element
      userIcon.addEventListener('click', function () {
        if (isLoggedIn) {
          this.classList.toggle('show-account-menu');
        }
      });
    } else {
      // else we assume the user is logged out and thus we link to the login page.
      // remove the .account-menu-wrapper element if it exists
      userIcon.querySelector('.account-menu-wrapper')?.remove();

      // wrap the .icon-user element in an <a> tag, linking to the login page
      const loginLink = document.createElement('a');
      loginLink.href = '/customer/account/login/';

      // clone the userIcon before appending it to loginLink
      const userIconClone = userIcon.cloneNode(true);
      loginLink.appendChild(userIconClone);

      // replace the .icon-user element with the <a> tag
      userIcon.replaceWith(loginLink);
    }
  },

  /**
   * Setting up a listener to update the display for all authentication-specific
   * displays when the local storage cache is updated.
   */
  listenForAuthUpdates: () => {
    addMagentoCacheListener(() => {
      authApi.updateAuthenticationDisplays();
    });
  },
};
