import { setAttributes, isDesktop } from '../../scripts/utils.js';

/**
 * creates the tab buttons from <p> elements in the nav
 * and adds them to a new tabsList element
 * @param {HTMLElement} nav
 * @param {[]} paragraphs
 */

export function createTabsList(nav, paragraphs) {
  // create tabList element and place in DOM
  const tabsList = document.createElement('div');
  tabsList.classList.add('nav-tabs-list');
  tabsList.setAttribute('role', 'tablist');
  nav.querySelector(':scope > div:nth-child(2) > div').prepend(tabsList);

  // loop through the found <p> tags and convert them to <button> tags
  // and append each button to the tabsList
  paragraphs.forEach((paragraph, index) => {
    const tabName = paragraph.textContent.toLocaleLowerCase();
    const button = document.createElement('button');
    button.innerHTML = paragraph.textContent;
    button.classList.add('nav-tabs-tab');
    setAttributes(button, {
      id: `tab-${tabName}`,
      'aria-controls': `tabpanel-${tabName}`,
      'aria-selected': `${index === 0}`, // set to "true" if first tab
      role: 'tab',
    });
    tabsList.append(button);

    // remove the unneeded paragraph tag
    paragraph.remove();
  });
}

/**
 * identifies the tab panels from <p> elements in the nav
 * and adds attributes to the <ul> elements
 * @param {HTMLElement} nav
 * @param {[]} paragraphs
 */

export function createTabPanels(nav, paragraphs) {
  const panels = [...nav.querySelectorAll(':scope > div:nth-child(2) > div > ul')];

  // the first panel needs a special class to identify it
  // as the main navigation site menu
  panels[0].classList.add('site-menu');

  panels.forEach((panel, index) => {
    const panelName = paragraphs[index]?.textContent?.toLocaleLowerCase();
    panel.classList.add('nav-tabs-panel');
    setAttributes(panel, {
      id: `tabpanel-${panelName}`,
      'aria-labelledby': `tab-${panelName}`,
      role: 'tabpanel',
      'aria-hidden': `${index !== 0}`, // set to "true" if not first tab
    });
  });
}

/**
 * attaches all event handlers needed for the tabs
 * @param {HTMLElement} nav
 */

export function attachTabEventHandlers(nav) {
  const tabButtons = nav.querySelectorAll('.nav-tabs-list button');
  const panels = nav.querySelectorAll('.nav-tabs-panel');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      panels.forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tabButtons.forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      button.setAttribute('aria-selected', true);
      nav.querySelector(`#${button.getAttribute('aria-controls')}`).setAttribute('aria-hidden', false);
    });
  });
}

/**
 * render the menu contents as accordions
 * @param {HTMLElement} nav
 */

export function createMenuAccordion(nav) {
  const siteMenu = nav.querySelector('.site-menu');

  function showMenuContentOnDesktop(accordionContent) {
    if (isDesktop()) {
      accordionContent.setAttribute('aria-hidden', false);
      accordionContent.classList.add('active');
    }
  }

  function hideMenuContentOnDesktop(accordionContent) {
    if (isDesktop()) {
      accordionContent.setAttribute('aria-hidden', true);
      accordionContent.classList.remove('active');
    }
  }

  siteMenu.querySelectorAll(':scope > li').forEach((item) => {
    item.classList.add('nav-accordion');

    // wrap the first link in a wrapper span
    const link = item.querySelector(':scope > a');
    const navAccordionLinkWrapper = document.createElement('span');
    navAccordionLinkWrapper.classList.add('nav-accordion-link-wrapper');
    navAccordionLinkWrapper.append(link);
    item.prepend(navAccordionLinkWrapper);

    // if there is accordion content, create a button to exand/collapse
    const accordionContent = item.querySelector(':scope > ul');
    if (accordionContent) {
      accordionContent.classList.add('nav-accordion-content');
      const accordionButton = document.createElement('button');
      accordionButton.classList.add('nav-accordion-button');
      accordionButton.innerHTML = '<span class="nav-accordion-button-icon">+</span>';
      navAccordionLinkWrapper.append(accordionButton);

      // attach the event handler for the new button
      accordionButton.addEventListener('click', () => {
        if (accordionContent.style.height) {
          accordionContent.style.height = null;
          accordionContent.setAttribute('aria-hidden', true);
          accordionContent.classList.remove('active');
        } else {
          accordionContent.style.height = `${accordionContent.scrollHeight + 20}px`;
          accordionContent.setAttribute('aria-hidden', false);
          accordionContent.classList.add('active');
        }
      });

      // 'hover' behaviors on desktop

      item.addEventListener('mouseenter', () => {
        showMenuContentOnDesktop(accordionContent);
      });

      item.addEventListener('mouseleave', () => {
        hideMenuContentOnDesktop(accordionContent);
      });
    }
  });
}

/**
 * Function to display search results.
 */
function displaySearchResults(results) {
  const searchResultsElement = document.getElementById('list_results');
  searchResultsElement.innerHTML = '';
  if (results.length > 0) {
    results.forEach((result) => {
      const resultElement = document.createElement('li');
      resultElement.innerHTML = `
      <a href="/vcbloomreach/search/index/?q=${result.query}" class="blm-autosuggest__suggestion-term-link" data-suggestion-text="lamp" data-uw-rm-brl="PR" data-uw-original-href="/vcbloomreach/search/index/?q=${result.query}">
        <span class="blm-autosuggest__suggestion-term-link--typed-query">
          ${result.displayText}
        </span>
      </a>
    `;
      searchResultsElement.appendChild(resultElement);
    });
    searchResultsElement.classList.add('active');
  } else {
    searchResultsElement.classList.remove('active');
  }
}

/**
 * Fetch search results based on the input in the search bar.
 */
async function fetchSearchData(query) {
  const baseUrl = 'https://suggest.dxpapi.com/api/v2/suggest/?aq=sdfd&account_id=6770&domain_key=circalighting&request_id=7940657212438&_br_uid_2=uid%3D5473418699465%3Av%3D15.0%3Ats%3D1713819834447%3Ahc%3D144&ref_url=https%3A%2F%2Fwww.visualcomfort.com%2F&url=https%3A%2F%2Fwww.visualcomfort.com%2F&request_type=suggest&catalog_views=circalighting&search_type=keyword';
  const url = new URL(baseUrl);
  url.searchParams.append('q', query);
  const data = await fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      return res.json();
    })
    .catch((err) => {
      if (err instanceof Error) {
        throw err;
      }
    });
  const results = data.suggestionGroups[0]?.querySuggestions;
  if (results) {
    // get the first 5 results
    const resultsSlice = results.slice(0, 5);
    displaySearchResults(resultsSlice);
  }
  return [];
}

/**
 * handle search bar events
 * @param {HTMLElement} searchButton
 * @param {HTMLElement} searchBar
 */

function handleSearchBarEvents(searchButton, searchBar) {
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      if (!isDesktop()) {
        searchBar.classList.toggle('active');
        // if the search bar is active, focus on the input
        if (searchBar.classList.contains('active')) {
          searchBar.querySelector('input').focus();
          // set the overflow to hidden to prevent scrolling
          document.querySelector('body').style.overflow = 'hidden';
        } else {
          // set the overflow to auto to allow scrolling
          document.querySelector('body').style.overflow = 'auto';
        }
      }
    });
  }

  // close the search bar when click outside of it
  document.addEventListener('click', (event) => {
    if (!searchBar.contains(event.target) && event.target !== searchButton && searchBar.classList.contains('active')) {
      searchBar.classList.remove('active');
      const searchResultsElement = document.getElementById('list_results');
      searchResultsElement.innerHTML = '';
      searchResultsElement.classList.remove('active');
    }
    // set the overflow to auto to allow scrolling
    document.querySelector('body').style.overflow = 'auto';
  });

  // check if the focus is on main element
  document.addEventListener('focusin', (event) => {
    if (!searchBar.contains(event.target) && event.target !== searchButton) {
      searchBar.classList.remove('active');
      const searchResultsElement = document.getElementById('list_results');
      searchResultsElement.innerHTML = '';
      searchResultsElement.classList.remove('active');
    }
    document.querySelector('body').style.overflow = 'auto';
  });

  // close the search bar when the close button is clicked
  const closeSearchButton = searchBar.querySelector('.nav-search-close');
  const searchInput = searchBar.querySelector('#searchbar');
  closeSearchButton.addEventListener('click', () => {
    searchBar.classList.remove('active');
    // clear the search input
    if (searchInput) {
      searchInput.value = '';
    }
    // clear the search results
    const searchResultsElement = document.getElementById('list_results');
    searchResultsElement.innerHTML = '';
    searchResultsElement.classList.remove('active');
    // set the overflow to auto to allow scrolling
    document.querySelector('body').style.overflow = 'auto';
  });

  searchInput.addEventListener('keyup', (event) => {
    const query = event.target.value.trim();
    const searchResultsElement = document.getElementById('list_results');
    // Check if the input has more than one character
    if (query.length > 1) {
      fetchSearchData(query);
    } else {
      // Clear search results if input is empty or has only one character
      searchResultsElement.innerHTML = '';
      searchResultsElement.classList.remove('active');
    }
  });

  // submit event for the search form
  const formSelector = searchBar.querySelector('form');
  formSelector.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query.length > 1) {
      window.location.href = `/vcbloomreach/search/index/?q=${query}`;
    }
  });
}

/**
 * create the searchbar and attach event handlers
 * @param {HTMLElement} nav
 */

export function createSearchBar(nav) {
  // wrap the image in a button
  let searchButton;
  const searchImage = nav.querySelector('.nav-header-content > ul > li > span.icon-search > img');
  // create clone of search image and add to the span.icon-search
  const searchImageClone = searchImage.cloneNode(true);
  // add the searchImage to the span icon search
  nav.querySelector('.nav-header-content > ul > li > span.icon-search').appendChild(searchImageClone);
  const searchButtonWrapper = document.createElement('button');
  searchButtonWrapper.classList.add('search-button');
  searchButtonWrapper.setAttribute('aria-label', 'Open search bar');
  searchButtonWrapper.setAttribute('id', 'search_button');
  searchImage.parentNode.insertBefore(searchButtonWrapper, searchButton);
  searchButtonWrapper.appendChild(searchImage);
  searchButton = searchButtonWrapper;
  // move the button to .nav-header-content > ul > li when has the span icon search
  const iconSearch = nav.querySelector('.nav-header-content > ul > li > span.icon-search');
  if (iconSearch) {
    const parent = iconSearch.parentNode;
    parent.insertBefore(searchButton, iconSearch);
  }

  const searchBar = document.createElement('div');
  searchBar.classList.add('nav-search-bar');

  // create a form element and append it to the nav
  const form = document.createElement('form');
  form.setAttribute('action', '/search');
  form.setAttribute('method', 'get');
  form.setAttribute('role', 'search');
  form.innerHTML = `
    <input type="text" placeholder="Search" id="searchbar" value="">
    <button type="button" class="nav-search-close" aria-label="Close search bar">
      <span class="nav-search-close-icon">x</span>
    </button>
  `;
  searchBar.append(form);

  // create a div to hold the search results
  const searchResults = document.createElement('div');
  searchResults.id = 'search_results';
  searchResults.classList.add('search-results');
  searchResults.innerHTML = `
    <div id="search_autocomplete" class="search-autocomplete">
      <ul role="listbox" id="list_results" class="search-list-results">
      </ul>
    </div>`;
  searchBar.append(searchResults);
  nav.querySelector('.nav-header-content > ul > li > span.icon-search').append(searchBar);
  const searchBarWrapper = nav.querySelector('.nav-header-content > ul > li > span.icon-search');
  // attach event handlers
  handleSearchBarEvents(searchButton, searchBarWrapper);
}
