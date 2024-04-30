const ICONS = {
  instagramIcon: `
    <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" fill="currentColor"/></svg>
  `,
  prevIcon: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="m16.67 0 2.83 2.829-9.339 9.175 9.339 9.167L16.67 24 4.5 12.004z" fill="currentColor"/></svg>
  `,
  nextIcon: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M7.33 24 4.5 21.171l9.339-9.175L4.5 2.829 7.33 0 19.5 11.996z" fill="currentColor"/></svg>
  `,
  closeIcon: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="m23.954 21.03-9.184-9.095 9.092-9.174L21.03-.046l-9.09 9.179L2.764.045l-2.81 2.81L9.14 11.96.045 21.144l2.81 2.81 9.112-9.192 9.18 9.1z" fill="currentColor"/></svg>
  `,
};

export default async function decorate(block) {
  async function fetchData() {
    const BASE_URL = 'https://photorankapi-a.akamaihd.net';
    const VERSION = 'v2.2';
    const API_KEY = '1c1b740977981200d49891d310b5be90cce45e09eaa3c0c77115019dd67b3cd2';
    const COUNT = 6;

    const url = new URL(BASE_URL);
    url.pathname = '/streams/2230407257/media/shuffled';
    url.searchParams.append('version', VERSION);
    url.searchParams.append('auth_token', API_KEY);
    url.searchParams.append('count', COUNT);

    const data = await fetch(url)
      .then((blob) => {
        if (!blob.ok) {
          throw new Error('Failed to fetch data');
        }
        return blob.json();
      })
      .then(({ data: responseData }) => responseData)
      .catch((err) => {
        if (err instanceof Error) {
          throw err;
        }
      });

    return data;
  }

  const data = await fetchData();
  const { media } = data._embedded;

  if (!data || !media || !media.length) return;

  let selectedIndex = 0;

  block.innerHTML = `
    <div class="gallery-grid">
      ${media.map((item, index) => `
        <div class="gallery-grid__item">
          <button data-index="${index}" aria-label="Open ${item.caption} details">
            <picture>
              <source srcset="${item.images.normal}" type="image/jpeg" media="(min-width: 600px)" />
              <img src="${item.images.mobile}" alt="${item.caption}" loading="lazy" />
            </picture>
          </button>
        </div>
      `).join('')}
    </div>
  `;

  function renderModal() {
    const modalDiv = document.querySelector('.gallery-modal');
    if (modalDiv) modalDiv.remove();

    const modal = document.createElement('div');
    modal.classList.add('gallery-modal');

    const instagramPost = media[selectedIndex];
    const product = media[selectedIndex]._embedded['streams:all']._embedded.stream[0];

    const html = `
      <div class="gallery-modal__nav">
        <div class="gallery-modal__nav-panel">
          <button class="gallery-modal__nav-button prev" aria-label="Previous product">
          ${ICONS.prevIcon}
          </button>
        </div>
        <div class="gallery-modal__nav-panel">
          <button class="gallery-modal__nav-button next" aria-label="Next product">
            ${ICONS.nextIcon}
          </button>
        </div>
      </div>
      <div class="gallery-modal__content" role="dialog" aria-modal="true" id="gallery-modal" aria-label="ProductGallery">
        <button class="gallery-modal__close" aria-label="Close gallery">
          ${ICONS.closeIcon}
        </button>
        <div class="gallery-modal__body">
          <picture class="gallery-modal__image">
            <source srcset="${instagramPost.images.normal}" type="image/jpeg" media="(min-width: 600px)" />
            <img src="${instagramPost.images.mobile}" alt="${instagramPost.caption}" />
          </picture>
          <div class="gallery-modal__info">
            <a href="${instagramPost.original_source}" class="gallery-modal__post-link" target="_blank" rel="noopener noreferrer">
              ${ICONS.instagramIcon}
              <span>${instagramPost._embedded.uploader.username}</span>
            </a>
            <div class="gallery-modal__details">
              <h2 class="gallery-modal__modal-title">Shop this look</h2>
              <a href="${product.product_url}" class="gallery-modal__link">
                <picture class="gallery-modal__product">
                  <source srcset="${product._embedded.base_image.images.normal}" type="image/jpeg" media="(min-width: 600px)" />
                  <img src="${product._embedded.base_image.images.mobile}" alt="${product._embedded.base_image.caption}" />
                </picture>
              </a>
              <p class="gallery-modal__caption">${product._embedded.base_image.caption}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.innerHTML = html;
    document.body.appendChild(modal);
  }

  const products = block.querySelectorAll('.gallery-grid__item button');

  if (products) {
    products.forEach((product) => {
      product.addEventListener('click', (event) => {
        selectedIndex = parseInt(event.currentTarget.dataset.index, 10);
        renderModal();
      });
    });
  }

  document.documentElement.addEventListener('click', (event) => {
    if (event.target.closest('.gallery-modal__nav-button')) {
      if (event.target.classList.contains('prev')) {
        selectedIndex = (selectedIndex + media.length - 1) % media.length;
      } else {
        selectedIndex = (selectedIndex + 1) % media.length;
      }

      renderModal();
      return;
    }

    if (event.target.closest('.gallery-modal__close') || event.target.classList.contains('gallery-modal__nav')) {
      const modalDiv = document.querySelector('.gallery-modal');
      if (modalDiv) modalDiv.remove();
    }
  });
}
