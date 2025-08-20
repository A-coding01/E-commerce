window.onload = function() {
  // DOM Elements
  const userIcon = document.getElementById('userIcon');
  const userModal = document.getElementById('userModal');
  const closeModal = document.getElementById('closeModal');
  const userForm = document.getElementById('userForm');
  const userInfoModal = document.getElementById('userInfoModal');
  const closeUserInfo = document.getElementById('closeUserInfo');
  const displayUsername = document.getElementById('displayUsername');
  const cartIcon = document.getElementById('cartIcon');
  const cartModal = document.getElementById('cartModal');
  const closeCartModal = document.getElementById('closeCartModal');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // User Management
  function checkUser() {
    const username = localStorage.getItem('username');
    if (username) {
      displayUsername.textContent = username;
      userInfoModal.style.display = 'block';
    } else {
      userModal.style.display = 'block';
    }
  }

  if (userIcon) userIcon.onclick = checkUser;
  if (closeModal) closeModal.onclick = () => userModal.style.display = 'none';
  if (closeUserInfo) closeUserInfo.onclick = () => userInfoModal.style.display = 'none';

  if (userForm) {
    userForm.onsubmit = function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      localStorage.setItem('username', username);
      userModal.style.display = 'none';
      checkUser();
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = function() {
      localStorage.removeItem('username');
      localStorage.removeItem('phone');
      userInfoModal.style.display = 'none';
      if (userIcon) userIcon.textContent = '<i class="fa-solid fa-user"></i>';
    };
  }

  // Admin Section
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const closeAdminModal = document.getElementById('closeAdminModal');
  const username = localStorage.getItem('username');

  if (adminBtn) {
    adminBtn.style.display = username === 'dara' ? 'inline-block' : 'none';
    adminBtn.onclick = () => adminModal.style.display = 'block';
  }

  if (closeAdminModal) {
    closeAdminModal.onclick = () => adminModal.style.display = 'none';
  }

  window.onclick = function(event) {
    if (event.target === adminModal) {
      adminModal.style.display = 'none';
    }
  };

  // Cart Functionality
  function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name, price });
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
  }

  function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
      cartItems.innerHTML = '';
      cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ₦${item.price}`;
        cartItems.appendChild(li);
      });
    }
  }

  function clearCart() {
    localStorage.removeItem('cart');
    displayCart();
  }

  if (cartIcon) {
    cartIcon.onclick = () => {
      if (cartModal) {
        cartModal.style.display = 'block';
        displayCart();
      }
    };
  }

  if (closeCartModal) closeCartModal.onclick = () => cartModal.style.display = 'none';
  if (clearCartBtn) clearCartBtn.onclick = clearCart;

  // Product Management
  const productForm = document.getElementById('productForm');
  const productName = document.getElementById('productName');
  const productPrice = document.getElementById('productPrice');
  const productImage = document.getElementById('productImage');
  const productList = document.getElementById('productList');
  const editIndex = document.getElementById('editIndex');
  const productsContainer = document.querySelector('.products-ontainer');

  function loadProducts() {
    return JSON.parse(localStorage.getItem('adminProducts')) || [];
  }

  function saveProducts(products) {
    localStorage.setItem('adminProducts', JSON.stringify(products));
    renderShopProducts();
    initPagination();
  }

  function renderProducts() {
    const products = loadProducts();
    if (productList) {
      productList.innerHTML = '';
      products.forEach((prod, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <img src="${prod.image || ''}" alt="Product Image" style="width:40px;height:40px;object-fit:cover;">
          <strong>${prod.name}</strong> - ₦${prod.price}
          <button onclick="editProduct(${idx})">Edit</button>
        `;
        productList.appendChild(li);
      });
    }
  }

  if (productForm) {
    productForm.onsubmit = function(e) {
      e.preventDefault();
      const products = loadProducts();
      
      if (productImage.files && productImage.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const newProduct = {
            name: productName.value,
            price: productPrice.value,
            image: event.target.result
          };
          updateProducts(products, newProduct);
        };
        reader.readAsDataURL(productImage.files[0]);
      } else {
        const newProduct = {
          name: productName.value,
          price: productPrice.value,
          image: ''
        };
        updateProducts(products, newProduct);
      }
    };
  }

  function updateProducts(products, newProduct) {
    if (editIndex.value) {
      products[editIndex.value] = newProduct;
      editIndex.value = '';
    } else {
      products.push(newProduct);
    }
    saveProducts(products);
    if (productForm) productForm.reset();
  }

  window.editProduct = function(idx) {
    const products = loadProducts();
    const prod = products[idx];
    if (productName) productName.value = prod.name;
    if (productPrice) productPrice.value = prod.price;
    if (editIndex) editIndex.value = idx;
  };

  // Shop Products Rendering
  function renderShopProducts() {
    const products = loadProducts();
    if (productsContainer) {
      productsContainer.innerHTML = '';
      
      products.forEach(prod => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
          <img src="${prod.image || 'banner.jpg'}" alt="${prod.name}">
          <h3>${prod.name}</h3>
          <div class="price">₦${prod.price}</div>
          <button onclick="addToCart('${prod.name.replace(/'/g, "\\'")}', ${prod.price})">Add to Cart</button>
        `;
        productsContainer.appendChild(div);
      });
      
      // Add pagination container if it doesn't exist
      if (!document.querySelector('.pagination')) {
        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination';
        productsContainer.appendChild(paginationDiv);
      }
    }
  }

  // Pagination
  let currentPage = 1;
  const productsPerPage = 4;

  function initPagination() {
    const products = document.querySelectorAll('.productsContainer .product');
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&larr;';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        showPage(currentPage - 1);
      }
    };
    paginationContainer.appendChild(prevBtn);
    
    // Page Buttons
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.textContent = i;
      pageBtn.className = i === currentPage ? 'active' : '';
      pageBtn.onclick = () => showPage(i);
      paginationContainer.appendChild(pageBtn);
    }
    
    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&rarr;';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        showPage(currentPage + 1);
      }
    };
    paginationContainer.appendChild(nextBtn);
    
    showPage(currentPage);
  }

  function showPage(page) {
    const products = document.querySelectorAll('.productsContainer .product');
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    
    currentPage = page;
    
    // Update product visibility
    products.forEach((product, index) => {
      product.style.display = (index >= (page - 1) * productsPerPage && 
                              index < page * productsPerPage) ? 'block' : 'none';
    });
    
    // Update pagination buttons
    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
      const buttons = paginationContainer.querySelectorAll('button');
      buttons[0].disabled = page === 1; // Previous button
      buttons[buttons.length - 1].disabled = page === totalPages; // Next button
      
      // Update active state of page buttons
      buttons.forEach((btn, i) => {
        if (i > 0 && i < buttons.length - 1) {
          btn.className = parseInt(btn.textContent) === page ? 'active' : '';
        }
      });
    }
  }

  // Initialize everything
  displayCart();
  renderProducts();
  renderShopProducts();
  initPagination();
  
  // Make addToCart available globally
  window.addToCart = addToCart;
};