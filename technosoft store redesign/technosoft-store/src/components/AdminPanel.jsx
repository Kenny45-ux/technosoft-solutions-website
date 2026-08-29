import { useState, useEffect } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Ticket, FileText, Users, Settings, LogOut,
  Menu, X, Plus, Pencil, Trash2, Star, Upload, ArrowLeft, Search,
} from "lucide-react";

const theme = { black: "#0A0A0A", gray: "#6B7280", line: "#E5E7EB", bg: "#FAFAFA", blue: "#037EC2", blueDark: "#025E92", blueLight: "#E6F3FA" };
const API_BASE = "http://localhost/technosoft-api";
const FONT = "Arial, Helvetica, 'Segoe UI', sans-serif";

const STOCK_LABELS = { in_stock: "In Stock", low_stock: "Low Stock", out_of_stock: "Out of Stock", available_on_request: "Available on Request" };
const STOCK_COLORS = { in_stock: "#16803D", low_stock: "#B45309", out_of_stock: "#B91C1C", available_on_request: theme.blue };

// ── Small shared UI bits ──────────────────────────────────────────
function Badge({ children, color }) {
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, color, background: `${color}18` }}>
      {children}
    </span>
  );
}

function Field({ label, children, span }) {
  return (
    <div style={{ gridColumn: span ? "1 / -1" : undefined }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.black, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${theme.line}`, borderRadius: 6, fontSize: 14, boxSizing: "border-box", fontFamily: FONT };

// ── Dashboard ──────────────────────────────────────────────────────
function DashboardView() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/admin_stats.php`, { credentials: "include" })
      .then((res) => { if (!res.ok) throw new Error("Request failed"); return res.json(); })
      .then(setStats)
      .catch(() => setError("Couldn't load dashboard stats. Confirm the backend is running."));
  }, []);

  if (error) return <p style={{ color: theme.gray }}>{error}</p>;
  if (!stats) return <p style={{ color: theme.gray }}>Loading dashboard...</p>;

  const cards = [
    { label: "Total Products", value: stats.products.total, icon: Package },
    { label: "In Stock", value: stats.products.in_stock, icon: Package },
    { label: "Out of Stock", value: stats.products.out_of_stock, icon: Package },
    { label: "On Promotion", value: stats.products.on_promotion, icon: Package },
    { label: "Total Orders", value: stats.orders.total, icon: ShoppingCart },
    { label: "Pending Orders", value: stats.orders.pending, icon: ShoppingCart },
    { label: "Open Tickets", value: stats.tickets.open, icon: Ticket },
    { label: "Resolved Tickets", value: stats.tickets.resolved, icon: Ticket },
    { label: "Published Blog Posts", value: stats.blog.published, icon: FileText },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: theme.black, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: theme.blueLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <c.icon size={18} color={theme.blue} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: theme.black }}>{c.value}</div>
            <div style={{ fontSize: 13, color: theme.gray, marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>
      {stats.blog.published === 0 && (
        <p style={{ fontSize: 12, color: theme.gray, marginTop: 20 }}>Blog management isn't built yet — that count will populate once it is.</p>
      )}
    </div>
  );
}

// ── Products list ──────────────────────────────────────────────────
function ProductsListView({ onEdit, onAddNew }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    fetch(`${API_BASE}/admin_products.php`, { credentials: "include" })
      .then((res) => { if (!res.ok) throw new Error("Request failed"); return res.json(); })
      .then((data) => { setProducts(data); setError(""); })
      .catch(() => setError("Couldn't load products. Confirm the backend is running."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin_products.php?id=${p.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Request failed");
      load();
    } catch {
      alert("Failed to delete product.");
    }
  };

  const term = search.trim().toLowerCase();
  const filtered = term
    ? products.filter((p) =>
        p.name.toLowerCase().includes(term) ||
        (p.brand || "").toLowerCase().includes(term) ||
        (p.sku || "").toLowerCase().includes(term) ||
        (p.category || "").toLowerCase().includes(term)
      )
    : products;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: theme.black, margin: 0 }}>Products</h1>
        <button onClick={onAddNew} style={{ display: "flex", alignItems: "center", gap: 8, background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "10px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div style={{ position: "relative", maxWidth: 340, marginBottom: 16 }}>
        <Search size={16} color={theme.gray} style={{ position: "absolute", left: 12, top: 12 }} />
        <input placeholder="Search by name, brand, SKU, category..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>

      {error && <p style={{ color: "#B91C1C" }}>{error}</p>}
      {loading ? (
        <p style={{ color: theme.gray }}>Loading products...</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, overflow: "auto", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.line}`, textAlign: "left" }}>
                {["Image", "Name", "Brand", "Category", "SKU", "Price", "Stock", "Promotion", "Added", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", color: theme.gray, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${theme.line}` }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: theme.bg, overflow: "hidden" }}>
                      {p.image && <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: theme.black }}>{p.name}</td>
                  <td style={{ padding: "10px 14px", color: theme.gray }}>{p.brand || "—"}</td>
                  <td style={{ padding: "10px 14px", color: theme.gray }}>{p.category}</td>
                  <td style={{ padding: "10px 14px", color: theme.gray }}>{p.sku}</td>
                  <td style={{ padding: "10px 14px", color: theme.black }}>K{Number(p.price).toLocaleString()}</td>
                  <td style={{ padding: "10px 14px" }}><Badge color={STOCK_COLORS[p.stock_status] || theme.gray}>{STOCK_LABELS[p.stock_status] || p.stock_status}</Badge></td>
                  <td style={{ padding: "10px 14px" }}>{Number(p.discount_percent) > 0 ? <Badge color={theme.blue}>{p.discount_percent}% off</Badge> : <span style={{ color: theme.gray }}>—</span>}</td>
                  <td style={{ padding: "10px 14px", color: theme.gray, whiteSpace: "nowrap" }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => onEdit(p.id)} title="Edit" style={{ background: "none", border: `1px solid ${theme.line}`, borderRadius: 6, padding: 6, cursor: "pointer" }}><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p)} title="Delete" style={{ background: "none", border: `1px solid ${theme.line}`, borderRadius: 6, padding: 6, cursor: "pointer", color: "#B91C1C" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ padding: 24, textAlign: "center", color: theme.gray }}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Add / Edit product ────────────────────────────────────────────
function ProductFormView({ productId, onSaved, onCancel }) {
  const isEditing = !!productId;
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "", brand: "", sku: "", description: "",
    category_id: "", subcategory_id: "",
    price: "", old_price: "", discount_percent: "0", promo_start: "", promo_end: "",
    stock_quantity: "0", stock_status: "in_stock",
    is_featured: false, is_new: false, is_best_seller: false, status: "published",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/admin_categories.php`, { credentials: "include" })
      .then((res) => res.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    fetch(`${API_BASE}/admin_products.php?id=${productId}`, { credentials: "include" })
      .then((res) => { if (!res.ok) throw new Error("Request failed"); return res.json(); })
      .then((p) => {
        setForm({
          name: p.name || "", brand: p.brand || "", sku: p.sku || "", description: p.description || "",
          category_id: p.category_id || "", subcategory_id: p.subcategory_id || "",
          price: p.price ?? "", old_price: p.old_price ?? "", discount_percent: p.discount_percent ?? "0",
          promo_start: p.promo_start || "", promo_end: p.promo_end || "",
          stock_quantity: p.stock_quantity ?? "0", stock_status: p.stock_status || "in_stock",
          is_featured: !!Number(p.is_featured), is_new: !!Number(p.is_new), is_best_seller: !!Number(p.is_best_seller),
          status: p.status || "published",
        });
        setImages(p.images || []);
      })
      .catch(() => setError("Couldn't load this product."))
      .finally(() => setLoading(false));
  }, [productId]);

  const set = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const selectedCategory = categories.find((c) => String(c.id) === String(form.category_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, subcategory_id: form.subcategory_id || null };
      const res = await fetch(`${API_BASE}/admin_products.php${isEditing ? `?id=${productId}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");
      onSaved(data.id || productId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (files) => {
    if (!isEditing) return; // need a real product id first
    setUploadError("");
    const formData = new FormData();
    formData.append("product_id", productId);
    Array.from(files).forEach((f) => formData.append("image[]", f));
    try {
      const res = await fetch(`${API_BASE}/admin_product_images.php`, { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImages((prev) => [...prev, ...data.uploaded]);
    } catch (err) {
      setUploadError(err.message);
    }
  };

  const setPrimary = async (imgId) => {
    await fetch(`${API_BASE}/admin_product_images.php?id=${imgId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ is_primary: true }),
    });
    setImages((prev) => prev.map((im) => ({ ...im, is_primary: im.id === imgId ? 1 : 0 })));
  };

  const deleteImage = async (imgId) => {
    await fetch(`${API_BASE}/admin_product_images.php?id=${imgId}`, { method: "DELETE", credentials: "include" });
    setImages((prev) => prev.filter((im) => im.id !== imgId));
  };

  if (loading) return <p style={{ color: theme.gray }}>Loading...</p>;

  return (
    <div>
      <button onClick={onCancel} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: theme.gray, cursor: "pointer", fontSize: 13, marginBottom: 14, padding: 0 }}>
        <ArrowLeft size={14} /> Back to products
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: theme.black, marginBottom: 20 }}>{isEditing ? "Edit Product" : "Add Product"}</h1>

      {error && <div style={{ background: "#FEECEC", border: "1px solid #F5A3A3", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#8A1F1F", marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <Field label="Product Name *"><input required value={form.name} onChange={set("name")} style={inputStyle} /></Field>
          <Field label="Brand"><input value={form.brand} onChange={set("brand")} style={inputStyle} /></Field>

          <Field label="Category *">
            <select required value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value, subcategory_id: "" }))} style={inputStyle}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Subcategory">
            <select value={form.subcategory_id} onChange={set("subcategory_id")} style={inputStyle} disabled={!selectedCategory}>
              <option value="">None</option>
              {selectedCategory?.subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>

          <Field label="SKU *"><input required value={form.sku} onChange={set("sku")} style={inputStyle} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={set("status")} style={inputStyle}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </Field>

          <Field label="Description" span>
            <textarea rows={4} value={form.description} onChange={set("description")} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          <Field label="Price (K) *"><input required type="number" step="0.01" value={form.price} onChange={set("price")} style={inputStyle} /></Field>
          <Field label="Old Price (K)"><input type="number" step="0.01" value={form.old_price} onChange={set("old_price")} style={inputStyle} /></Field>

          <Field label="Discount %"><input type="number" min="0" max="100" value={form.discount_percent} onChange={set("discount_percent")} style={inputStyle} /></Field>
          <Field label="Stock Quantity"><input type="number" value={form.stock_quantity} onChange={set("stock_quantity")} style={inputStyle} /></Field>

          <Field label="Promotion Start Date"><input type="date" value={form.promo_start || ""} onChange={set("promo_start")} style={inputStyle} /></Field>
          <Field label="Promotion End Date"><input type="date" value={form.promo_end || ""} onChange={set("promo_end")} style={inputStyle} /></Field>

          <Field label="Stock Status" span>
            <select value={form.stock_status} onChange={set("stock_status")} style={inputStyle}>
              {Object.entries(STOCK_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </Field>

          <Field label="Flags" span>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: theme.black }}><input type="checkbox" checked={form.is_featured} onChange={set("is_featured")} /> Featured</label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: theme.black }}><input type="checkbox" checked={form.is_new} onChange={set("is_new")} /> New</label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: theme.black }}><input type="checkbox" checked={form.is_best_seller} onChange={set("is_best_seller")} /> Best Seller</label>
            </div>
          </Field>
        </div>

        {/* Images — only available once the product actually exists */}
        <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${theme.line}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.black, marginBottom: 12 }}>Product Images</h3>
          {!isEditing ? (
            <p style={{ fontSize: 13, color: theme.gray }}>Save the product first, then come back to this page to add images.</p>
          ) : (
            <>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                {images.map((im) => (
                  <div key={im.id} style={{ position: "relative", width: 90, height: 90, borderRadius: 8, overflow: "hidden", border: im.is_primary ? `2px solid ${theme.blue}` : `1px solid ${theme.line}` }}>
                    <img src={im.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", top: 3, right: 3, display: "flex", gap: 3 }}>
                      <button type="button" onClick={() => setPrimary(im.id)} title="Set as primary" style={{ background: im.is_primary ? theme.blue : "rgba(255,255,255,0.9)", border: "none", borderRadius: 4, padding: 3, cursor: "pointer" }}>
                        <Star size={11} color={im.is_primary ? "#fff" : theme.black} fill={im.is_primary ? "#fff" : "none"} />
                      </button>
                      <button type="button" onClick={() => deleteImage(im.id)} title="Delete" style={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 4, padding: 3, cursor: "pointer" }}>
                        <Trash2 size={11} color="#B91C1C" />
                      </button>
                    </div>
                  </div>
                ))}
                <label style={{ width: 90, height: 90, borderRadius: 8, border: `1.5px dashed ${theme.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.gray, fontSize: 11, gap: 4 }}>
                  <Upload size={16} /> Upload
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files.length && handleImageUpload(e.target.files)} />
                </label>
              </div>
              {uploadError && <p style={{ fontSize: 12, color: "#B91C1C" }}>{uploadError}</p>}
              <p style={{ fontSize: 12, color: theme.gray }}>Click the star to set an image as the main/cover photo. JPEG, PNG, WEBP, or GIF, up to 5MB each.</p>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          <button type="button" onClick={onCancel} style={{ background: "none", border: `1px solid ${theme.line}`, borderRadius: 6, padding: "11px 24px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button type="submit" disabled={saving} style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "11px 28px", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Categories ─────────────────────────────────────────────────────
function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [newSubcat, setNewSubcat] = useState({}); // { [categoryId]: text }
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch(`${API_BASE}/admin_categories.php`, { credentials: "include" })
      .then((res) => res.json()).then(setCategories).catch(() => setError("Couldn't load categories."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await fetch(`${API_BASE}/admin_categories.php`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ name: newCategory.trim() }),
    });
    setNewCategory("");
    load();
  };

  const addSubcategory = async (categoryId) => {
    const name = (newSubcat[categoryId] || "").trim();
    if (!name) return;
    await fetch(`${API_BASE}/admin_categories.php`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ name, category_id: categoryId }),
    });
    setNewSubcat((s) => ({ ...s, [categoryId]: "" }));
    load();
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category? This fails safely if products still use it.")) return;
    const res = await fetch(`${API_BASE}/admin_categories.php?id=${id}`, { method: "DELETE", credentials: "include" });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    load();
  };

  const deleteSubcategory = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    await fetch(`${API_BASE}/admin_categories.php?subcategory_id=${id}`, { method: "DELETE", credentials: "include" });
    load();
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: theme.black, marginBottom: 20 }}>Categories</h1>

      <form onSubmit={addCategory} style={{ display: "flex", gap: 10, marginBottom: 24, maxWidth: 420 }}>
        <input placeholder="New category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={inputStyle} />
        <button type="submit" style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Add Category</button>
      </form>

      {error && <p style={{ color: "#B91C1C" }}>{error}</p>}
      {loading ? <p style={{ color: theme.gray }}>Loading...</p> : (
        <div style={{ display: "grid", gap: 14 }}>
          {categories.map((c) => (
            <div key={c.id} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.black, margin: 0 }}>{c.name}</h3>
                <button onClick={() => deleteCategory(c.id)} style={{ background: "none", border: "none", color: "#B91C1C", cursor: "pointer" }}><Trash2 size={15} /></button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {c.subcategories.map((s) => (
                  <span key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, background: theme.bg, borderRadius: 20, padding: "5px 6px 5px 12px", fontSize: 13, color: theme.black }}>
                    {s.name}
                    <button onClick={() => deleteSubcategory(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.gray, display: "flex" }}><X size={12} /></button>
                  </span>
                ))}
                {c.subcategories.length === 0 && <span style={{ fontSize: 13, color: theme.gray }}>No subcategories yet.</span>}
              </div>
              <div style={{ display: "flex", gap: 8, maxWidth: 320 }}>
                <input placeholder="Add subcategory" value={newSubcat[c.id] || ""} onChange={(e) => setNewSubcat((s) => ({ ...s, [c.id]: e.target.value }))}
                  style={{ ...inputStyle, padding: "7px 10px", fontSize: 13 }} />
                <button onClick={() => addSubcategory(c.id)} style={{ background: theme.blueLight, color: theme.blue, border: "none", borderRadius: 6, padding: "7px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>Add</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shell: sidebar + auth gate ────────────────────────────────────
export default function AdminPanel({ onExit }) {
  const [authState, setAuthState] = useState("checking"); // checking | denied | ok
  const [admin, setAdmin] = useState(null);
  const [section, setSection] = useState("dashboard");
  const [editingProductId, setEditingProductId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/me.php`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) { setAuthState("denied"); return; }
        const data = await res.json();
        if (data.role !== "admin") { setAuthState("denied"); return; }
        setAdmin(data);
        setAuthState("ok");
      })
      .catch(() => setAuthState("denied"));
  }, []);

  const handleLogout = () => {
    fetch(`${API_BASE}/logout.php`, { method: "POST", credentials: "include" }).finally(() => onExit && onExit());
  };

  if (authState === "checking") {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: theme.gray }}>Checking admin access...</div>;
  }

  if (authState === "denied") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: theme.black }}>Admin access required</h1>
          <p style={{ color: theme.gray, fontSize: 14, marginBottom: 20 }}>You need to be logged in with an administrator account to view this page.</p>
          <button onClick={() => onExit && onExit()} style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "12px 28px", fontWeight: 700, cursor: "pointer" }}>Back to Home</button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "All Products", icon: Package },
    { id: "categories", label: "Categories", icon: FileText },
  ];
  const comingSoon = [
    { label: "Orders", icon: ShoppingCart },
    { label: "Support Tickets", icon: Ticket },
    { label: "Blog", icon: FileText },
    { label: "Customers", icon: Users },
    { label: "Settings", icon: Settings },
  ];

  return (
    <div style={{ fontFamily: FONT, display: "flex", minHeight: "100vh", background: theme.bg }}>
      <style>{`
        .tf-admin-sidebar { width: 240px; flex-shrink: 0; }
        .tf-admin-mobile-toggle { display: none; }
        @media (max-width: 900px) {
          .tf-admin-sidebar { position: fixed; left: -260px; top: 0; bottom: 0; z-index: 50; transition: left 0.2s; }
          .tf-admin-sidebar.open { left: 0; }
          .tf-admin-mobile-toggle { display: flex !important; }
        }
      `}</style>

      <aside className={`tf-admin-sidebar${sidebarOpen ? " open" : ""}`} style={{ background: "#0A1F2E", color: "#fff", display: "flex", flexDirection: "column", padding: "24px 0" }}>
        <div style={{ padding: "0 20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Technosoft <span style={{ color: theme.blue }}>Admin</span></div>
          <button onClick={() => setSidebarOpen(false)} className="tf-admin-mobile-toggle" style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setSection(item.id); setEditingProductId(null); setSidebarOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 20px",
                background: section === item.id ? "rgba(3,126,194,0.18)" : "none",
                borderLeft: section === item.id ? `3px solid ${theme.blue}` : "3px solid transparent",
                border: "none", color: section === item.id ? "#fff" : "#B8C4CC", cursor: "pointer", fontSize: 14, fontWeight: 600, textAlign: "left",
              }}>
              <item.icon size={17} /> {item.label}
            </button>
          ))}
          <div style={{ padding: "16px 20px 8px", fontSize: 11, letterSpacing: 1, color: "#5A6B76", textTransform: "uppercase" }}>Coming Soon</div>
          {comingSoon.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", color: "#4E606C", fontSize: 14, fontWeight: 600 }}>
              <item.icon size={17} /> {item.label}
            </div>
          ))}
        </nav>
        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 20px", padding: "14px 0 0", background: "none", border: "none", borderTop: "1px solid #1C3648", color: "#B8C4CC", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
          <LogOut size={17} /> Log Out
        </button>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />}

      <main style={{ flex: 1, padding: "28px 32px", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button className="tf-admin-mobile-toggle" onClick={() => setSidebarOpen(true)} style={{ background: "none", border: `1px solid ${theme.line}`, borderRadius: 6, padding: 8, cursor: "pointer" }}><Menu size={18} /></button>
          <div style={{ fontSize: 13, color: theme.gray, marginLeft: "auto" }}>Logged in as <strong style={{ color: theme.black }}>{admin.name}</strong></div>
        </div>

        {section === "dashboard" && <DashboardView />}
        {section === "products" && <ProductsListView onEdit={(id) => { setEditingProductId(id); setSection("product-form"); }} onAddNew={() => { setEditingProductId(null); setSection("product-form"); }} />}
        {section === "product-form" && (
          <ProductFormView
            productId={editingProductId}
            onSaved={(id) => { setEditingProductId(id); setSection("product-form"); }}
            onCancel={() => { setEditingProductId(null); setSection("products"); }}
          />
        )}
        {section === "categories" && <CategoriesView />}
      </main>
    </div>
  );
}
