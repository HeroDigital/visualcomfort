import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const link = block.querySelector('a');
  let data = [];

  function modifyHTML() {
    block.innerHTML = '';

    const ul = document.createElement('ul');

    data.forEach((item) => {
      const picture = createOptimizedPicture(item.image, item.title, false, [{ width: 800 }]);
      picture.lastElementChild.width = '800';
      picture.lastElementChild.height = '800';
      const createdCard = document.createElement('li');
      createdCard.innerHTML = `
        <a href="${item.url}" class="cards-card-image" aria-label="${item['anchor-text']}">
          <div data-align="center">${picture.outerHTML}</div>
        </a>
        <div class="cards-card-body">
          <h5>${item.title}</h5>
          <p>${item.description}</p>
          <p class="button-container">
            <a href="${item.url}" aria-label="${item['anchor-text']}" title="${item['anchor-text']}" class="button">${item['anchor-text']}</a>
          </p>
        </div>
      `;
      ul.append(createdCard);
    });

    block.append(ul);
  }

  async function initialize() {
    const response = await fetch(link?.href);

    if (response.ok) {
      const jsonData = await response.json();
      data = jsonData?.data;
      modifyHTML();
    }
  }

  initialize();
}
