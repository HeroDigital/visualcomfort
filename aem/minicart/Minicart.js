/* eslint-disable import/no-cycle, camelcase, max-classes-per-file, class-methods-use-this */
import { h, Component, Fragment, render } from '../scripts/preact.js';
import { createPortal } from '../scripts/preact-portal.js';
import htm from '../scripts/htm.js';

import { store } from './api.js';
import { loadCSS } from '../scripts/aem.js';
import { removeItemFromCart, updateQuantityOfCartItem } from './cart.js';

const html = htm.bind(h);
const MAX_CART_ITEM_QTY = 10000;

let cartVisible = false;

function ConfirmDeletionOverlay(props) {
  const { close, confirm, isRemoving } = props;

  return createPortal(
    html`<div class="overlay-background">
      <div class="overlay">
        <button class="close" onclick=${close}>Close</button>
        <div class="content">
          Are you sure you would like to remove this item from the shopping
          cart?
        </div>
        <div class="actions">
          <button onclick=${close}>Cancel</button>
          <button disabled=${isRemoving} onclick=${confirm}>OK</button>
        </div>
      </div>
    </div>`,
    document.body,
  );
}

class ProductCard extends Component {
  constructor(props) {
    super();
    this.state = {
      quantity: props.item.quantity,
      quantityValid: true,
      confirmDelete: false,
      open: false,
    };
  }

  componentDidUpdate(prevProps) {
    // Check if quantity props have changed
    if (prevProps.item.quantity !== this.props.item.quantity) {
      this.setState({
        quantity: this.props.item.quantity,
        quantityValid: true,
      });
    }
  }

  static renderImage = (item) => {
    let image;
    if (item.configured_variant?.thumbnail?.url) {
      image = item.configured_variant.thumbnail.url;
    } else if (item.product?.thumbnail?.url) {
      image = item.product.thumbnail.url;
    }

    const url = new URL(image);
    url.search = '';

    return html`<picture>
      <source
        type="image/webp"
        srcset="
          ${url}?fit=bounds&height=200&width=200&bg-color=255,255,255&format=webply&optimize=medium
        "
      />
      <img
        class="product-image-photo"
        src="${url}?fit=bounds&height=200&width=200&quality=100&bg-color=255,255,255"
        alt=${item.product.name}
      />
    </picture>`;
  };

  onQuantityChange = (event) => {
    const { value } = event.target;

    let parsedQuantity = parseInt(value, 10);

    // max cart quantity for a single item is 10,000
    if (parsedQuantity > MAX_CART_ITEM_QTY) {
      parsedQuantity = MAX_CART_ITEM_QTY;
    }

    if (parsedQuantity > 0 && parsedQuantity <= MAX_CART_ITEM_QTY) {
      this.setState({ quantity: parsedQuantity, quantityValid: true });
    } else {
      this.setState({ quantity: value, quantityValid: false });
    }
  };

  onClick = () => {
    this.setState({ open: !this.state.open });
  };

  onSubmitQuantityChange = async (event) => {
    event.target.disabled = true;
    const { quantity } = this.state;
    const { item_id } = this.props.item.product;
    await this.props.api.updateQuantityOfCartItem(item_id, quantity);
    event.target.disabled = false;
  };

  render(props, state) {
    const { item, index, formatter } = props;
    const { product, prices, configurable_options } = props.item;

    return html`<li>
      <div class="minicart-product">
        <div class="image">
          <a href=${`${product.product_url}`}
            >${ProductCard.renderImage(item)}</a
          >
        </div>
        <div class="info">
          <div class="name">
            <a
              href=${`${product.product_url}`}
              dangerouslySetInnerHTML=${{ __html: product.name }}
            />
          </div>
          <div class="price">${formatter.format(prices.price.value)}</div>
          ${configurable_options &&
          html`<div class="options ${state.open ? 'open' : ''}">
            <strong onClick=${this.onClick}>See Details</strong>
            <dl>
              ${configurable_options.map(
                ({ option_label, value_label }) => html`<${Fragment}>
                  <dt>${option_label}:</dt>
                  <dd>${value_label}</dd>
                <//>`,
              )}
            </dl>
          </div>`}
          <div class="quantity">
            Qty:
            <input
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              value=${state.quantity}
              oninput=${this.onQuantityChange}
            />
            ${state.quantity !== item.quantity &&
            state.quantityValid &&
            html`<div class="quantity-update">
              <button onclick=${this.onSubmitQuantityChange}>Update</button>
            </div>`}
          </div>
        </div>
        <div class="actions">
          <a href="${product.configure_url}">Edit</a>
          <a href="#" onclick=${() => this.setState({ confirmDelete: true })}
            >Remove</a
          >
        </div>
        ${state.confirmDelete &&
        html`<${ConfirmDeletionOverlay}
          close=${() => this.setState({ confirmDelete: false })}
          confirm=${async () => {
            this.setState({ isRemoving: true });
            await this.props.api.removeItemFromCart(
              item.product.item_id,
              'Cart Quick View',
            );
            this.setState({ confirmDelete: false, isRemoving: false });
          }}
          isRemoving=${this.state.isRemoving}
        />`}
      </div>
    </li>`;
  }
}

export class Minicart extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      cart: {},
    };
    this.formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    this.pluralizer = new Intl.PluralRules('en-US');
  }

  componentDidMount() {
    // Subscribe to store changes
    this.props.api.store.subscribe((cart) => {
      this.setState({ cart, loading: false });
    });
  }

  render(props, state) {
    if (!props.visible) {
      return null;
    }

    const { close } = props.api;

    const { cart } = state;
    if (!cart.items || cart.items.length === 0) {
      return html`<div class="minicart-panel empty">
        <div class="minicart-header">
          <button class="close" onClick=${() => close(false)}>Close</button>
        </div>
        <div className="cart-empty">
          You have no items in your shopping cart.
        </div>
      </div>`;
    }

    let quantityText = '';
    if (cart.items.length > 10) {
      quantityText = `10 of ${cart.total_quantity} items in cart`;
    } else {
      quantityText = `${cart.total_quantity} items in cart`;
    }

    return html`<div class="minicart-panel">
      <div class="minicart-actions">
        <a
          href="/checkout/cart/"
          onclick=${() => (window.location.href = '/checkout/cart/')}
          >View Cart</a
        >
      </div>
      <div
        class="minicart-list-wrapper ${state.cart.items.length > 3
          ? 'scrollable'
          : ''}"
      >
        <ul class="minicart-list">
          ${state.cart.items
            .slice(0, 10)
            .map(
              (item, index) =>
                html`<${ProductCard}
                  index=${index}
                  item=${item}
                  formatter=${this.formatter}
                  api=${props.api}
                />`,
            )}
        </ul>
      </div>
      <div class="minicart-footer">
        <div class="title">${quantityText}</div>
        <div class="subtotal">
          <span class="price"
            >${this.formatter.format(
              cart.prices.subtotal_excluding_tax.value,
            )}</span
          >
        </div>
      </div>
      <div class="minicart-actions">
        <a
          class="checkout"
          href="/checkout/"
          onclick=${() => (window.location.href = '/checkout/')}
          >Begin Checkout</a
        >
      </div>
    </div>`;
  }
}

// For now this is unused but when we're using GraphQL again (maybe) then it may be useful.
// eslint-disable-next-line no-unused-vars
export async function toggle(refetch = true) {
  if (!cartVisible) {
    // Load CSS
    await loadCSS(`${window.hlx.codeBasePath || ''}/styles/minicart.css`);
  }

  cartVisible = !cartVisible;

  const app = html`<${Minicart}
    visible=${cartVisible}
    api=${{
      store,
      removeItemFromCart,
      updateQuantityOfCartItem,
      close: toggle,
    }}
  />`;

  document
    .querySelector('.minicart-wrapper')
    .classList.toggle('active', cartVisible);

  render(app, document.querySelector('.minicart-wrapper > div'));
}

export async function showCart() {
  if (!cartVisible) {
    await toggle(false);
  }
}

export async function hideCart() {
  if (cartVisible) {
    await toggle(false);
  }
}
