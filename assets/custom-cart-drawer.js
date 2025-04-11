const CustomCartDrawer = () => {
  const drawer = document.querySelector('[data-custom-cart-drawer]');

  if (localStorage.getItem('reopenDrawer')) {
    localStorage.removeItem('reopenDrawer');
    drawer.classList.add('active');
  }

  drawer.querySelectorAll('[data-quantity-control-button]').forEach((button) => {
    button?.addEventListener('click', (e) => {
      e.preventDefault();
      updateQuantity(e)
    })
  })

  drawer.querySelectorAll('[data-remove-item-button]').forEach(button => {
    button?.addEventListener('click', (e) => {
      e.preventDefault();
      removeItem(e)
    })
  })

  async function updateQuantity(e) {
    const btn = e.target;
    const itemId = btn.dataset.itemId;
    const isPlus = btn.classList.contains('plus');
    const quantityElement = btn.parentElement.querySelector('[data-quantity-count]');
    const currentQuantity = parseInt(quantityElement.textContent); // convert to int(quantity count)
    const newQuantity = isPlus ? currentQuantity + 1 : currentQuantity - 1;

    if (newQuantity < 1) return;

    try {
      const res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          quantity: newQuantity
        })
      })

      const cart = await res.json();

      if (res.ok) {
        quantityElement.textContent = newQuantity;

        const minusBtn = btn.parentElement.querySelector('[data-quantity-control-button-minus]');
        minusBtn.disabled = newQuantity === 1;

        updateCartCount(cart.item_count);
        updateFreeShippingProgressBar(cart.total_price);

        const subtotalElement = drawer.querySelector('[data-subtotal-price]');
        if (subtotalElement) subtotalElement.textContent = formatPrice(cart.total_price);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const updateCartCount = (count) => {
    const countTitleElement = drawer.querySelector('[data-count-text]');
    
    if (countTitleElement) {
      countTitleElement.textContent = `(${count})`;
    }
  }

  const updateFreeShippingProgressBar = (totalPrice) => {
    const freeShippingThreshold = 35000;
    const progressBarElement = drawer.querySelector('[data-free-shipping-bar-progress-fill]');
    const progressBarLabel = drawer.querySelector('[data-free-shipping-bar-text-label]');

    if (progressBarElement && progressBarLabel) {
      const progressBar = Math.min((totalPrice / freeShippingThreshold) * 100, 100);
      const remainingPrice = Math.max(freeShippingThreshold - totalPrice, 0); 

      progressBarElement.style.width = `${progressBar}%`;
      progressBarLabel.innerText = remainingPrice === 0 ? 'You can get FREE shipping!' : `add $${(remainingPrice / 100).toFixed(2)} more for FREE shipping`;
    }
  }

  const removeItem = async (e) => {
    const btn = e.target.closest('[data-remove-item-button]');
    const itemId = btn.dataset.itemId;

    try {
      const res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          quantity: 0,
        })
      })

      const cart = await res.json();

      if (res.ok) {
        if (cart.item_count === 0) {
          localStorage.setItem('reopenDrawer', 'true');
          window.location.reload();
        } else {
          const itemElement = btn.closest('[data-drawer-products-item]');
          if (itemElement) itemElement.remove();

          updateCartCount(cart.item_count);
          updateFreeShippingProgressBar(cart.total_price);

          const subtotalElement = drawer.querySelector('[data-subtotal-price]');
          if (subtotalElement) {
            subtotalElement.textContent = formatPrice(cart.total_price);
          }

          await updateRecommendedProducts();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  const updateRecommendedProducts = async () => {
    const recommendContainer = drawer.querySelector('[data-recommend-products-container]');
    if (!recommendContainer) return;

    try {
      recommendContainer.innerHTML = `
        <div class="drawer__recommend-products-loading">
          <div class="loading-spinner">
            <svg xmlns="http://www.w3.org/2000/svg" class="spinner" viewBox="0 0 66 66"><circle stroke-width="6" cx="33" cy="33" r="30" fill="none" class="path"/></svg>
          </div>
        </div>
      `;

      const cart = await fetch('/cart.js');
      const cartRes = await cart.json();

      if (!cartRes.items.length) return;

      const firstCartItem = cartRes.items[0];
      const currentRecommendButton = recommendContainer.querySelector('[data-add-recommended-to-cart-button]');
      const currentRecommendProductId = currentRecommendButton?.dataset.productId || firstCartItem.product_id.toString();

      let nextProductWithRecommendations = null;
      for (let i = 0; i < cartRes.items.length; i++) {
        const item = cartRes.items[i];
        if (item.product_id.toString() === currentRecommendProductId) {
          nextProductWithRecommendations = item;
        }
        break;
      }

      if (!nextProductWithRecommendations) {
        recommendContainer.innerHTML = '';
        return;
      }

      const query = `{
        product(handle: "${nextProductWithRecommendations.handle}") {
          metafields(identifiers: [
            { namespace: "custom", key: "related_products" }
          ]) {
            key
            value
            namespace
          }
        }
      }`

      const shopifyStorefrontAccessToken = '39172e6ebd898f35442981a54c9b1941';
      const metafieldsRes = await fetch(`/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': shopifyStorefrontAccessToken,
        },
        body: JSON.stringify({ query })
      });

      const metafieldsData = await metafieldsRes.json();
      const nextRelatedProductMetafields = metafieldsData.data.product.metafields[0];
      const nextRelatedProductId = nextRelatedProductMetafields ? JSON.parse(nextRelatedProductMetafields.value)[0] : null;

      if (nextRelatedProductId !== null) {
        const nextRelatedProductQuery = `{
          product(id: "${nextRelatedProductId}") {
            title
            handle
            availableForSale
            featuredImage {
              url
            }
            priceRange {
              minVariantPrice {
                amount
              }
            }
            variants(first: 1) {
              nodes {
                id
                price {
                  amount
                }
              }
            }
          }
        }`
  
        const nextRelatedProductRes = await fetch(`/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': shopifyStorefrontAccessToken,
          },
          body: JSON.stringify({ query: nextRelatedProductQuery })
        });
  
        const recommendedProductData = await nextRelatedProductRes.json();
        const product = recommendedProductData.data.product;
        const variantId = product.variants.nodes[0].id.split('/').pop();

        const existingCartItem = cartRes.items.find(item => 
          item.variant_id.toString() === variantId
        )
  
        if (existingCartItem) {
          const itemElement = drawer.querySelector(`[data-item-id="${existingCartItem.id}"]`);
          if (itemElement) {
            itemElement.remove();
          }         

          recommendContainer.innerHTML = `
            <div class="drawer__recommend-products-title block"></div>
          `;
          return;
        } else {
          const nextRelatedProductIdNumber = parseInt(nextRelatedProductId.split('/').pop());
          const recommendedProductHtml = `
            ${product ?
              `<div class="drawer__recommend-products-title block">How about this product?</div>`
              : `<div class="drawer__recommend-products-title block"></div>`
            }
            <div class="cart-drawer__divider"></div>
            <div class="drawer__recommend-products-items">
              <div class="drawer__recommend-products-item">
                <div class="drawer__recommend-products-item-img">
                  <a href="/products/${product.handle}">
                    <img
                      class="drawer__recommend-products-item-img-item"
                      src="${product.featuredImage.url}"
                      alt="${product.title}"
                      loading="lazy"
                      width="64"
                      height="64">
                  </a>
                </div>
                <div class="drawer__recommend-products-item-title">
                  <p>${product.title}</p>
                </div>
                <div class="drawer__recommend-products-item-price">
                  ${product.availableForSale
                    ? `<button
                      class="drawer__recommend-products-item-price-text add-to-cart-recommend"
                      data-product-id="${nextRelatedProductIdNumber}"
                      data-variant-id="${variantId}"
                      data-add-recommended-to-cart-button
                    >ADD ${formatPrice(parseFloat(product.priceRange.minVariantPrice.amount) * 100)}</button>`
                    : `<p
                      class="drawer__recommend-products-item-price-text add-to-cart-recommend--sold-out"
                      data-product-id="${nextRelatedProductIdNumber}"
                      data-variant-id="${variantId}"
                      >Sold Out</p>`
                  }
                </div>
              </div>
            </div>
            <div class="cart-drawer__divider"></div>
          `
          recommendContainer.innerHTML = recommendedProductHtml;

          recommendContainer.querySelectorAll('[data-add-recommended-to-cart-button]').forEach(button => {
            button?.addEventListener('click', async (e) => {
              e.preventDefault();
              addRecommendedToCart(e);
            });
          });
        }
      } else {
        recommendContainer.innerHTML = `
          <div class="drawer__recommend-products-title block"></div>
        `;
        return;
      }
    } catch (err) {
      console.error('Error updating recommended product: ', err);
      recommendContainer.innerHTML = '';
    }
  }

  const addRecommendedToCart = async (e) => {
    const btn = e.currentTarget;

    if (btn.disabled) return;
    btn.disabled = true;

    try {
      const variantId = btn.dataset.variantId;

      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              id: variantId,
              quantity: 1,
            }
          ]
        })
      })
      
      if (res.ok) {
        const cart = await fetch('/cart.js');
        const cartRes = await cart.json();

        const newItem = cartRes.items.find(item => item.variant_id.toString() === variantId);

        const productsContainer = document.querySelector('[data-drawer-products-container]');
        productsContainer?.setAttribute('data-single-item', 'false');
        
        const newItemHTML = `
          <div class="drawer__products-item" data-item-id="${newItem.id}" data-drawer-products-item>
            <div class="drawer__products-img">
              <a href="${newItem.url}">
                <img
                  class="drawer__products-img-item"
                  src="${newItem.image}"
                  alt="${newItem.title}"
                  loading="lazy"
                  width="168"
                  height="168"
                >
              </a>
            </div>
            <div class="drawer__products-item-info">
              <div class="drawer__products-item-info-title">
                <p>${newItem.product_title}</p>
              </div>
              <div class="drawer__products-item-info-price">
                ${formatPrice(newItem.price)}
              </div>
              <div class="drawer__products-item-info-quantity">
                <button
                class="drawer__products-item-info-quantity__button minus"
                data-quantity-control-button
                data-quantity-control-button-minus
                data-item-id="${newItem.id}"
                ${newItem.quantity === 1 ? 'disabled' : ''}
                >-</button>
                <span class="drawer__products-item-info-quantity__count" data-quantity-count>${newItem.quantity}</span>
                <button
                  class="drawer__products-item-info-quantity__button plus"
                  data-quantity-control-button
                  data-quantity-control-button-plus
                  data-item-id="${newItem.id}"
                >+</button>
              </div>
              <div class="drawer__products-item-remove">
                <button class="drawer__products-item-remove-button" data-item-id="${newItem.id}" data-remove-item-button>
                  Remove
                </button>
              </div>
            </div>
          </div>
        `;

        productsContainer?.insertAdjacentHTML('beforeend', newItemHTML);
        const newItemElement = productsContainer.lastElementChild;
        initializeItemControls(newItemElement);

        updateCartCount(cartRes.item_count);
        document.querySelector('[data-subtotal-price]').textContent = formatPrice(cartRes.total_price);
        updateFreeShippingProgressBar(cartRes.total_price);

        await updateRecommendedProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      btn.disabled = false;
    }
  }

  const formatPrice = cents => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }

  const initializeItemControls = itemElement => {
    const plusBtn = itemElement.querySelector('[data-quantity-control-button-plus]');
    const minusBtn = itemElement.querySelector('[data-quantity-control-button-minus]');
    const removeBtn = itemElement.querySelector('[data-remove-item-button]');

    plusBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      updateQuantity(e);
    })

    minusBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      updateQuantity(e);
    })

    removeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      removeItem(e);
    })
  }

  drawer.querySelectorAll('[data-add-recommended-to-cart-button]').forEach(button => {
    button?.addEventListener('click', (e) => {
      e.preventDefault();
      addRecommendedToCart(e);
    })
  })

  const updateDrawerContents = async () => {
    try {
      const cart = await fetch('/cart.js');
      const cartData = await cart.json();

      updateCartCount(cartData.item_count);

      const subtotalElement = drawer.querySelector('[data-subtotal-price]');
      if (subtotalElement) {
        subtotalElement.textContent = formatPrice(cartData.total_price);
      }

      updateFreeShippingProgressBar(cartData.total_price);

      const productsContainer = drawer.querySelector('[data-drawer-products-container]');
      if (productsContainer) {
        productsContainer.innerHTML = cartData.items.map(item => `
          <div class="drawer__products-item" data-item-id="${item.id}" data-drawer-products-item>
            <div class="drawer__products-img">
              <a href="${item.url}">
                <img
                  class="drawer__products-img-item"
                  src="${item.image}"
                  alt="${item.image.alt}"
                  loading="lazy"
                  width="168"
                  height="168"
                >
              </a>
            </div>
            <div class="drawer__products-item-info">
              <div class="drawer__products-item-info-title">
                <p>${item.product_title}</p>
              </div>
              <div class="drawer__products-item-info-colors">
                <p>${item.product_type}</p>
              </div>
              <div class="drawer__products-item-info-price">
                <p>${formatPrice(item.price)}</p>
              </div>
              <div class="drawer__products-item-info-quantity">
                <button
                class="drawer__products-item-info-quantity__button minus"
                data-quantity-control-button
                data-quantity-control-button-minus
                data-item-id="${item.id}"
                ${item.quantity === 1 ? 'disabled' : ''}
                >-</button>
                <span class="drawer__products-item-info-quantity__count" data-quantity-count>${item.quantity}</span>
                <button
                  class="drawer__products-item-info-quantity__button plus"
                  data-quantity-control-button
                  data-quantity-control-button-plus
                  data-item-id="${item.id}"
                >+</button>
              </div>
              <div class="drawer__products-item-remove">
                <button class="drawer__products-item-remove-button" data-item-id="${item.id}" data-remove-item-button>
                  Remove
                </button>
              </div>
            </div>
          </div>
        `).join('');

        productsContainer.querySelectorAll('[data-drawer-products-item]').forEach(item => {
          initializeItemControls(item);
        })
      }

      await updateRecommendedProducts();
    } catch (err) {
      console.error('Error updating drawer contents: ', err);
    }
  }

  if (drawer) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.target.classList.contains('active') && window.location.pathname === '/cart') {
          updateDrawerContents();
        }
      });
    });

    observer.observe(drawer, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  CustomCartDrawer();

  const cartDrawer = document.querySelector('[data-custom-cart-drawer]');
  if (cartDrawer) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.target.classList.contains('active')) {
          CustomCartDrawer();
        }
      })
    })

    observer.observe(cartDrawer, {
      attributes: true,
      attributeFilter: ['class']
    })
  }
})