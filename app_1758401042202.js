(function(){
'use strict';

// --- IndexedDB helper (promises) ---
function openDB(name='artesaPOS', version=1){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = function(e){
      const db = e.target.result;
      if(!db.objectStoreNames.contains('products')){
        const pStore = db.createObjectStore('products', { keyPath: 'sku' });
        pStore.createIndex('name', 'name', { unique:false });
      }
      if(!db.objectStoreNames.contains('transactions')){
        db.createObjectStore('transactions', { keyPath: 'id', autoIncrement:true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || 'IndexedDB error');
  });
}

function txPromise(db, storeName, mode, callback){
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = callback(store);
    tx.oncomplete = ()=> resolve(result);
    tx.onerror = ()=> reject(tx.error || 'tx error');
  });
}

async function getAll(db, storeName){
  return await txPromise(db, storeName, 'readonly', (store)=> {
    return store.getAll();
  });
}

async function getItem(db, storeName, key){
  return await txPromise(db, storeName, 'readonly', (store)=> store.get(key));
}

async function putItem(db, storeName, obj){
  return await txPromise(db, storeName, 'readwrite', (store)=> store.put(obj));
}

async function deleteItem(db, storeName, key){
  return await txPromise(db, storeName, 'readwrite', (store)=> store.delete(key));
}

async function addItem(db, storeName, obj){
  return await txPromise(db, storeName, 'readwrite', (store)=> store.add(obj));
}

// --- app state ---
let DB;
let cart = [];

// --- DOM ---
const els = {
  searchInput: document.getElementById('searchInput'),
  productGrid: document.getElementById('productGrid'),
  cartList: document.getElementById('cartList'),
  subtotal: document.getElementById('subtotal'),
  gst: document.getElementById('gst'),
  total: document.getElementById('total'),
  payCash: document.getElementById('payCash'),
  payCard: document.getElementById('payCard'),
  productForm: document.getElementById('productForm'),
  inventoryList: document.getElementById('inventoryList'),
  transactionsList: document.getElementById('transactionsList'),
  summary: document.getElementById('summary')
};

// --- init ---
async function init(){
  DB = await openDB();
  bindUI();
  await seedIfEmpty();
  await renderAll();
}

function bindUI(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click', onTab));
  els.searchInput.addEventListener('input', onSearch);
  els.payCash.addEventListener('click', ()=>onPay('cash'));
  els.payCard.addEventListener('click', ()=>onPay('card'));
  els.productForm.addEventListener('submit', onProductForm);
  document.getElementById('clearForm').addEventListener('click', clearForm);
}

function onTab(e){
  const target = e.currentTarget.dataset.target;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(target).classList.add('active');
  e.currentTarget.classList.add('active');
  // refresh appropriate content
  if(target === 'inventoryTab') refreshInventory();
  if(target === 'transactionsTab') refreshTransactions();
}

// --- seed sample products if none exist ---
async function seedIfEmpty(){
  const products = await getAll(DB, 'products');
  if(products.length === 0){
    const samples = [
      { sku:'ART-001', name:'Small Ceramic Bowl', price:24.99, stock:10, markup:30 },
      { sku:'ART-002', name:'Handmade Mug', price:19.99, stock:20, markup:25 },
      { sku:'ART-003', name:'Gift Card NZD50', price:50.00, stock:50, markup:0 }
    ];
    for(const p of samples) await putItem(DB, 'products', p);
  }
}

// --- render functions ---
async function renderProducts(filter=''){
  const all = await getAll(DB, 'products');
  let list = all;
  if(filter) {
    const q = filter.toLowerCase();
    list = all.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }
  const html = list.map(p => `
    <div class="product" data-sku="${p.sku}">
      <div class="thumb">IMG</div>
      <div class="p-info">
        <div class="name">${p.name}</div>
        <div class="sku">SKU: ${p.sku}</div>
        <div class="stock">Stock: ${p.stock}</div>
      </div>
      <div class="p-price">$${p.price.toFixed(2)}</div>
      <div><button class="add-btn" data-sku="${p.sku}">Add</button></div>
    </div>`).join('');
  els.productGrid.innerHTML = html;
  // bind add buttons
  els.productGrid.querySelectorAll('.add-btn').forEach(b => b.addEventListener('click', (ev)=>{
    const sku = ev.currentTarget.dataset.sku;
    addToCartSku(sku);
  }));
}

async function renderCart(){
  const rows = cart.map((it, idx) => `
    <div class="cart-item" data-idx="${idx}">
      <div class="left"><strong>${it.name}</strong><div class="sku">${it.sku}</div></div>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="number" min="1" value="${it.qty}" data-idx="${idx}" class="qty">
        <input type="number" step="0.01" value="${it.price.toFixed(2)}" data-idx="${idx}" class="priceEdit">
        <button class="remove" data-idx="${idx}">X</button>
      </div>
      <div style="width:80px;text-align:right">$${(it.qty*it.price).toFixed(2)}</div>
    </div>`).join('');
  els.cartList.innerHTML = rows;
  // bind qty/price/remove events
  els.cartList.querySelectorAll('.qty').forEach(inp => inp.addEventListener('change', (e)=>{
    const i = parseInt(e.target.dataset.idx);
    cart[i].qty = Math.max(1, parseInt(e.target.value)||1);
    renderCart();
    updateTotals();
  }));
  els.cartList.querySelectorAll('.priceEdit').forEach(inp => inp.addEventListener('change', (e)=>{
    const i = parseInt(e.target.dataset.idx);
    cart[i].price = parseFloat(e.target.value)||0;
    renderCart();
    updateTotals();
  }));
  els.cartList.querySelectorAll('.remove').forEach(b => b.addEventListener('click', (e)=>{
    const i = parseInt(e.currentTarget.dataset.idx);
    cart.splice(i,1);
    renderCart();
    updateTotals();
  }));
  updateTotals();
}

function updateTotals(){
  const subtotal = cart.reduce((s,i)=>s + (i.price * i.qty), 0);
  const gst = subtotal * 0.15;
  const total = subtotal + gst;
  els.subtotal.textContent = formatMoney(subtotal);
  els.gst.textContent = formatMoney(gst);
  els.total.textContent = formatMoney(total);
}

function formatMoney(n){ return '$' + n.toFixed(2); }

// --- cart operations ---
async function addToCartSku(sku){
  const p = await getItem(DB, 'products', sku);
  if(!p) return alert('Product not found');
  if(p.stock <= 0) return alert('Out of stock');
  const existing = cart.find(c => c.sku === sku);
  if(existing){ existing.qty += 1; }
  else { cart.push({ sku: p.sku, name: p.name, price: p.price, qty: 1 }); }
  renderCart();
}

// --- product form ---
async function onProductForm(e){
  e.preventDefault();
  const sku = document.getElementById('p_sku').value.trim();
  const name = document.getElementById('p_name').value.trim();
  const price = parseFloat(document.getElementById('p_price').value) || 0;
  const stock = parseInt(document.getElementById('p_stock').value) || 0;
  const markup = parseFloat(document.getElementById('p_markup').value) || 0;
  if(!sku || !name) return alert('SKU and name required');
  await putItem(DB, 'products', { sku, name, price, stock, markup });
  clearForm();
  refreshInventory();
  renderProducts(els.searchInput.value || '');
}

// --- inventory list ---
async function refreshInventory(){
  const all = await getAll(DB, 'products');
  const html = all.map(p => `
    <div class="inventory-item">
      <div><strong>${p.name}</strong><div class="sku">${p.sku}</div><div class="stock">Stock: ${p.stock}</div></div>
      <div style="display:flex;gap:8px">
        <button class="edit" data-sku="${p.sku}">Edit</button>
        <button class="del" data-sku="${p.sku}">Delete</button>
      </div>
    </div>`).join('');
  els.inventoryList.innerHTML = html;
  els.inventoryList.querySelectorAll('.edit').forEach(b=>b.addEventListener('click', async (ev)=>{
    const sku = ev.currentTarget.dataset.sku;
    const p = await getItem(DB, 'products', sku);
    if(p){
      document.getElementById('p_sku').value = p.sku;
      document.getElementById('p_name').value = p.name;
      document.getElementById('p_price').value = p.price;
      document.getElementById('p_stock').value = p.stock;
      document.getElementById('p_markup').value = p.markup || 0;
    }
  }));
  els.inventoryList.querySelectorAll('.del').forEach(b=>b.addEventListener('click', async (ev)=>{
    if(!confirm('Delete product?')) return;
    await deleteItem(DB, 'products', ev.currentTarget.dataset.sku);
    refreshInventory();
    renderProducts(els.searchInput.value || '');
  }));
}

// --- transactions ---
async function refreshTransactions(){
  const txs = await getAll(DB, 'transactions');
  const html = txs.slice().reverse().map(t => {
    const d = new Date(t.date);
    return `<div class="tx"><div><strong>${t.type.toUpperCase()}</strong> ${d.toLocaleString()}</div><div>${t.items.length} items - $${t.total.toFixed(2)}</div></div>`;
  }).join('');
  els.transactionsList.innerHTML = html || '<div>No transactions yet</div>';
  // summary totals
  const totalSales = txs.reduce((s,t)=>s + (t.total||0), 0);
  els.summary.innerHTML = `<div><strong>Total sales:</strong> ${formatMoney(totalSales)}</div><div><strong>Transactions:</strong> ${txs.length}</div>`;
}

// --- pay/checkout ---
async function onPay(type){
  if(cart.length === 0) return alert('Cart is empty');
  // Confirm and optionally print (basic)
  if(!confirm(`Record ${type.toUpperCase()} payment and clear cart?`)) return;
  // Update stock
  const tx = DB.transaction(['products','transactions'], 'readwrite');
  const pStore = tx.objectStore('products');
  const tStore = tx.objectStore('transactions');
  let total = 0;
  for(const it of cart){
    const getReq = pStore.get(it.sku);
    getReq.onsuccess = function(e){ 
      const p = e.target.result;
      if(p){
        p.stock = Math.max(0, (p.stock || 0) - it.qty);
        pStore.put(p);
      }
    };
    total += it.price * it.qty;
  }
  const tr = { type, items: cart.map(i=>({sku:i.sku,name:i.name,qty:i.qty,price:i.price})), date: new Date().toISOString(), total };
  tStore.add(tr);
  tx.oncomplete = async ()=>{
    cart = [];
    renderCart();
    refreshInventory();
    refreshTransactions();
    alert('Transaction saved (offline)');
  };
  tx.onerror = ()=> alert('Error saving transaction');
}

// --- helpers ---
function clearForm(){ document.getElementById('p_sku').value=''; document.getElementById('p_name').value=''; document.getElementById('p_price').value=''; document.getElementById('p_stock').value=''; document.getElementById('p_markup').value='0'; }
function onSearch(e){ renderProducts(e.target.value); }

async function renderAll(){ await renderProducts(''); await refreshInventory(); await refreshTransactions(); renderCart(); }

// init app
init().catch(err=>{ console.error(err); alert('IndexedDB initialization failed: ' + (err && err.message ? err.message : err)); });

})();