import React from'react'
import { useEffect, useState } from "react";
import API from "./api";
import "./App.css";

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
 const [form, setForm] = useState({
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  image: null
});
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
  name: "",
  description: ""
});
const [editingCategory, setEditingCategory] = useState(null);
const [showCategoryForm, setShowCategoryForm] = useState(false);

  const load = async () => {
    const [p,c,s] = await Promise.all([
      API.get("products/"), API.get("categories/"), API.get("sales/")
    ]);
    setProducts(p.data); setCategories(c.data); setSales(s.data);
  };
  useEffect(() => { load().catch(console.error); }, []);

  const categoryName = id => categories.find(c => c.id === id)?.name || "Unknown";
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const stock = products.reduce((a,p)=>a+p.stock,0);
  const value = products.reduce((a,p)=>a+Number(p.price)*p.stock,0);

  const save = async e => {
  e.preventDefault();

  const data = new FormData();

  data.append("name", form.name);
  data.append("description", form.description);
  data.append("category", form.category);
  data.append("price", form.price);
  data.append("stock", form.stock);

  if (form.image) {
    data.append("image", form.image);
  }

  if (editing) {
    await API.put(`products/${editing.id}/`, data);
  } else {
    await API.post("products/", data);
  }

  setShowForm(false);
  setEditing(null);
  await load();
};
const editCategory = category => {
  setEditingCategory(category);
  setCategoryForm({
    name: category.name,
    description: category.description
  });
  setShowCategoryForm(true);
};

const deleteCategory = async id => {
  if (confirm("Delete this category?")) {
    await API.delete(`categories/${id}/`);
    await load();
  }
};

  const edit = p => {
    setEditing(p);
    setForm({name:p.name,description:p.description,category:p.category,price:p.price,stock:p.stock});
    setShowForm(true);
  };

  const remove = async id => {
    if(confirm("Delete this product?")) { await API.delete(`products/${id}/`); await load(); }
  };

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="logo">P</div><div><b>ProductHub</b><small>Management System</small></div></div>
      <nav>{["dashboard","products","categories","inventory","sales"].map(x =>
        <button className={page===x?"nav active":"nav"} onClick={()=>setPage(x)} key={x}>{x[0].toUpperCase()+x.slice(1)}</button>
      )}</nav>
      <div className="side-bottom">Product Management<br/><small>Admin Panel</small></div>
    </aside>

    <main className="main">
      {page==="dashboard" && <><header><div><h1>Dashboard</h1><p>Welcome to your product management system.</p></div><button onClick={()=>{setEditing(null);setForm({name:"",description:"",category:categories[0]?.id||"",price:"",stock:""});setShowForm(true)}}>+ Add Product</button></header>
        <section className="stats">
          <div><span>📦</span><p>Total Products</p><h2>{products.length}</h2></div>
          <div><span>🏷️</span><p>Categories</p><h2>{categories.length}</h2></div>
          <div><span>📊</span><p>Stock Available</p><h2>{stock}</h2></div>
          <div><span>💰</span><p>Inventory Value</p><h2>₹{value.toLocaleString("en-IN")}</h2></div>
        </section>
        <section className="card"><h2>Recent Products</h2>{products.slice(0,5).map(p=><div className="row" key={p.id}><b>{p.name}</b><span>{categoryName(p.category)}</span><span>₹{p.price}</span><span>{p.stock}</span><span>{p.stock?"In Stock":"Out of Stock"}</span></div>)}</section>
      </>}

      {page==="products" && <><header><div><h1>Products</h1><p>Add, edit, delete and search products.</p></div><button onClick={()=>{setEditing(null);setForm({name:"",description:"",category:categories[0]?.id||"",price:"",stock:""});setShowForm(true)}}>+ Add Product</button></header>
        <section className="card"><input placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)}/>{filtered.map(p=><div className="row" key={p.id}><div><b>{p.name}</b><small>{p.description}</small></div><span>{categoryName(p.category)}</span><span>₹{p.price}</span><span>Stock: {p.stock}</span><button onClick={()=>edit(p)}>Edit</button><button onClick={()=>remove(p.id)}>Delete</button></div>)}</section>
      </>}

      {page==="categories" && <>
  <header>
    <div>
      <h1>Categories</h1>
      <p>Manage your product categories.</p>
    </div>

    <button
      onClick={() => {
        setEditingCategory(null);
        setCategoryForm({name:"", description:""});
        setShowCategoryForm(true);
      }}
    >
      + Add Category
    </button>
  </header>

  <section className="card">
    {categories.map(c =>
      <div className="row" key={c.id}>
        <div>
          <b>{c.name}</b>
          <small>{c.description}</small>
        </div>

        <button onClick={() => editCategory(c)}>
          Edit
        </button>

        <button onClick={() => deleteCategory(c.id)}>
          Delete
        </button>
      </div>
    )}
  </section>
</>}

      {page==="inventory" && <><header><div><h1>Inventory</h1><p>Current stock and inventory value.</p></div></header><section className="card">{products.map(p=><div className="row" key={p.id}><b>{p.name}</b><span>Stock: {p.stock}</span><span>Value: ₹{(Number(p.price)*p.stock).toLocaleString("en-IN")}</span></div>)}</section></>}

      {page==="sales" && <><header><div><h1>Sales</h1><p>Recorded product sales.</p></div></header><section className="card">{sales.length===0?<p>No sales recorded yet.</p>:sales.map(s=><div className="row" key={s.id}><b>{s.product_name}</b><span>Quantity: {s.quantity}</span><span>Total: ₹{s.total_price}</span><span>{new Date(s.sold_at).toLocaleString()}</span></div>)}</section></>}

      {showForm && <div className="overlay"><form onSubmit={save} className="modal"><h2>{editing?"Edit Product":"Add Product"}</h2><input required placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><input
  type="file"
  accept="image/*"
  onChange={e =>
    setForm({
      ...form,
      image: e.target.files[0]
    })
  }
/>
<select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option value="">Select category</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select><input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/><input required type="number" min="0" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/><div className="actions"><button type="button" onClick={()=>setShowForm(false)}>Cancel</button><button type="submit">Save Product</button></div></form></div>}
      {showCategoryForm && (
  <div className="overlay">
    <form onSubmit={saveCategory} className="modal">
      <h2>{editingCategory ? "Edit Category" : "Add Category"}</h2>

      <input
        required
        placeholder="Category name"
        value={categoryForm.name}
        onChange={e =>
          setCategoryForm({
            ...categoryForm,
            name: e.target.value
          })
        }
      />

      <textarea
        placeholder="Description"
        value={categoryForm.description}
        onChange={e =>
          setCategoryForm({
            ...categoryForm,
            description: e.target.value
          })
        }
      />

      <div className="actions">
        <button
          type="button"
          onClick={() => setShowCategoryForm(false)}
        >
          Cancel
        </button>

        <button type="submit">
          Save Category
        </button>
      </div>
    </form>
  </div>
)}
    </main>
  </div>;
}
