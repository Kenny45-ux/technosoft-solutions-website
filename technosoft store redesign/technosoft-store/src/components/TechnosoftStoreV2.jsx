import { useState, useMemo, useEffect, Component } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, X, Heart, GitCompare, Star, Eye, Ticket, User, SlidersHorizontal,
  Menu, Phone, Mail, ArrowLeft, ArrowRight, Plus, Minus, Trash2,
} from "lucide-react";
import { categories, formatK, CATEGORY_TO_SERVICE } from "../data/products";
import { getStoredUser } from "../utils/auth";

const theme = { black: "#0A0A0A", gray: "#6B7280", line: "#E5E7EB", bg: "#FAFAFA", blue: "#037EC2", blueDark: "#025E92", blueLight: "#E6F3FA" };
const LOGO_PATH = "/images/technosoft-logo.png";

// Backend API base — the PHP endpoints living in /technosoft-api on your XAMPP htdocs.
// Change this to your real domain once deployed (e.g. "https://technosoft.co.zm/api").
const API_BASE = "http://localhost/technosoft-api";

function StarRating({ rating, reviews }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", gap: 1 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={12} fill={i <= Math.round(rating) ? theme.blue : "none"} color={theme.black} />
        ))}
      </div>
      {reviews != null && <span style={{ fontSize: 11, color: theme.gray }}>({reviews})</span>}
    </div>
  );
}

function StockBadge({ stock }) {
  if (stock === 0) return <span style={{ fontSize: 11, color: "#B91C1C", fontWeight: 600 }}>Out of stock</span>;
  if (stock < 10) return <span style={{ fontSize: 11, color: "#B45309", fontWeight: 600 }}>Low stock — {stock} left</span>;
  return <span style={{ fontSize: 11, color: "#15803D", fontWeight: 600 }}>In stock</span>;
}

function SkeletonCard() {
  return (
    <div style={{ border: `1px solid ${theme.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ height: 170, background: "#EEE" }} className="tf-shimmer" />
      <div style={{ padding: 14 }}>
        <div style={{ height: 10, width: "60%", background: "#EEE", borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 14, width: "90%", background: "#EEE", borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 14, width: "40%", background: "#EEE", borderRadius: 4 }} />
      </div>
    </div>
  );
}

function FilterPanel({ categories, activeCategory, setActiveCategory, maxPrice, setMaxPrice, searchTerm, setSearchTerm, showSuggestions, setShowSuggestions, suggestions }) {
  return (
    <div>
      <div style={{ position: "relative", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${theme.line}`, borderRadius: 6, padding: "8px 10px" }}>
          <Search size={15} color={theme.gray} />
          <input
            placeholder="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            style={{ border: "none", outline: "none", fontSize: 13, width: "100%" }}
          />
        </div>
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: `1px solid ${theme.line}`, borderRadius: 8, marginTop: 4, zIndex: 20, overflow: "hidden" }}
            >
              {suggestions.map((s) => (
                <div key={s.id} onMouseDown={() => setSearchTerm(s.name)} style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", borderBottom: `1px solid ${theme.line}` }}>
                  {s.name}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 10, color: theme.gray }}>Categories</div>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          style={{
            display: "block", width: "100%", textAlign: "left", padding: "7px 10px", marginBottom: 3, borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13,
            background: activeCategory === cat ? theme.blue : "transparent", color: activeCategory === cat ? "#fff" : "#374151",
          }}
        >
          {cat}
        </button>
      ))}

      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", margin: "20px 0 10px", color: theme.gray }}>Max Price: {formatK(maxPrice)}</div>
      <input type="range" min="0" max="3000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: "100%" }} />
    </div>
  );
}

function ProductCard({ p, onView, onAddToCart, wishlist, onToggleWishlist, compareList, onToggleCompare }) {
  const [added, setAdded] = useState(false);
  const isWished = wishlist.includes(p.id);
  const isCompared = compareList.includes(p.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.3 }}
      style={{ border: `1px solid ${theme.line}`, borderRadius: 14, overflow: "hidden", background: "#fff", position: "relative" }}
    >
      <div style={{ position: "relative", height: 170, overflow: "hidden", cursor: "pointer" }} onClick={() => onView(p)}>
        {p.discount > 0 && (
          <span style={{ position: "absolute", top: 10, left: 10, background: theme.blue, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, zIndex: 2 }}>
            -{p.discount}%
          </span>
        )}
        {p.isNew && (
          <span style={{ position: "absolute", top: 10, right: 10, background: "#fff", border: `1px solid ${theme.blue}`, color: theme.blue, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, zIndex: 2 }}>
            NEW
          </span>
        )}
        <motion.img src={p.image} alt={p.name} whileHover={{ scale: 1.08 }} transition={{ duration: 0.4 }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

        {/* Hover action icons */}
        <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }}
            style={{ width: 30, height: 30, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Wishlist"
          >
            <Heart size={14} fill={isWished ? theme.blue : "none"} color={theme.black} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompare(p.id); }}
            style={{ width: 30, height: 30, borderRadius: "50%", background: isCompared ? theme.blue : "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Compare"
          >
            <GitCompare size={14} color={isCompared ? "#fff" : theme.black} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onView(p, true); }}
            style={{ width: 30, height: 30, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Quick view"
          >
            <Eye size={14} color={theme.black} />
          </button>
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 11, color: theme.gray, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>{p.category}</div>
        {p.brand && <div style={{ fontSize: 11, fontWeight: 700, color: theme.black, marginBottom: 2 }}>{p.brand}</div>}
        <div onClick={() => onView(p)} style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, minHeight: 36, cursor: "pointer" }}>{p.name}</div>
        <StarRating rating={p.rating} reviews={p.reviews} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{formatK(Math.round(p.price * (1 - p.discount / 100)))}</span>
            {p.discount > 0 && <span style={{ fontSize: 12, color: theme.gray, textDecoration: "line-through", marginLeft: 6 }}>{formatK(p.price)}</span>}
          </div>
        </div>
        <div style={{ marginTop: 6 }}><StockBadge stock={p.stock} /></div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          disabled={p.stock === 0}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(p);
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
          }}
          style={{
            width: "100%", marginTop: 10, background: p.stock === 0 ? "#D1D5DB" : theme.black, color: "#fff", border: "none",
            borderRadius: 6, padding: "9px 0", fontSize: 13, fontWeight: 600, cursor: p.stock === 0 ? "not-allowed" : "pointer",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span key={added ? "added" : "add"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              {p.stock === 0 ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}

function ProductDetailPage({ product, allProducts, onBack, onAddToCart, onSelectProduct, onRequestService }) {
  if (!product) return null;
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const finalPrice = Math.round(product.price * (1 - product.discount / 100));
  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const crossSell = CATEGORY_TO_SERVICE[product.category];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 20px 70px" }}>
      <button onClick={onBack} style={{ display: "flex", gap: 6, alignItems: "center", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontWeight: 600, fontSize: 14 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
        {/* Image + thumbnail strip */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ background: theme.bg, borderRadius: 16, padding: 20, marginBottom: 14 }}>
            <img src={product.image} alt={product.name} style={{ width: "100%", height: 340, objectFit: "contain" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 64, height: 64, borderRadius: 8, border: `1px solid ${i === 0 ? theme.blue : theme.line}`, overflow: "hidden", opacity: i === 0 ? 1 : 0.5, cursor: "pointer" }}>
                <img src={product.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 320 }}>
          {product.brand && (
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.gray, marginBottom: 4 }}>{product.brand}</div>
          )}
          <div style={{ marginBottom: 6 }}><StarRating rating={product.rating} reviews={product.reviews} /></div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 12px" }}>{product.name}</h1>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18 }}>
            <span style={{ fontSize: 26, fontWeight: 700 }}>{formatK(finalPrice)}</span>
            {product.discount > 0 && <span style={{ fontSize: 16, color: theme.gray, textDecoration: "line-through" }}>{formatK(product.price)}</span>}
          </div>
          <p style={{ fontSize: 14, color: theme.gray, lineHeight: 1.7, marginBottom: 20 }}>{product.description}</p>

          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, color: theme.gray }}>Category</div>
          <div style={{ display: "inline-block", border: `1px solid ${theme.blue}`, borderRadius: 20, padding: "6px 16px", fontSize: 13, marginBottom: 22 }}>{product.category}</div>

          <div style={{ marginBottom: 14 }}><StockBadge stock={product.stock} /></div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.gray }}>Quantity</span>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${theme.line}`, borderRadius: 6 }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ background: "none", border: "none", padding: "6px 12px", cursor: "pointer" }}><Minus size={13} /></button>
              <span style={{ fontSize: 14, minWidth: 22, textAlign: "center" }}>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} style={{ background: "none", border: "none", padding: "6px 12px", cursor: "pointer" }}><Plus size={13} /></button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={product.stock === 0}
              onClick={() => { onAddToCart(product, qty); setAdded(true); setTimeout(() => setAdded(false), 1200); }}
              style={{ flex: 1, minWidth: 180, background: product.stock === 0 ? "#D1D5DB" : theme.black, color: "#fff", border: "none", borderRadius: 8, padding: "15px 0", fontWeight: 700, fontSize: 15, cursor: product.stock === 0 ? "not-allowed" : "pointer" }}
            >
              {product.stock === 0 ? "Out of stock" : added ? "Added to cart ✓" : "Add to Cart"}
            </motion.button>
            {crossSell && onRequestService && (
              <button
                onClick={() => onRequestService(crossSell.service)}
                style={{ flex: 1, minWidth: 180, background: "none", border: `1px solid ${theme.blue}`, color: theme.blue, borderRadius: 8, padding: "15px 0", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              >
                Buy Now / Request Quote
              </button>
            )}
          </div>

          {crossSell && (
            <div
              onClick={() => onRequestService && onRequestService(crossSell.service)}
              style={{ marginTop: 16, background: theme.bg, border: `1px solid ${theme.line}`, borderRadius: 10, padding: "12px 16px", cursor: onRequestService ? "pointer" : "default", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{crossSell.prompt}</div>
                <div style={{ fontSize: 12, color: theme.gray }}>Technosoft {crossSell.service} can help.</div>
              </div>
              <ArrowRight size={16} />
            </div>
          )}

          <div style={{ marginTop: 20, fontSize: 12, color: theme.gray }}>
            <strong style={{ color: theme.black }}>Delivery:</strong> Delivery timing and cost are confirmed at checkout based on your location within Zambia.
          </div>

          {product.specs && product.specs.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Specifications</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                  {product.specs.map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: `1px solid ${theme.line}` }}>
                      <td style={{ padding: "9px 0", color: theme.gray, width: "42%" }}>{label}</td>
                      <td style={{ padding: "9px 0", fontWeight: 500 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Keep Exploring */}
      {related.length > 0 && (
        <div style={{ marginTop: 60 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: "center", marginBottom: 30 }}>Keep Exploring</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {related.map((p) => (
              <motion.div key={p.id} whileHover={{ y: -6 }} onClick={() => onSelectProduct(p)} style={{ border: `1px solid ${theme.line}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", background: theme.bg }}>
                <img src={p.image} alt={p.name} style={{ width: "100%", height: 150, objectFit: "cover" }} />
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{formatK(p.price)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickViewModal({ product, onClose, onAddToCart }) {
  if (!product) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
          onClick={(e) => e.stopPropagation()}
          style={{ background: "#fff", borderRadius: 16, maxWidth: 720, width: "100%", padding: 28, position: "relative", display: "flex", gap: 24, flexWrap: "wrap", maxHeight: "85vh", overflowY: "auto" }}
        >
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} />
          </button>
          <img src={product.image} alt={product.name} style={{ width: 220, height: 200, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, color: theme.gray, textTransform: "uppercase", marginBottom: 6 }}>{product.category}</div>
            <h3 style={{ fontSize: 20, margin: "0 0 8px" }}>{product.name}</h3>
            <StarRating rating={product.rating} reviews={product.reviews} />
            <div style={{ fontSize: 22, fontWeight: 700, margin: "10px 0" }}>{formatK(product.price)}</div>
            <p style={{ fontSize: 13, color: theme.gray, lineHeight: 1.6, marginBottom: 16 }}>{product.description}</p>

            {product.specs && product.specs.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8, color: theme.gray }}>Specifications</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <tbody>
                    {product.specs.map(([label, value]) => (
                      <tr key={label} style={{ borderBottom: `1px solid ${theme.line}` }}>
                        <td style={{ padding: "6px 0", color: theme.gray, width: "42%" }}>{label}</td>
                        <td style={{ padding: "6px 0", fontWeight: 500 }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <StockBadge stock={product.stock} />
            <button
              onClick={() => { onAddToCart(product); onClose(); }}
              disabled={product.stock === 0}
              style={{ width: "100%", marginTop: 14, background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "11px 0", fontWeight: 600, cursor: "pointer" }}
            >
              Add to Cart
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function BusinessQuoteModal({ open, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
          onClick={(e) => e.stopPropagation()}
          style={{ background: "#fff", borderRadius: 16, maxWidth: 460, width: "100%", padding: 28, position: "relative" }}
        >
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: theme.blue, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 22 }}>✓</div>
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>Quote request sent</h3>
              <p style={{ color: theme.gray, fontSize: 13 }}>A Technosoft representative will follow up shortly.</p>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: 18, marginBottom: 4 }}>Request a Business Quote</h3>
              <p style={{ color: theme.gray, fontSize: 13, marginBottom: 18 }}>Tell us what your business needs and we'll get back to you.</p>
              <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 8, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box" }} />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 8, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box" }} />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 8, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box" }} />
              <textarea placeholder="What do you need? (e.g. 20 laptops, office networking, CCTV for 3 branches)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} style={{ width: "100%", padding: 10, marginBottom: 14, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box", resize: "vertical" }} />
              <button
                disabled={!form.name || !form.email || !form.message}
                onClick={() => setSent(true)}
                style={{ width: "100%", background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: 12, fontWeight: 700, cursor: "pointer", opacity: !form.name || !form.email || !form.message ? 0.5 : 1 }}
              >
                Send Quote Request
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ComparisonPage({ productList, onBack, onRemove }) {
  // Build the union of all spec labels across compared products, so the table stays meaningful
  // even when products come from different categories with different spec sets.
  const allSpecLabels = [...new Set(productList.flatMap((p) => (p.specs || []).map(([label]) => label)))];

  const specValue = (p, label) => {
    const found = (p.specs || []).find(([l]) => l === label);
    return found ? found[1] : "—";
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 20px 70px" }}>
      <button onClick={onBack} style={{ display: "flex", gap: 6, alignItems: "center", background: "none", border: "none", cursor: "pointer", marginBottom: 20, fontWeight: 600, fontSize: 14 }}>
        <ArrowLeft size={16} /> Back to store
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Compare Products</h1>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
          <thead>
            <tr>
              <td style={{ width: 160 }} />
              {productList.map((p) => (
                <th key={p.id} style={{ padding: "0 16px 16px", textAlign: "left", verticalAlign: "top", minWidth: 200 }}>
                  <img src={p.image} alt={p.name} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                  <button onClick={() => onRemove(p.id)} style={{ marginTop: 6, background: "none", border: "none", color: theme.gray, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Remove</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Brand", (p) => p.brand],
              ["Price", (p) => formatK(p.price)],
              ["Category", (p) => p.category],
              ["Availability", (p) => (p.stock === 0 ? "Out of stock" : p.stock < 10 ? `Low stock — ${p.stock} left` : "In stock")],
              ["Rating", (p) => `${p.rating} (${p.reviews} reviews)`],
              ["Warranty", (p) => specValue(p, "Warranty")],
            ].map(([label, getValue]) => (
              <tr key={label} style={{ borderTop: `1px solid ${theme.line}` }}>
                <td style={{ padding: "12px 16px 12px 0", color: theme.gray, fontSize: 13, fontWeight: 600 }}>{label}</td>
                {productList.map((p) => (
                  <td key={p.id} style={{ padding: "12px 16px", fontSize: 13 }}>{getValue(p)}</td>
                ))}
              </tr>
            ))}
            {allSpecLabels.filter((l) => l !== "Warranty").map((label) => (
              <tr key={label} style={{ borderTop: `1px solid ${theme.line}` }}>
                <td style={{ padding: "12px 16px 12px 0", color: theme.gray, fontSize: 13, fontWeight: 600 }}>{label}</td>
                {productList.map((p) => (
                  <td key={p.id} style={{ padding: "12px 16px", fontSize: 13 }}>{specValue(p, label)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CheckoutPage({ cart, user, onBack, onUpdateQty, onRemove, onPlaceOrder, placingOrder, orderError, placed, savedItems, onSaveForLater, onMoveToCart }) {
  const [step, setStep] = useState(1); // 1 Customer Info, 2 Delivery, 3 Payment, 4 Confirmation
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", payment: "Mobile Money",
    mobileNumber: "", mobileProvider: "MTN Money",
    cardNumber: "", cardExpiry: "", cardCvv: "", cardName: "",
    bankName: "", bankAccountName: "",
  });
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email }));
  }, [user]);
  const [trackingNumber, setTrackingNumber] = useState("");
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + (cart.length > 0 ? 100 : 0);


  // Sends an order confirmation email via EmailJS (https://www.emailjs.com — free tier, no backend needed).
  // 1. Create a free EmailJS account, an Email Service, and an Email Template with variables:
  //    {{to_email}} {{to_name}} {{tracking_number}} {{order_total}} {{order_items}}
  // 2. Replace the three placeholders below with your own EmailJS IDs.
  // 3. This call is wrapped in try/catch so a missing/invalid config never blocks checkout.
  const sendOrderConfirmationEmail = async (orderForm, tracking, items, orderTotal) => {
    const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
    const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
    const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
    if (EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID") return; // not configured yet — skip silently
    try {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: orderForm.email,
            to_name: orderForm.name,
            tracking_number: tracking,
            order_total: formatK(orderTotal),
            order_items: items.map((i) => `${i.qty}x ${i.name}`).join(", "),
          },
        }),
      });
    } catch (err) {
      console.error("Order confirmation email failed to send:", err);
    }
  };
  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const paymentDetailsValid =
    form.payment === "Mobile Money" ? form.mobileNumber.trim().length > 0
    : form.payment === "Card" ? form.cardNumber.trim().length > 0 && form.cardExpiry.trim().length > 0 && form.cardCvv.trim().length > 0 && form.cardName.trim().length > 0
    : form.payment === "Bank Transfer" ? form.bankName.trim().length > 0 && form.bankAccountName.trim().length > 0
    : true;

  const stepLabels = ["Customer Info", "Delivery", "Payment", "Confirmation"];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "30px 20px" }}>
      <button onClick={onBack} style={{ display: "flex", gap: 6, alignItems: "center", background: "none", border: "none", cursor: "pointer", marginBottom: 20, fontWeight: 600 }}>
        <ArrowLeft size={16} /> Continue shopping
      </button>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Checkout</h1>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 30, flexWrap: "wrap" }}>
        {stepLabels.map((label, i) => {
          const n = i + 1;
          const isDone = step > n;
          const isActive = step === n;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto", minWidth: 120 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: isActive || isDone ? theme.blue : "#fff", color: isActive || isDone ? "#fff" : theme.gray,
                border: `1px solid ${isActive || isDone ? theme.blue : theme.line}`,
              }}>
                {isDone ? "✓" : n}
              </div>
              <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? theme.blue : theme.gray, whiteSpace: "nowrap" }}>{label}</span>
              {n < 4 && <div style={{ flex: 1, height: 1, background: theme.line, minWidth: 12 }} />}
            </div>
          );
        })}
      </div>

      {cart.length === 0 && step < 4 ? (
        <p style={{ color: theme.gray }}>Your cart is empty.</p>
      ) : (
        <>
          {/* Step 1 — Customer Information */}
          {step === 1 && (
            <div style={{ maxWidth: 420 }}>
              <input placeholder="Full name" value={form.name} onChange={handleChange("name")} style={{ width: "100%", padding: 10, marginBottom: 8, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box" }} />
              <input placeholder="Email address" value={form.email} onChange={handleChange("email")} style={{ width: "100%", padding: 10, marginBottom: 8, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box" }} />
              <input placeholder="Phone number" value={form.phone} onChange={handleChange("phone")} style={{ width: "100%", padding: 10, marginBottom: 20, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box" }} />
              <button
                disabled={!form.name || !form.phone}
                onClick={() => setStep(2)}
                style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "12px 28px", fontWeight: 700, cursor: "pointer", opacity: !form.name || !form.phone ? 0.5 : 1 }}
              >
                Continue to Delivery
              </button>
            </div>
          )}

          {/* Step 2 — Delivery information + cart review with Save for Later */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 24 }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: `1px solid ${theme.line}`, alignItems: "center" }}>
                    <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        <button onClick={() => onUpdateQty(item.id, -1)}><Minus size={12} /></button>
                        <span style={{ fontSize: 13 }}>{item.qty}</span>
                        <button onClick={() => onUpdateQty(item.id, 1)}><Plus size={12} /></button>
                        <button onClick={() => onRemove(item.id)} title="Remove"><Trash2 size={14} /></button>
                        {onSaveForLater && (
                          <button onClick={() => onSaveForLater(item)} style={{ fontSize: 12, color: theme.gray, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                            Save for later
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatK(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>

              {savedItems && savedItems.length > 0 && (
                <div style={{ marginBottom: 24, background: theme.bg, borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: theme.gray, marginBottom: 10 }}>Saved for Later</div>
                  {savedItems.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0" }}>
                      <img src={item.image} alt={item.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} />
                      <span style={{ flex: 1, fontSize: 13 }}>{item.name}</span>
                      <button onClick={() => onMoveToCart(item)} style={{ fontSize: 12, fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Move to cart</button>
                    </div>
                  ))}
                </div>
              )}

              <input placeholder="Delivery address" value={form.address} onChange={handleChange("address")} style={{ width: "100%", maxWidth: 420, padding: 10, marginBottom: 20, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ background: "none", border: `1px solid ${theme.line}`, borderRadius: 6, padding: "12px 24px", fontWeight: 600, cursor: "pointer" }}>Back</button>
                <button
                  disabled={!form.address || cart.length === 0}
                  onClick={() => setStep(3)}
                  style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "12px 28px", fontWeight: 700, cursor: "pointer", opacity: !form.address || cart.length === 0 ? 0.5 : 1 }}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Payment */}
          {step === 3 && (
            <div style={{ maxWidth: 420 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10, color: theme.gray }}>Payment Method</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
                {["Mobile Money", "Card", "Bank Transfer"].map((method) => (
                  <label key={method} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                    <input type="radio" name="payment" checked={form.payment === method} onChange={() => setForm({ ...form, payment: method })} />
                    {method}
                  </label>
                ))}
              </div>

              {form.payment === "Mobile Money" && (
                <div style={{ background: theme.bg, borderRadius: 8, padding: 12, marginTop: 8, marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                    {["MTN Money", "Airtel Money"].map((provider) => (
                      <label key={provider} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                        <input type="radio" name="mobileProvider" checked={form.mobileProvider === provider} onChange={() => setForm({ ...form, mobileProvider: provider })} />
                        {provider}
                      </label>
                    ))}
                  </div>
                  <input placeholder="Mobile money number" value={form.mobileNumber} onChange={handleChange("mobileNumber")} style={{ width: "100%", padding: 8, border: `1px solid ${theme.line}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
                  <p style={{ fontSize: 11, color: theme.gray, margin: "6px 0 0" }}>You'll receive a prompt on this number to approve payment.</p>
                </div>
              )}

              {form.payment === "Card" && (
                <div style={{ background: theme.bg, borderRadius: 8, padding: 12, marginTop: 8, marginBottom: 14 }}>
                  <input placeholder="Name on card" value={form.cardName} onChange={handleChange("cardName")} style={{ width: "100%", padding: 8, marginBottom: 8, border: `1px solid ${theme.line}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
                  <input placeholder="Card number" value={form.cardNumber} onChange={handleChange("cardNumber")} inputMode="numeric" style={{ width: "100%", padding: 8, marginBottom: 8, border: `1px solid ${theme.line}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <input placeholder="MM/YY" value={form.cardExpiry} onChange={handleChange("cardExpiry")} style={{ flex: 1, padding: 8, border: `1px solid ${theme.line}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
                    <input placeholder="CVV" value={form.cardCvv} onChange={handleChange("cardCvv")} inputMode="numeric" style={{ flex: 1, padding: 8, border: `1px solid ${theme.line}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
                  </div>
                  <p style={{ fontSize: 11, color: theme.gray, margin: "6px 0 0" }}>⚠ Placeholder only — no real card gateway is connected yet. See the payment gateway setup notes.</p>
                </div>
              )}

              {form.payment === "Bank Transfer" && (
                <div style={{ background: theme.bg, borderRadius: 8, padding: 12, marginTop: 8, marginBottom: 14 }}>
                  <input placeholder="Your bank name" value={form.bankName} onChange={handleChange("bankName")} style={{ width: "100%", padding: 8, marginBottom: 8, border: `1px solid ${theme.line}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
                  <input placeholder="Account holder name" value={form.bankAccountName} onChange={handleChange("bankAccountName")} style={{ width: "100%", padding: 8, border: `1px solid ${theme.line}`, borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
                  <p style={{ fontSize: 11, color: theme.gray, margin: "6px 0 0" }}>Technosoft's bank details and a payment reference will be sent to you after placing the order.</p>
                </div>
              )}

              <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: 12, marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: theme.gray, marginBottom: 4 }}>
                  <span>Subtotal</span><span>{formatK(subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: theme.gray, marginBottom: 10 }}>
                  <span>Delivery</span><span>{formatK(cart.length > 0 ? 100 : 0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16 }}>
                  <span>Total</span><span>{formatK(total)}</span>
                </div>
              </div>

              {orderError && (
                <div style={{ background: "#FEECEC", border: "1px solid #F5A3A3", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#8A1F1F", marginTop: 16 }}>{orderError}</div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => setStep(2)} style={{ background: "none", border: `1px solid ${theme.line}`, borderRadius: 6, padding: "12px 24px", fontWeight: 600, cursor: "pointer" }}>Back</button>
                <button
                  disabled={!paymentDetailsValid || placingOrder}
                  onClick={async () => {
                    try {
                      const order = await onPlaceOrder(form);
                      setTrackingNumber(order.tracking_number);
                      sendOrderConfirmationEmail(form, order.tracking_number, cart, total);
                      setStep(4);
                    } catch {
                      // orderError (from the parent) is already shown above
                    }
                  }}
                  style={{ flex: 1, background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: 12, fontWeight: 700, cursor: "pointer", opacity: !paymentDetailsValid || placingOrder ? 0.5 : 1 }}
                >
                  {placingOrder ? "Placing order..." : "Place Order"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Confirmation */}
          {step === 4 && placed && (
            <div style={{ maxWidth: 500, margin: "20px auto", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: theme.blue, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26 }}>✓</div>
              <h2>Order received</h2>
              <div style={{ background: theme.bg, borderRadius: 8, padding: "12px 20px", display: "inline-block", margin: "12px 0" }}>
                <div style={{ fontSize: 11, color: theme.gray, textTransform: "uppercase", letterSpacing: 0.5 }}>Tracking Number</div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>{trackingNumber}</div>
              </div>
              <p style={{ color: theme.gray, fontSize: 14 }}>We'll contact you shortly to confirm delivery and payment.{form.email ? " A confirmation has been sent to your email." : ""}</p>
              <button onClick={onBack} style={{ marginTop: 20, background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, cursor: "pointer" }}>Back to store</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TechnosoftStoreV2Inner({ onBackHome, initialCategory, onRequestService, onGoToSupport, onGoToLogin }) {
  const [savedItems, setSavedItems] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [view, setView] = useState("store"); // store | detail | checkout
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [user] = useState(() => getStoredUser());
  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const [maxPrice, setMaxPrice] = useState(3000);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [lastOrder, setLastOrder] = useState(null);

  // Loads the live product catalog from the database.
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setProductsError("");
      try {
        const res = await fetch(`${API_BASE}/products.php`);
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        // PDO returns DECIMAL columns as strings and TINYINT as 0/1 — normalize to the
        // types the rest of this file expects.
        const normalized = data.map((p) => ({
          ...p,
          price: Number(p.price),
          rating: Number(p.rating) || 0,
          reviews: Number(p.reviews) || 0,
          stock: Number(p.stock) || 0,
          discount: Number(p.discount || 0),
          isNew: !!Number(p.is_new),
          description: p.description || "",
          brand: p.brand || "",
          subcategory: p.subcategory || "",
          image: p.image || "/images/products/placeholder.png",
        }));
        setProducts(normalized);
      } catch (err) {
        console.error("Failed to load products:", err);
        setProductsError("Couldn't load products from the server. Confirm the backend is running (see the API setup notes).");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Sends the cart to the backend as a real order, returns the created order (with tracking number).
  const placeOrder = async (form) => {
    setPlacingOrder(true);
    setOrderError("");
    try {
      const res = await fetch(`${API_BASE}/orders.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: user?.id ?? null,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          payment: form.payment,
          items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      setLastOrder(data);
      setOrderPlaced(true);
      setCart([]);
      return data;
    } catch (err) {
      console.error("Failed to place order:", err);
      setOrderError(err.message === "Failed to fetch"
        ? "Couldn't reach the server — confirm the backend is running (see the API setup notes)."
        : err.message);
      throw err;
    } finally {
      setPlacingOrder(false);
    }
  };

  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 5);
  }, [searchTerm, products]);

  const filtered = useMemo(() => {
    let list = products
      .filter((p) => activeCategory === "All" || p.category === activeCategory)
      .filter((p) => {
        const term = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term) || (p.description || "").toLowerCase().includes(term);
      })
      .filter((p) => p.price <= maxPrice);

    if (sortBy === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "newest") list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    else list = [...list].sort((a, b) => b.reviews - a.reviews); // popularity

    return list;
  }, [activeCategory, searchTerm, maxPrice, sortBy, products]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { ...product, qty }];
    });
  };

  const toggleWishlist = (id) => setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleCompare = (id) => setCompareList((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev));
  const updateQty = (id, delta) => setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const viewProductDetail = (p) => { setSelectedProduct(p); setView("detail"); };
  const saveForLater = (item) => {
    setCart((prev) => prev.filter((i) => i.id !== item.id));
    setSavedItems((prev) => (prev.find((i) => i.id === item.id) ? prev : [...prev, { ...item, qty: item.qty || 1 }]));
  };
  const moveToCart = (item) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
    addToCart(item);
  };

  if (view === "detail") {
    return (
      <div style={{ fontFamily: "Arial, Helvetica, 'Segoe UI', sans-serif" }}>
        <style>{`html { overflow-x: hidden; } img { max-width: 100%; }`}</style>
        <StoreNavbar cartCount={cartCount} wishlistCount={wishlist.length} onCartClick={() => setView("checkout")} onLogoClick={onBackHome} onWishlistClick={() => setView("wishlist")} onSearch={(term) => { setSearchTerm(term); setView("store"); }} products={products} />
        <ProductDetailPage
          product={selectedProduct}
          allProducts={products}
          onBack={() => setView("store")}
          onAddToCart={addToCart}
          onSelectProduct={viewProductDetail}
          onRequestService={onRequestService || (() => setShowQuoteModal(true))}
        />
      </div>
    );
  }

  if (view === "compare") {
    return (
      <div style={{ fontFamily: "Arial, Helvetica, 'Segoe UI', sans-serif" }}>
        <style>{`html { overflow-x: hidden; } img { max-width: 100%; }`}</style>
        <StoreNavbar cartCount={cartCount} wishlistCount={wishlist.length} onCartClick={() => setView("checkout")} onLogoClick={onBackHome} onWishlistClick={() => setView("wishlist")} onSearch={(term) => { setSearchTerm(term); setView("store"); }} products={products} />
        <ComparisonPage
          productList={products.filter((p) => compareList.includes(p.id))}
          onBack={() => setView("store")}
          onRemove={(id) => setCompareList((prev) => prev.filter((x) => x !== id))}
        />
      </div>
    );
  }

  if (view === "wishlist") {
    return (
      <div style={{ fontFamily: "Arial, Helvetica, 'Segoe UI', sans-serif" }}>
        <style>{`html { overflow-x: hidden; } img { max-width: 100%; }`}</style>
        <StoreNavbar cartCount={cartCount} wishlistCount={wishlist.length} onCartClick={() => setView("checkout")} onLogoClick={onBackHome} onWishlistClick={() => setView("wishlist")} onSearch={(term) => { setSearchTerm(term); setView("store"); }} products={products} />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 20px 70px" }}>
          <button onClick={() => setView("store")} style={{ display: "flex", gap: 6, alignItems: "center", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontWeight: 600, fontSize: 14 }}>
            <ArrowLeft size={16} /> Back to store
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Your Wishlist</h1>
          {wishlist.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: theme.gray }}>
              <Heart size={36} style={{ marginBottom: 10 }} />
              <p>Nothing saved yet — tap the heart icon on any product to add it here.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 20 }}>
              {products.filter((p) => wishlist.includes(p.id)).map((p) => (
                <ProductCard key={p.id} p={p} onView={(prod, quick) => (quick ? setQuickViewProduct(prod) : viewProductDetail(prod))} onAddToCart={addToCart} wishlist={wishlist} onToggleWishlist={toggleWishlist} compareList={compareList} onToggleCompare={toggleCompare} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "checkout") {
    if (!user) {
      return (
        <div style={{ fontFamily: "Arial, Helvetica, 'Segoe UI', sans-serif" }}>
          <style>{`html { overflow-x: hidden; } img { max-width: 100%; }`}</style>
          <StoreNavbar cartCount={cartCount} wishlistCount={wishlist.length} onCartClick={() => setView("checkout")} onLogoClick={onBackHome} onWishlistClick={() => setView("wishlist")} onSearch={(term) => { setSearchTerm(term); setView("store"); }} products={products} />
          <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, color: theme.black }}>Log in to check out</h1>
            <p style={{ color: theme.gray, fontSize: 14, marginBottom: 24 }}>We link every order to your account so you can track it afterwards.</p>
            <button onClick={() => onGoToLogin && onGoToLogin()} style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Log In / Sign Up</button>
          </div>
        </div>
      );
    }
    return (
      <div style={{ fontFamily: "Arial, Helvetica, 'Segoe UI', sans-serif" }}>
        <style>{`html { overflow-x: hidden; } img { max-width: 100%; }`}</style>
        <StoreNavbar cartCount={cartCount} wishlistCount={wishlist.length} onCartClick={() => setView("checkout")} onLogoClick={onBackHome} onWishlistClick={() => setView("wishlist")} onSearch={(term) => { setSearchTerm(term); setView("store"); }} products={products} />
        <CheckoutPage
          cart={cart}
          user={user}
          onBack={() => setView("store")}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onPlaceOrder={placeOrder}
          placingOrder={placingOrder}
          orderError={orderError}
          placed={orderPlaced}
          savedItems={savedItems}
          onSaveForLater={saveForLater}
          onMoveToCart={moveToCart}
        />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Arial, Helvetica, 'Segoe UI', sans-serif", background: "#fff", minHeight: "100vh" }}>
      <style>{`
        button, a { transition: filter 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease; }
        button:hover:not(:disabled), a:hover { filter: brightness(0.92); }
        button:active:not(:disabled) { transform: translateY(1px); }
        input:focus, textarea:focus, select:focus { outline: none; border-color: ${theme.blue} !important; box-shadow: 0 0 0 3px ${theme.blueLight}; }
        .tf-shimmer { position: relative; overflow: hidden; }
        .tf-shimmer::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: tf-shimmer 1.4s infinite;
        }
        @keyframes tf-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        /* ── Mobile responsiveness ─────────────────────────── */
        img { max-width: 100%; }
        @media (max-width: 860px) {
          .tf-store-body { flex-direction: column; }
          .tf-store-sidebar { display: none !important; }
          .tf-mobile-filter-btn { display: flex !important; }
        }
        @media (max-width: 640px) {
          h1 { font-size: 24px !important; }
          h2 { font-size: 20px !important; }
        }
      `}</style>
      <style>{`html { overflow-x: hidden; }`}</style>

      <StoreNavbar cartCount={cartCount} wishlistCount={wishlist.length} onCartClick={() => setView("checkout")} onLogoClick={onBackHome} onWishlistClick={() => setView("wishlist")} onSearch={(term) => { setSearchTerm(term); setView("store"); }} activeCategory={activeCategory} onCategoryClick={setActiveCategory} products={products} />

      {/* ── Store hero (only on the unfiltered landing view) ─── */}
      {activeCategory === "All" && !searchTerm && (
        <section style={{ background: theme.bg, borderBottom: `1px solid ${theme.line}`, padding: "60px 24px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 12px", maxWidth: 560, color: theme.black }}>Technology Built for the Way You Work.</h1>
            <p style={{ color: "#3A3A3A", fontSize: 15, marginBottom: 24, maxWidth: 520 }}>
              Discover reliable computing, networking and technology solutions for businesses, organizations and individuals.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#products-grid" style={{ background: theme.blue, color: "#fff", padding: "12px 26px", borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Shop Products</a>
              <button onClick={() => setShowQuoteModal(true)} style={{ border: `1px solid ${theme.blue}`, color: theme.blue, background: "none", padding: "12px 26px", borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Request a Quote</button>
            </div>
          </div>
        </section>
      )}

      {/* ── Shop by Category ──────────────────────────────────── */}
      {activeCategory === "All" && !searchTerm && (
        <section style={{ padding: "50px 24px", borderBottom: `1px solid ${theme.line}` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Shop by Category</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {categories.filter((c) => c !== "All").map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <motion.button
                    key={cat}
                    whileHover={{ y: -4 }}
                    onClick={() => setActiveCategory(cat)}
                    style={{ textAlign: "left", background: theme.bg, border: `1px solid ${theme.line}`, borderRadius: 12, padding: 20, cursor: "pointer" }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{cat}</div>
                    <div style={{ fontSize: 12, color: theme.gray, marginBottom: 10 }}>{count} product{count !== 1 ? "s" : ""}</div>
                    <span style={{ fontSize: 12, fontWeight: 700, textDecoration: "underline" }}>Shop Now</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Deals (only real discounted products — no invented data) ── */}
      {activeCategory === "All" && !searchTerm && products.some((p) => p.discount > 0) && (
        <section style={{ padding: "50px 24px", borderBottom: `1px solid ${theme.line}` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Featured Deals</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 20 }}>
              {products.filter((p) => p.discount > 0).map((p) => (
                <ProductCard key={p.id} p={p} onView={(prod, quick) => (quick ? setQuickViewProduct(prod) : viewProductDetail(prod))} onAddToCart={addToCart} wishlist={wishlist} onToggleWishlist={toggleWishlist} compareList={compareList} onToggleCompare={toggleCompare} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Compare bar ─────────────────────────────────────── */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ background: theme.blue, color: "#fff", padding: "10px 20px", fontSize: 13 }}
          >
            <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Comparing {compareList.length} product{compareList.length > 1 ? "s" : ""}</span>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setView("compare")} disabled={compareList.length < 2} style={{ background: "#fff", color: theme.black, border: "none", borderRadius: 6, padding: "4px 14px", cursor: compareList.length < 2 ? "not-allowed" : "pointer", opacity: compareList.length < 2 ? 0.5 : 1, fontWeight: 600 }}>Compare Now</button>
                <button onClick={() => setCompareList([])} style={{ background: "none", border: "1px solid #fff", color: "#fff", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>Clear</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        className="tf-mobile-filter-btn"
        onClick={() => setMobileFiltersOpen(true)}
        style={{ display: "none", alignItems: "center", gap: 8, margin: "16px 20px 0", background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "10px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
      >
        <SlidersHorizontal size={15} /> Filters {activeCategory !== "All" ? `(${activeCategory})` : ""}
      </button>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileFiltersOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 90 }} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.25 }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 280, background: "#fff", zIndex: 95, padding: 20, overflowY: "auto" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <FilterPanel
                categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory}
                maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                showSuggestions={false} setShowSuggestions={() => {}} suggestions={[]}
              />
              <button onClick={() => setMobileFiltersOpen(false)} style={{ width: "100%", marginTop: 16, background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: 12, fontWeight: 700, cursor: "pointer" }}>
                Show {filtered.length} results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <section id="products-grid" className="tf-store-body" style={{ maxWidth: 1280, margin: "0 auto", padding: "30px 20px", display: "flex", gap: 28, flexWrap: "wrap" }}>
        {/* Sidebar filters (desktop/tablet — hidden on mobile in favor of the drawer above) */}
        <aside className="tf-store-sidebar" style={{ width: 220, flexShrink: 0 }}>
          <FilterPanel
            categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            showSuggestions={showSuggestions} setShowSuggestions={setShowSuggestions} suggestions={suggestions}
          />
        </aside>

        {/* Product grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: theme.gray }}>{filtered.length} products</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ border: `1px solid ${theme.line}`, borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
              <option value="popularity">Sort: Popularity</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-low">Sort: Price (low to high)</option>
              <option value="price-high">Sort: Price (high to low)</option>
            </select>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 20 }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : productsError ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: theme.gray }}>
              <p>{productsError}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: theme.gray }}>
              <ShoppingCart size={36} style={{ marginBottom: 10 }} />
              <p>No products found{searchTerm ? ` for "${searchTerm}"` : ""}.</p>
            </div>
          ) : (
            <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 20 }}>
              <AnimatePresence>
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    p={p}
                    onView={(prod, quick) => (quick ? setQuickViewProduct(prod) : viewProductDetail(prod))}
                    onAddToCart={addToCart}
                    wishlist={wishlist}
                    onToggleWishlist={toggleWishlist}
                    compareList={compareList}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={addToCart} />
      <BusinessQuoteModal open={showQuoteModal} onClose={() => setShowQuoteModal(false)} />

      {/* ── Trust section ─────────────────────────────────────── */}
      <section style={{ padding: "40px 24px", background: theme.bg, borderTop: `1px solid ${theme.line}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap", textAlign: "center" }}>
          {["Secure Shopping", "Reliable Products", "Business Support", "Warranty Support", "Professional IT Expertise"].map((t) => (
            <div key={t} style={{ fontSize: 13, fontWeight: 600, color: theme.gray, maxWidth: 140 }}>{t}</div>
          ))}
        </div>
      </section>

      {/* ── Business / bulk orders ────────────────────────────── */}
      <section style={{ padding: "50px 24px", background: theme.blue, color: "#fff", textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Need Technology for Your Business?</h2>
        <p style={{ color: "#C7C7C7", fontSize: 14, marginBottom: 22, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
          Planning a large technology purchase? Get a customized quote for networking equipment, security systems, cabling and other IT infrastructure.
        </p>
        <button onClick={() => setShowQuoteModal(true)} style={{ background: "#fff", color: theme.black, border: "none", borderRadius: 6, padding: "13px 30px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Request a Business Quote
        </button>
      </section>

      <footer style={{ background: theme.blue, color: "#888", padding: "24px 20px", marginTop: 0 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "5px 12px", borderRadius: 8, display: "inline-flex" }}>
            <img src={LOGO_PATH} alt="Technosoft" style={{ height: 22, display: "block" }} />
          </div>
          <span style={{ fontSize: 12 }}>&copy; {new Date().getFullYear()} Technosoft. Mobile money, card, and bank transfer accepted.</span>
        </div>
      </footer>
    </div>
  );
}

function StoreNavbar({ cartCount, wishlistCount, onCartClick, onLogoClick, onWishlistClick, onSearch, activeCategory, onCategoryClick, products }) {
  const [headerSearch, setHeaderSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(headerSearch);
  };

  return (
    <header style={{ borderBottom: `1px solid ${theme.line}`, position: "sticky", top: 0, background: "#fff", zIndex: 30 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <img src={LOGO_PATH} alt="Technosoft" style={{ height: 44, cursor: "pointer", flexShrink: 0 }} onClick={onLogoClick} />

        {/* Prominent header search */}
        <form onSubmit={submitSearch} style={{ flex: 1, minWidth: 180, maxWidth: 520, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${theme.line}`, borderRadius: 8, padding: "9px 14px" }}>
          <Search size={16} color={theme.gray} />
          <input
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            placeholder="Search products, brands or model numbers…"
            style={{ border: "none", outline: "none", fontSize: 13, width: "100%" }}
          />
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginLeft: "auto" }}>
          <a href="#" style={{ display: "none", alignItems: "center", gap: 6, color: theme.black, textDecoration: "none", fontSize: 14, fontWeight: 600 }} className="tf-support-link">
            <Ticket size={16} /> Support Ticket
          </a>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }} aria-label="Account">
            <User size={20} color={theme.black} />
          </button>
          <button onClick={onWishlistClick} style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }} aria-label="Wishlist">
            <Heart size={20} color={theme.black} />
            {wishlistCount > 0 && (
              <span style={{ position: "absolute", top: -6, right: -8, background: theme.blue, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {wishlistCount}
              </span>
            )}
          </button>
          <button onClick={onCartClick} style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }} aria-label="Cart">
            <ShoppingCart size={22} color={theme.black} />
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -6, right: -8, background: theme.blue, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category quick-nav strip with hover subcategory dropdown */}
      {onCategoryClick && (
        <div className="tf-cat-nav" style={{ borderTop: `1px solid ${theme.line}`, overflowX: "auto" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 4, padding: "0 20px" }}>
            {categories.filter((c) => c !== "All").map((cat) => {
              const subcats = [...new Set((products || []).filter((p) => p.category === cat).map((p) => p.subcategory).filter(Boolean))];
              return (
                <div key={cat} className="tf-mega-item" style={{ position: "relative" }}>
                  <button
                    onClick={() => onCategoryClick(cat)}
                    style={{
                      flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: "10px 14px", fontSize: 13, fontWeight: 600,
                      color: activeCategory === cat ? theme.blue : theme.gray,
                      borderBottom: activeCategory === cat ? `2px solid ${theme.black}` : "2px solid transparent",
                    }}
                  >
                    {cat}
                  </button>
                  {subcats.length > 0 && (
                    <div className="tf-mega-dropdown" style={{ display: "none", position: "absolute", top: "100%", left: 0, background: "#fff", border: `1px solid ${theme.line}`, borderRadius: 8, padding: 10, minWidth: 200, zIndex: 25, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}>
                      {subcats.map((sub) => (
                        <div
                          key={sub}
                          onClick={() => onCategoryClick(cat)}
                          style={{ padding: "7px 10px", fontSize: 13, color: "#374151", cursor: "pointer", borderRadius: 6 }}
                        >
                          {sub}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <style>{`.tf-mega-item:hover .tf-mega-dropdown { display: block !important; } .tf-mega-dropdown div:hover { background: ${theme.bg}; }`}</style>
        </div>
      )}
    </header>
  );
}

// Catches unexpected render errors anywhere in the store (e.g. an API response
// shaped differently than expected) and shows a clear message instead of a
// silent blank page — the actual error is still logged to the console for debugging.
class StoreErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Store crashed:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ fontFamily: "Arial, Helvetica, 'Segoe UI', sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: theme.black }}>Something went wrong loading the store</h1>
            <p style={{ color: theme.gray, fontSize: 14, marginBottom: 20 }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => { this.setState({ error: null }); this.props.onBackHome && this.props.onBackHome(); }}
              style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TechnosoftStoreV2(props) {
  return (
    <StoreErrorBoundary onBackHome={props.onBackHome}>
      <TechnosoftStoreV2Inner {...props} />
    </StoreErrorBoundary>
  );
}
