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
