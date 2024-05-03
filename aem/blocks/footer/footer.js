import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  block.textContent = '';

  // load footer fragment
  const footerPath = footerMeta.footer || '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  const footer = document.createElement('div');
  while (fragment.firstElementChild) {
    const frag = fragment.firstElementChild;
    const defaultContentWrapper = frag.querySelector('.default-content-wrapper');
    const immediateUlElements = defaultContentWrapper.querySelectorAll('.default-content-wrapper > ul');

    if (immediateUlElements.length > 0) {
      // Create div with class of "list"
      const newListDiv = document.createElement('div');
      newListDiv.classList.add('list');

      immediateUlElements.forEach((ul) => {
        const clonedUl = ul.cloneNode(true);
        newListDiv.appendChild(clonedUl);
        ul.parentNode.removeChild(ul);
      });

      // Create div with class of "column"
      const newColumnDiv = document.createElement('div');
      newColumnDiv.classList.add('column');

      const immediatePElements = defaultContentWrapper.querySelectorAll('.default-content-wrapper > p');
      immediatePElements.forEach((p) => {
        const clonedP = p.cloneNode(true);
        newColumnDiv.appendChild(clonedP);
        p.parentNode.removeChild(p);
      });

      defaultContentWrapper.appendChild(newColumnDiv);
      defaultContentWrapper.appendChild(newListDiv);
    }
    frag.classList.add('footer-section');
    footer.append(frag);
  }
  block.append(footer);
}
