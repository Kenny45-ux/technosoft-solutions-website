import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Phone, Mail, ArrowRight, ArrowLeft as ArrowLeftIcon, Star, ShoppingBag, Ticket, Code2, Network, Shield, Share2, Headset, Wrench, Menu, X, Cloud, TrendingUp } from "lucide-react";
import { products, formatK } from "../data/products";
import { getStoredUser, storeUser, clearStoredUser } from "../utils/auth";

// ── Theme: black & blue, matching the Technosoft logo ───────────────
const theme = {
  black: "#0A0A0A",
  charcoal: "#1C1C1C",
  charcoalLight: "#3A3A3A",
  gray: "#5B5B5B",
  line: "#E5E7EB",
  bg: "#FAFAFA",
  blue: "#037EC2",       // sampled directly from the Technosoft logo
  blueDark: "#025E92",   // hover / pressed state
  blueLight: "#E6F3FA",  // light tint for badges, hover backgrounds
};

const FONT = "Arial, Helvetica, 'Segoe UI', sans-serif";
const LOGO_PATH = "/images/technosoft-logo.png";

// Backend API base — the PHP endpoints living in /technosoft-api on your XAMPP htdocs.
// Change this to your real domain once deployed (e.g. "https://technosoft.co.zm/api").
const API_BASE = "http://localhost/technosoft-api";

const services = [
  { icon: Code2, title: "Web Development", blurb: "Custom websites and web applications built for your business.", heroIcon: "code", heroImage: "/images/services/service-web-development.jpg",
    detail: "We design and build custom websites and web applications tailored to how your business actually operates — from marketing sites to full business systems. Every project covers responsive design, a maintainable codebase, and deployment support, so what we hand over is something your team can keep running long after launch." },
  { icon: Network, title: "Networking", blurb: "Design, installation, and support for enterprise networks.", heroIcon: "network", heroImage: "/images/services/service-networking.jpg",
    detail: "From structured cabling to full network architecture, we design, install, and support the wired and wireless networks enterprise businesses depend on daily — covering coverage planning, hardware selection, and ongoing performance monitoring so your connectivity stays reliable as you grow." },
  { icon: Shield, title: "CCTV & Security", blurb: "Surveillance, alarms, and access control systems.", heroIcon: "cctv", heroImage: "/images/services/service-cctv-security.jpg",
    detail: "We install and maintain CCTV surveillance, intruder alarms, and access control systems for offices, warehouses, and commercial sites — giving you visibility and control over who moves through your premises, backed by remote monitoring options." },
  { icon: Share2, title: "Software Development", blurb: "Desktop and mobile applications tailored to your needs.", heroIcon: "code", heroImage: "/images/services/service-software-development.jpg",
    detail: "Beyond the web, we build custom desktop and mobile applications suited to specific business workflows — internal tools, client-facing apps, or process automation — scoped around what your business actually needs rather than a one-size-fits-all package." },
  { icon: Headset, title: "IT Support", blurb: "Callout support available on contract or per visit.", heroIcon: "laptop", heroImage: "/images/services/service-it-support.jpg",
    detail: "Whether you need an ongoing support contract or a single callout visit, our IT support team handles hardware, software, and network issues as they arise — with priority response times for contracted clients and straightforward per-visit billing for one-off needs." },
  { icon: Wrench, title: "Computer Repairs", blurb: "Diagnostics and repair for laptops and desktops.", heroIcon: "laptop", heroImage: "/images/services/service-computer-repairs.jpg",
    detail: "We diagnose and repair laptops and desktops — hardware faults, performance issues, and software problems — getting your equipment back to reliable daily use rather than defaulting to a costly replacement." },
];

// Placeholder partner names — replace with real partner logos before publishing
const PARTNERS = [
  { name: "Cisco", logo: "/images/partners/cisco.png" },
  { name: "Microsoft", logo: "/images/partners/microsoft.png" },
  { name: "IBM", logo: "/images/partners/ibm.png" },
  { name: "HP", logo: "/images/partners/hp.png" },
  { name: "Sophos", logo: "/images/partners/sophos.png" },
];

// Broader set for the scrolling trust marquee (separate from the curated Partners section above)
const MARQUEE_LOGOS = [
  { name: "Cisco", logo: "/images/partners/cisco.png" },
  { name: "Microsoft", logo: "/images/partners/microsoft.png" },
  { name: "IBM", logo: "/images/partners/ibm.png" },
  { name: "HP", logo: "/images/partners/hp.png" },
  { name: "Sophos", logo: "/images/partners/sophos.png" },
  { name: "Kaspersky", logo: "/images/partners/kaspersky.png" },
  { name: "SolarWinds", logo: "/images/partners/solarwinds.png" },
  { name: "Schneider Electric", logo: "/images/partners/schneider.png" },
  { name: "Zendesk", logo: "/images/partners/zendesk.png" },
  { name: "Sage Pastel", logo: "/images/partners/sage-pastel.png" },
  { name: "Norton", logo: "/images/partners/norton.png" },
  { name: "Drive Control Corporation", logo: "/images/partners/drive-control.png" },
  { name: "Westcon", logo: "/images/partners/westcon.png" },
];

const slideshowProducts = products.slice(0, 5);

function FadeInSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  );
}

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill={i <= Math.round(rating) ? theme.blue : "none"} color={theme.black} />)}
    </div>
  );
}

function HeroSceneSVG({ highlight, light }) {
  const BLUE = light ? "#B8D9EC" : "#E5E5E5";   // soft brand-blue tint on light bg, light gray on dark bg
  const ORANGE = light ? "#4E7A99" : "#8A8A8A"; // muted navy-blue on light bg, mid-gray on dark bg
  const TEXT_COLOR = light ? "#1A1A1A" : "#fff";

  // Left and right icon clusters kept off the center ~900px text column so the
  // "Technology That Powers Your Business" headline always sits over dark, empty space.
  const leftNodes = [
    { y: 130, label: "SERVERS &", label2: "DATA CENTER", icon: "server" },
    { y: 280, label: "NETWORK &", label2: "ROUTING", icon: "network" },
    { y: 430, label: "CYBER-", label2: "SECURITY", icon: "shield" },
    { y: 580, label: "STRUCTURED", label2: "CABLING", icon: "cabling" },
  ];
  const rightNodes = [
    { y: 130, label: "CLOUD", label2: "COMPUTING", icon: "cloud" },
    { y: 280, label: "BUSINESS", label2: "DEVICES", icon: "laptop" },
    { y: 430, label: "CCTV &", label2: "SECURITY", icon: "cctv" },
    { y: 580, label: "SOFTWARE", label2: "DEVELOPMENT", icon: "code" },
  ];

  const iconFor = (type, color) => {
    switch (type) {
      case "server":
        return (
          <g>
            {[0, 1, 2].map((r) => (
              <rect key={r} x="-14" y={-20 + r * 14} width="28" height="10" rx="1.5" fill="none" stroke={color} strokeWidth="1.6" />
            ))}
            {[0, 1, 2].map((r) => <circle key={r} cx="8" cy={-15 + r * 14} r="1.4" fill={color} />)}
          </g>
        );
      case "network":
        return (
          <g>
            <circle cx="0" cy="-8" r="4" fill="none" stroke={color} strokeWidth="1.6" />
            <circle cx="-14" cy="12" r="4" fill="none" stroke={color} strokeWidth="1.6" />
            <circle cx="14" cy="12" r="4" fill="none" stroke={color} strokeWidth="1.6" />
            <path d="M0 -4 L0 4 M-3 6 L-11 10 M3 6 L11 10" stroke={color} strokeWidth="1.4" fill="none" />
          </g>
        );
      case "shield":
        return (
          <g>
            <path d="M0 -18 L15 -12 V4 C15 16 0 22 0 22 C0 22 -15 16 -15 4 V-12 Z" fill="none" stroke={color} strokeWidth="1.6" />
            <path d="M-6 2 L-1 8 L8 -6" fill="none" stroke={color} strokeWidth="1.8" />
          </g>
        );
      case "cabling":
        return (
          <g>
            <path d="M-16 6 Q -8 -14 0 6 T 16 6" fill="none" stroke={color} strokeWidth="1.6" />
            <circle cx="-16" cy="6" r="2.2" fill={color} />
            <circle cx="16" cy="6" r="2.2" fill={color} />
          </g>
        );
      case "cloud":
        return <path d="M-16 10 a10 10 0 0 1 2-19.8 a13 13 0 0 1 25 3.4 a9 9 0 0 1 -2 16.4 z" fill="none" stroke={color} strokeWidth="1.6" />;
      case "laptop":
        return (
          <g>
            <rect x="-15" y="-12" width="30" height="18" rx="1.5" fill="none" stroke={color} strokeWidth="1.6" />
            <path d="M-18 8 L18 8 L15 14 L-15 14 Z" fill="none" stroke={color} strokeWidth="1.6" />
          </g>
        );
      case "cctv":
        return (
          <g>
            <rect x="-16" y="-6" width="22" height="12" rx="2" fill="none" stroke={color} strokeWidth="1.6" />
            <circle cx="10" cy="0" r="6" fill="none" stroke={color} strokeWidth="1.6" />
            <circle cx="10" cy="0" r="2" fill={color} />
          </g>
        );
      case "code":
        return (
          <g>
            <path d="M-6 -12 L-16 0 L-6 12" fill="none" stroke={color} strokeWidth="1.8" />
            <path d="M6 -12 L16 0 L6 12" fill="none" stroke={color} strokeWidth="1.8" />
          </g>
        );
      default:
        return null;
    }
  };

  const Node = ({ x, y, label, label2, icon, color, align, isHighlighted }) => (
    <g>
      {/* connector line toward the dark center */}
      <path
        d={align === "left" ? `M ${x + 30} ${y} H ${x + 90} Q ${x + 110} ${y} ${x + 110} ${y - 20 * Math.sign(300 - y) || y}` : `M ${x - 30} ${y} H ${x - 90}`}
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        opacity={isHighlighted ? 0.9 : 0.55}
      />
      {isHighlighted && <circle cx={x} cy={y} r="38" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />}
      <circle cx={x} cy={y} r="30" fill="none" stroke={color} strokeWidth={isHighlighted ? 2.4 : 1.6} opacity={isHighlighted ? 1 : 0.8} />
      <circle cx={x} cy={y} r="30" fill={color} opacity={isHighlighted ? 0.18 : 0.06} />
      <g transform={`translate(${x}, ${y})`} opacity="0.95">{iconFor(icon, color)}</g>
      <text x={align === "left" ? x + 42 : x - 42} y={y - 4} textAnchor={align === "left" ? "start" : "end"} fill={TEXT_COLOR} fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="13" opacity={isHighlighted ? 1 : 0.85}>{label}</text>
      <text x={align === "left" ? x + 42 : x - 42} y={y + 13} textAnchor={align === "left" ? "start" : "end"} fill={TEXT_COLOR} fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="13" opacity={isHighlighted ? 1 : 0.85}>{label2}</text>
    </g>
  );

  return (
    <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="ecoGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={highlight ? BLUE : ORANGE} stopOpacity="0.14" />
          <stop offset="100%" stopColor={highlight ? BLUE : ORANGE} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft ambient glow, kept behind the text column, low opacity */}
      <circle cx="800" cy="350" r="360" fill="url(#ecoGlow)" />

      {/* Faint arcing lines suggesting one connected ecosystem, routed above/below the text zone */}
      <path d="M 220 130 Q 800 20 1380 130" stroke={BLUE} strokeWidth="1" fill="none" opacity="0.25" />
      <path d="M 220 580 Q 800 690 1380 580" stroke={ORANGE} strokeWidth="1" fill="none" opacity="0.25" />

      {/* Left cluster — servers, network, security, cabling */}
      {leftNodes.map((n, i) => (
        <Node key={i} x={230} y={n.y} label={n.label} label2={n.label2} icon={n.icon} color={i % 2 === 0 ? BLUE : ORANGE} align="left" isHighlighted={highlight === n.icon} />
      ))}

      {/* Right cluster — cloud, devices, CCTV, software */}
      {rightNodes.map((n, i) => (
        <Node key={i} x={1370} y={n.y} label={n.label} label2={n.label2} icon={n.icon} color={i % 2 === 0 ? ORANGE : BLUE} align="right" isHighlighted={highlight === n.icon} />
      ))}
    </svg>
  );
}

// Real contact details (from technosoft.co.zm)
const CONTACT = {
  address: ["Zambia, Lusaka,", "20 Wusikili Road, Northmead"],
  tel: "0211 - 238410",
  cell: "+260 971 582 628",
  emails: ["info@technosoft.co.zm", "dn@technosoft.co.zm"],
  hours: "Mon - Fri: 8:30 AM to 5 PM",
};

// ── Support Center ────────────────────────────────────────────────
// Ticket creation and the "My Support Tickets" list are now connected to the
// real PHP/MySQL backend (see /technosoft-api/tickets.php). Replies and
// attachments are NOT connected yet — no messages.php endpoint exists yet —
// so those stay disabled with an explanation rather than pretending to work.
const TICKET_CATEGORIES = ["Technical Support", "Hardware", "Software", "Networking", "Cybersecurity", "Website/Application", "Account", "Billing", "Other"];
const TICKET_PRIORITIES = ["Low", "Medium", "High", "Critical"];

function DemoBanner() {
  return (
    <div style={{ background: "#E6F0FA", border: "1px solid #9CC3E8", borderRadius: 8, padding: "10px 16px", fontSize: 12, color: "#0B3D66", marginBottom: 24 }}>
      ✓ Connected — tickets you create here are saved to the Technosoft database. Replying to a ticket and file attachments aren't wired up yet (no backend endpoint for those exists yet), so those stay disabled for now.
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Open: { bg: "#E6F0FA", text: "#0B3D66" },
    "In Progress": { bg: "#FFF7E6", text: "#7A5B00" },
    "Waiting for Customer": { bg: "#F3E8FF", text: "#5B21B6" },
    Resolved: { bg: "#E6F9EE", text: "#15803D" },
    Closed: { bg: "#F3F4F6", text: "#4B5563" },
  };
  const c = colors[status] || colors.Open;
  return <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.3 }}>{status}</span>;
}

function SupportCenter({ onBack, user, onGoToLogin }) {
  const [view, setView] = useState("center"); // center | create | confirm | list | detail
  const [lastTicket, setLastTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", category: "", priority: "Medium", subject: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // Prefill the ticket form with the logged-in customer's details.
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email }));
  }, [user]);

  // Loads the logged-in customer's tickets from the real backend.
  const fetchTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    setTicketsError("");
    try {
      const res = await fetch(`${API_BASE}/tickets.php?customer_id=${user.id}`);
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets:", err);
      setTicketsError("Couldn't load tickets from the server. Confirm the backend is running (see the API setup notes).");
    } finally {
      setLoadingTickets(false);
    }
  };

  // Fetch whenever the ticket list view is opened, so it always reflects the current database state.
  useEffect(() => {
    if (view === "list") fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, user]);

  // Loads the reply thread for the ticket currently being viewed.
  const fetchMessages = async (ticketId) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE}/messages.php?ticket_id=${ticketId}`);
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (view === "detail" && selectedTicket) fetchMessages(selectedTicket.id);
  }, [view, selectedTicket]);

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);
    try {
      const res = await fetch(`${API_BASE}/messages.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          sender_type: "customer",
          sender_name: user?.name || "Customer",
          message: replyText.trim(),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setReplyText("");
      await fetchMessages(selectedTicket.id);
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  const submitTicket = async () => {
    if (!user) {
      setSubmitError("Please log in before submitting a ticket.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API_BASE}/tickets.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: user.id,
          category: form.category,
          priority: form.priority,
          subject: form.subject,
          description: form.description,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to submit ticket");
      }
      const data = await res.json();
      const ticket = {
        ticket_number: data.ticket_number,
        subject: form.subject,
        category: form.category,
        priority: form.priority,
        status: data.status,
        created_at: new Date().toISOString(),
      };
      setLastTicket(ticket);
      setView("confirm");
    } catch (err) {
      console.error("Failed to submit ticket:", err);
      setSubmitError(
        err instanceof TypeError || err instanceof SyntaxError
          ? "Couldn't submit your ticket — the server may not be running. See the API setup notes, or try again shortly."
          : err.message || "Couldn't submit your ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    return isNaN(d) ? value : d.toLocaleDateString();
  };

  const wrap = (children) => (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "50px 24px 80px" }}>
      <button onClick={onBack} style={{ display: "flex", gap: 6, alignItems: "center", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontWeight: 600, fontSize: 14 }}>
        <ArrowLeftIcon size={16} /> Back to home
      </button>
      {children}
    </div>
  );

  if (view === "center") {
    return wrap(
      <>
        <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 10 }}>Support Center</h1>
        <p style={{ textAlign: "center", color: theme.gray, marginBottom: 30 }}>Submit a support request and our team will help you resolve your issue.</p>
        <DemoBanner />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          <div onClick={() => setView("create")} style={{ border: `1px solid ${theme.line}`, borderRadius: 12, padding: 28, cursor: "pointer" }}>
            <h3 style={{ fontSize: 17, marginBottom: 8 }}>Create New Ticket</h3>
            <p style={{ fontSize: 13, color: theme.gray, margin: 0 }}>Submit a new support request to our team.</p>
          </div>
          <div onClick={() => setView("list")} style={{ border: `1px solid ${theme.line}`, borderRadius: 12, padding: 28, cursor: "pointer" }}>
            <h3 style={{ fontSize: 17, marginBottom: 8 }}>My Support Tickets</h3>
            <p style={{ fontSize: 13, color: theme.gray, margin: 0 }}>View and track your existing requests.</p>
          </div>
        </div>
      </>
    );
  }

  if (view === "create") {
    if (!user) {
      return wrap(
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Log in to submit a ticket</h1>
          <p style={{ color: theme.gray, fontSize: 14, marginBottom: 20 }}>We link every ticket to your account so you can track its status here.</p>
          <button onClick={onGoToLogin} style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "12px 26px", fontWeight: 700, cursor: "pointer" }}>Log In / Sign Up</button>
        </div>
      );
    }
    return wrap(
      <>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>Create Support Ticket</h1>
        <DemoBanner />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input placeholder="Customer Name" value={form.name} onChange={handleChange("name")} style={{ padding: 10, border: `1px solid ${theme.line}`, borderRadius: 6 }} />
          <input placeholder="Email Address" value={form.email} onChange={handleChange("email")} style={{ padding: 10, border: `1px solid ${theme.line}`, borderRadius: 6 }} />
          <input placeholder="Phone Number" value={form.phone} onChange={handleChange("phone")} style={{ padding: 10, border: `1px solid ${theme.line}`, borderRadius: 6 }} />
          <input placeholder="Company / Organization (optional)" value={form.company} onChange={handleChange("company")} style={{ padding: 10, border: `1px solid ${theme.line}`, borderRadius: 6 }} />
          <select value={form.category} onChange={handleChange("category")} style={{ padding: 10, border: `1px solid ${theme.line}`, borderRadius: 6, color: form.category ? "#111" : theme.gray }}>
            <option value="">Issue Category</option>
            {TICKET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={form.priority} onChange={handleChange("priority")} style={{ padding: 10, border: `1px solid ${theme.line}`, borderRadius: 6 }}>
            {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{p} priority</option>)}
          </select>
        </div>
        <input placeholder="Subject" value={form.subject} onChange={handleChange("subject")} style={{ width: "100%", padding: 10, marginTop: 12, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box" }} />
        <textarea placeholder="Describe your issue in detail..." value={form.description} onChange={handleChange("description")} rows={6} style={{ width: "100%", padding: 10, marginTop: 12, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box", resize: "vertical" }} />
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13, color: theme.gray, display: "block", marginBottom: 6 }}>Attachments</label>
          <input type="file" disabled style={{ fontSize: 13 }} />
          <div style={{ fontSize: 11, color: theme.gray, marginTop: 4 }}>File upload requires a backend attachments endpoint — not built yet, so this stays disabled.</div>
        </div>
        {submitError && (
          <div style={{ marginTop: 14, background: "#FEECEC", border: "1px solid #F5A3A3", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#8A1F1F" }}>{submitError}</div>
        )}
        <button
          disabled={!form.name || !form.email || !form.subject || !form.description || !form.category || submitting}
          onClick={submitTicket}
          style={{ marginTop: 20, background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "13px 30px", fontWeight: 700, cursor: "pointer", opacity: !form.name || !form.email || !form.subject || !form.description || !form.category || submitting ? 0.5 : 1 }}
        >
          {submitting ? "Submitting..." : "Submit Support Ticket"}
        </button>
      </>
    );
  }

  if (view === "confirm" && lastTicket) {
    return wrap(
      <div style={{ textAlign: "center", maxWidth: 440, margin: "0 auto" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: theme.blue, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26 }}>✓</div>
        <h2 style={{ fontSize: 22 }}>Support Ticket Submitted</h2>
        <p style={{ color: theme.gray, fontSize: 14, marginBottom: 20 }}>Your support request has been successfully received.</p>
        <div style={{ border: `1px solid ${theme.line}`, borderRadius: 10, padding: 20, textAlign: "left", fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: theme.gray }}>Ticket Number</span><strong>{lastTicket.ticket_number}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: theme.gray }}>Date Submitted</span><strong>{formatDate(lastTicket.created_at)}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: theme.gray }}>Priority</span><strong>{lastTicket.priority}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: theme.gray }}>Status</span><StatusBadge status={lastTicket.status} /></div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
          <button onClick={() => setView("list")} style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>View My Tickets</button>
          <button onClick={() => setView("center")} style={{ background: "none", border: `1px solid ${theme.line}`, borderRadius: 6, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>Return to Support Center</button>
        </div>
      </div>
    );
  }

  if (view === "list") {
    if (!user) {
      return wrap(
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Log in to view your tickets</h1>
          <p style={{ color: theme.gray, fontSize: 14, marginBottom: 20 }}>Your ticket history is tied to your account.</p>
          <button onClick={onGoToLogin} style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "12px 26px", fontWeight: 700, cursor: "pointer" }}>Log In / Sign Up</button>
        </div>
      );
    }
    return wrap(
      <>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>My Support Tickets</h1>
        <p style={{ color: theme.gray, fontSize: 13, marginBottom: 20 }}>Live from the Technosoft database.</p>
        {loadingTickets ? (
          <p style={{ color: theme.gray, fontSize: 14 }}>Loading tickets...</p>
        ) : ticketsError ? (
          <div style={{ background: "#FEECEC", border: "1px solid #F5A3A3", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#8A1F1F" }}>{ticketsError}</div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: theme.gray }}>
            <p>No tickets yet.</p>
            <button onClick={() => setView("create")} style={{ marginTop: 10, background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, cursor: "pointer" }}>Create New Ticket</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tickets.map((t) => (
              <div key={t.id} onClick={() => { setSelectedTicket(t); setView("detail"); }} style={{ border: `1px solid ${theme.line}`, borderRadius: 10, padding: 16, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.subject}</div>
                  <div style={{ fontSize: 12, color: theme.gray }}>{t.ticket_number} · {t.category} · {t.priority} priority · Created {formatDate(t.created_at)}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  if (view === "detail" && selectedTicket) {
    return wrap(
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>{selectedTicket.subject}</h1>
            <div style={{ fontSize: 12, color: theme.gray }}>{selectedTicket.ticket_number} · {selectedTicket.category} · {selectedTicket.priority} priority · Created {formatDate(selectedTicket.created_at)}</div>
          </div>
          <StatusBadge status={selectedTicket.status} />
        </div>
        <div style={{ border: `1px solid ${theme.line}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Customer <span style={{ fontWeight: 400, color: theme.gray }}>· {formatDate(selectedTicket.created_at)}</span></div>
            <div style={{ fontSize: 14, color: "#333", background: theme.bg, borderRadius: 8, padding: 12, display: "inline-block", maxWidth: "90%" }}>{selectedTicket.description}</div>
          </div>

          {loadingMessages ? (
            <p style={{ fontSize: 13, color: theme.gray }}>Loading conversation...</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} style={{ marginBottom: 14, textAlign: m.sender_type === "staff" ? "right" : "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  {m.sender_type === "staff" ? "Technosoft Support" : (m.sender_name || "Customer")} <span style={{ fontWeight: 400, color: theme.gray }}>· {formatDate(m.created_at)}</span>
                </div>
                <div style={{
                  fontSize: 14, color: m.sender_type === "staff" ? "#fff" : "#333",
                  background: m.sender_type === "staff" ? theme.blue : theme.bg,
                  borderRadius: 8, padding: 12, display: "inline-block", maxWidth: "90%",
                }}>
                  {m.message}
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Type a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !sendingReply) sendReply(); }}
            style={{ flex: 1, padding: 10, border: `1px solid ${theme.line}`, borderRadius: 6 }}
          />
          <button
            onClick={sendReply}
            disabled={!replyText.trim() || sendingReply}
            style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 600, cursor: "pointer", opacity: !replyText.trim() || sendingReply ? 0.5 : 1 }}
          >
            {sendingReply ? "Sending..." : "Send Reply"}
          </button>
        </div>
      </>
    );
  }

  return null;
}

const AUTH_BG_PATH = "/images/auth-bg.jpg";

function AuthPage({ mode, onBack, onSwitchMode, onAuthSuccess }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const isValid = isLogin
    ? form.email.trim() && form.password
    : form.name.trim() && form.email.trim() && form.password && form.password === form.confirmPassword;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const endpoint = isLogin ? "login.php" : "register.php";
      const body = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // required so the session cookie from login.php is stored — the admin panel depends on this
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      onAuthSuccess(data);
    } catch (err) {
      console.error(`Failed to ${isLogin ? "log in" : "sign up"}:`, err);
      setError(err.message === "Failed to fetch"
        ? "Couldn't reach the server — confirm the backend is running (see the API setup notes)."
        : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end", fontFamily: FONT }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${AUTH_BG_PATH})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.25) 55%, rgba(10,10,10,0.55) 100%)" }} />

      <button
        onClick={onBack}
        style={{ position: "absolute", top: 24, left: 24, display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", zIndex: 2 }}
      >
        <ArrowLeftIcon size={15} /> Back to home
      </button>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: "relative", background: "#fff", borderRadius: 14, padding: "44px 40px", width: "100%", maxWidth: 420, margin: "40px 8vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
      >
        <img src={LOGO_PATH} alt="Technosoft logo" style={{ height: 40, marginBottom: 24 }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px", color: theme.black }}>{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p style={{ fontSize: 13, color: theme.gray, marginBottom: 26 }}>
          {isLogin ? "Log in to manage orders and support tickets." : "Sign up to track orders and support requests."}
        </p>

        {error && (
          <div style={{ background: "#FEECEC", border: "1px solid #F5A3A3", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#8A1F1F", marginBottom: 16 }}>{error}</div>
        )}

        {!isLogin && (
          <input placeholder="Full name" value={form.name} onChange={handleChange("name")} style={{ width: "100%", padding: 12, marginBottom: 10, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box", fontSize: 14 }} />
        )}
        <input placeholder="Email address" value={form.email} onChange={handleChange("email")} style={{ width: "100%", padding: 12, marginBottom: 10, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box", fontSize: 14 }} />
        <input type="password" placeholder="Password" value={form.password} onChange={handleChange("password")} onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }} style={{ width: "100%", padding: 12, marginBottom: 10, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box", fontSize: 14 }} />
        {!isLogin && (
          <input type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange("confirmPassword")} onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }} style={{ width: "100%", padding: 12, marginBottom: 10, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box", fontSize: 14 }} />
        )}

        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          style={{ width: "100%", marginTop: 12, background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: 13, fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: !isValid || submitting ? 0.5 : 1 }}
        >
          {submitting ? (isLogin ? "Logging in..." : "Signing up...") : (isLogin ? "Log In" : "Sign Up")}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: theme.gray, marginTop: 20 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => onSwitchMode(isLogin ? "signup" : "login")} style={{ background: "none", border: "none", color: theme.black, fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 13, textDecoration: "underline" }}>
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

function RequestServicePage({ onBack, initialService }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: initialService || "", message: "", payment: "Mobile Money" });
  const [sent, setSent] = useState(false);
  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (sent) {
    return (
      <div style={{ maxWidth: 500, margin: "100px auto", textAlign: "center", padding: "0 24px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: theme.blue, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26 }}>✓</div>
        <h2 style={{ fontSize: 22 }}>Request sent</h2>
        <p style={{ color: theme.gray, fontSize: 14 }}>A Technosoft representative will get back to you shortly.</p>
        <button onClick={onBack} style={{ marginTop: 20, background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, cursor: "pointer" }}>Back to home</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "50px 24px 80px" }}>
      <button onClick={onBack} style={{ display: "flex", gap: 6, alignItems: "center", background: "none", border: "none", cursor: "pointer", marginBottom: 30, fontWeight: 600, fontSize: 14 }}>
        <ArrowLeftIcon size={16} /> Back to home
      </button>

      <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 12, color: theme.black }}>Contact & Request a Service</h1>
      <p style={{ textAlign: "center", color: theme.gray, marginBottom: 44, fontSize: 15 }}>Reach out directly, or tell us what you need and we'll follow up.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 50 }}>
        {[
          { icon: "📍", label: "ADDRESS", lines: CONTACT.address },
          { icon: "📞", label: "CALL US", lines: [`Tell: ${CONTACT.tel}`, `Cell: ${CONTACT.cell}`] },
          { icon: "✉️", label: "EMAIL US", lines: CONTACT.emails },
          { icon: "🕐", label: "WORKING HOURS", lines: [CONTACT.hours] },
        ].map((card) => (
          <div key={card.label} style={{ background: theme.bg, borderRadius: 12, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>{card.label}</div>
            {card.lines.map((l) => <div key={l} style={{ fontSize: 13, color: theme.gray }}>{l}</div>)}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
        {/* Request form */}
        <div style={{ flex: 1.2, minWidth: 320 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>Request IT Services</h2>
          <input placeholder="Your Full Name" value={form.name} onChange={handleChange("name")} style={{ width: "100%", padding: 11, marginBottom: 10, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box" }} />
          <input placeholder="Your Email" value={form.email} onChange={handleChange("email")} style={{ width: "100%", padding: 11, marginBottom: 10, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box" }} />
          <input placeholder="Phone Number" value={form.phone} onChange={handleChange("phone")} style={{ width: "100%", padding: 11, marginBottom: 10, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box" }} />
          <select value={form.service} onChange={handleChange("service")} style={{ width: "100%", padding: 11, marginBottom: 10, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box", color: form.service ? "#111" : "#6B7280" }}>
            <option value="">Select a service (optional)</option>
            {services.map((s) => <option key={s.title} value={s.title}>{s.title}</option>)}
          </select>
          <textarea placeholder="Tell us what you need..." value={form.message} onChange={handleChange("message")} rows={5} style={{ width: "100%", padding: 11, marginBottom: 16, border: `1px solid ${theme.line}`, borderRadius: 6, boxSizing: "border-box", resize: "vertical" }} />

          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Preferred payment method</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            {["Mobile Money", "Card", "Bank Transfer"].map((m) => (
              <label key={m} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                <input type="radio" name="reqPayment" checked={form.payment === m} onChange={() => setForm({ ...form, payment: m })} /> {m}
              </label>
            ))}
          </div>

          <button
            disabled={!form.name || !form.email || !form.message}
            onClick={() => setSent(true)}
            style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "13px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: !form.name || !form.email || !form.message ? 0.5 : 1 }}
          >
            Send Request
          </button>
        </div>

        {/* Payment methods guidance */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ background: theme.bg, borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Payment Methods We Accept</h3>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Mobile Money</div>
              <p style={{ fontSize: 13, color: theme.gray, margin: 0, lineHeight: 1.5 }}>MTN Money or Airtel Money — fastest option for smaller purchases and one-off callout visits.</p>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Card</div>
              <p style={{ fontSize: 13, color: theme.gray, margin: 0, lineHeight: 1.5 }}>Best for online store purchases and quick, secure checkout.</p>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Bank Transfer</div>
              <p style={{ fontSize: 13, color: theme.gray, margin: 0, lineHeight: 1.5 }}>Recommended for larger service contracts and corporate invoicing — bank details sent after your request is confirmed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ABOUT_ITEMS = [
  {
    q: "We help companies in all sectors to focus",
    a: "We help companies in all sectors to focus on their core business, and afford them the operational flexibility so vital in today's frenetic business world. Strategic partnerships with global technology giants, coupled with a local understanding of the unique characteristics of every client, have been instrumental in our success in integrating varied and advanced products into comprehensive across-the-board solutions.",
  },
  {
    q: "Technosoft IT Solutions LTD focus",
    a: "Technosoft IT Solutions LTD focus is to provide long-term I.T. partnerships with our clients. Most of our client relationships have been for at least five years, many much longer. These long-term relationships allow us to understand our clients' unique needs and requirements and provide a high level of service.",
  },
  {
    q: "We believe we can",
    a: "We believe we can provide cost effective service & support allowing you to get the best from your I.T. investment. We can provide:",
    list: ["Access to an experienced and well-resourced specialist I.T. support and service team;", "Prompt telephone and remote services"],
  },
  {
    q: "Technosoft as a partner",
    a: "Proven and established track record. If you are interested in knowing more as to how Technosoft IT Solutions can help you better manage and utilize your IT systems we would be delighted to discuss this with you. We believe that your organization is ready to begin enjoying the many benefits of the services provided by Technosoft IT Solutions LTD. And hope that you will choose Technosoft as a partner in your process of business efficient enhancement.",
  },
];

function AboutAccordion() {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {ABOUT_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} style={{ background: "#fff", borderRadius: 10, border: `1px solid ${theme.line}`, overflow: "hidden" }}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 22px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700, color: isOpen ? theme.blueLight : theme.black }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${theme.gray}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>?</span>
                {item.q}
              </span>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ fontSize: 14, color: theme.gray }}>▾</motion.span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                  <div style={{ padding: "0 22px 20px 52px", color: "#7A5230", fontSize: 14, lineHeight: 1.7 }}>
                    <p style={{ margin: 0 }}>{item.a}</p>
                    {item.list && (
                      <ul style={{ marginTop: 10, paddingLeft: 18 }}>
                        {item.list.map((l) => <li key={l} style={{ marginBottom: 8 }}>✓ {l}</li>)}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default function TechnosoftHome({ onNavigate, initialRequestService, initialHomePage, onAdminLogin }) {
  const [page, setPage] = useState("home"); // home | request | service-detail
  const [user, setUser] = useState(() => getStoredUser());
  const [selectedService, setSelectedService] = useState("");
  const [viewingService, setViewingService] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [serviceSlideIndex, setServiceSlideIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % slideshowProducts.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setServiceSlideIndex((i) => (i + 1) % services.length), 5000);
    return () => clearInterval(t);
  }, []);

  const goTo = (i) => setSlideIndex(((i % slideshowProducts.length) + slideshowProducts.length) % slideshowProducts.length);
  const current = slideshowProducts[slideIndex];
  const goToService = (i) => setServiceSlideIndex(((i % services.length) + services.length) % services.length);
  const currentService = services[serviceSlideIndex];

  const goToRequest = (serviceName) => { setSelectedService(serviceName || ""); setPage("request"); window.scrollTo(0, 0); };

  useEffect(() => {
    if (initialRequestService) goToRequest(initialRequestService);
    else if (initialHomePage === "support") { setPage("support"); window.scrollTo(0, 0); }
    else if (initialHomePage === "login") { setPage("login"); window.scrollTo(0, 0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const goToAbout = () => {
    setPage("home");
    setTimeout(() => {
      const el = document.getElementById("about-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };
  const goToServices = () => {
    setPage("home");
    setTimeout(() => {
      const el = document.getElementById("services-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };
  const goToServiceDetail = (service) => { setViewingService(service); setPage("service-detail"); window.scrollTo(0, 0); };

  const handleAuthSuccess = (customer) => {
    setUser(customer);
    storeUser(customer);
    if (customer.role === "admin" && onAdminLogin) {
      onAdminLogin();
      return;
    }
    setPage("home");
    window.scrollTo(0, 0);
  };
  const handleLogout = () => {
    setUser(null);
    clearStoredUser();
    fetch(`${API_BASE}/logout.php`, { method: "POST", credentials: "include" }).catch(() => {});
  };

  if (page === "service-detail" && viewingService) {
    return (
      <div style={{ fontFamily: FONT, background: "#fff", color: theme.black, fontSize: 16, lineHeight: 1.5 }}>
        <header style={{ borderBottom: `1px solid ${theme.line}`, padding: "16px 24px" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <img src={LOGO_PATH} alt="Technosoft logo" style={{ height: 44, cursor: "pointer" }} onClick={() => setPage("home")} />
          </div>
        </header>

        {/* Hero with background image tuned to this service */}
        <section style={{ position: "relative", background: theme.blue, color: "#fff", padding: "80px 24px", overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${viewingService.heroImage})`,
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: 0.5,
          }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.9) 100%)` }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 100, background: `linear-gradient(180deg, transparent 0%, ${theme.black} 100%)` }} />
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <button onClick={() => setPage("home")} style={{ display: "flex", gap: 6, alignItems: "center", background: "none", border: "none", color: "#ccc", cursor: "pointer", marginBottom: 20, fontSize: 14 }}>
              <ArrowLeftIcon size={16} /> Back
            </button>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: theme.blue, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <viewingService.icon size={28} color="#fff" strokeWidth={1.75} />
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 14px" }}>{viewingService.title}</h1>
            <p style={{ color: "#B5B5B5", fontSize: 16 }}>{viewingService.blurb}</p>
          </div>
        </section>

        {/* Detail content */}
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "#333", marginBottom: 40 }}>{viewingService.detail}</p>
          <button
            onClick={() => goToRequest(viewingService.title)}
            style={{ background: theme.blue, color: "#fff", border: "none", borderRadius: 6, padding: "14px 30px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >
            Request This Service
          </button>
        </section>
      </div>
    );
  }

  if (page === "login" || page === "signup") {
    return <AuthPage mode={page} onBack={() => setPage("home")} onSwitchMode={setPage} onAuthSuccess={handleAuthSuccess} />;
  }

  if (page === "support") {
    return (
      <div style={{ fontFamily: FONT, background: "#fff", color: theme.black, fontSize: 16, lineHeight: 1.5 }}>
        <header style={{ borderBottom: `1px solid ${theme.line}`, padding: "16px 24px" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <img src={LOGO_PATH} alt="Technosoft logo" style={{ height: 44, cursor: "pointer" }} onClick={() => setPage("home")} />
          </div>
        </header>
        <SupportCenter onBack={() => setPage("home")} user={user} onGoToLogin={() => setPage("login")} />
      </div>
    );
  }

  if (page === "request") {
    return (
      <div style={{ fontFamily: FONT, background: "#fff", color: theme.black, fontSize: 16, lineHeight: 1.5 }}>
        <header style={{ borderBottom: `1px solid ${theme.line}`, padding: "16px 24px" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <img src={LOGO_PATH} alt="Technosoft logo" style={{ height: 44, cursor: "pointer" }} onClick={() => setPage("home")} />
          </div>
        </header>
        <RequestServicePage onBack={() => setPage("home")} initialService={selectedService} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT, background: "#fff", color: theme.black, fontSize: 16, lineHeight: 1.5 }}>
      <style>{`
        html { overflow-x: hidden; }
        img { max-width: 100%; }
        button, a { transition: filter 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease; }
        button:hover:not(:disabled), a:hover { filter: brightness(0.92); }
        button:active:not(:disabled) { transform: translateY(1px); }
        input:focus, textarea:focus, select:focus { outline: none; border-color: ${theme.blue} !important; box-shadow: 0 0 0 3px ${theme.blueLight}; }
        .tf-nav-links { display: flex; align-items: center; gap: 40px; }
        .tf-nav-link { position: relative; color: ${theme.charcoalLight}; font-weight: 600; font-size: 15px; text-decoration: none; letter-spacing: 0.15px; padding: 8px 4px 7px; border-bottom: 2px solid transparent; transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease; border-radius: 6px 6px 0 0; }
        .tf-nav-link:hover { color: ${theme.blue}; }
        .tf-nav-link.active { color: ${theme.blue}; font-weight: 700; border-bottom-color: ${theme.blue}; background: ${theme.blueLight}; padding-left: 12px; padding-right: 12px; }
        .tf-nav-actions { display: flex; align-items: center; gap: 12px; }
        .tf-login-btn { transition: filter 0.15s ease, box-shadow 0.15s ease; }
        .tf-hamburger { display: none; background: none; border: none; cursor: pointer; }
        .tf-topbar { flex-wrap: wrap; row-gap: 4px; }
        @media (max-width: 860px) {
          .tf-nav-links { display: none; }
          .tf-nav-actions .tf-login-btn { display: none; }
          .tf-hamburger { display: flex; align-items: center; }
        }
        @media (max-width: 640px) {
          h1 { font-size: 34px !important; }
          h2 { font-size: 24px !important; }
          .tf-slide-arrow-left { left: 4px !important; }
          .tf-slide-arrow-right { right: 4px !important; }
        }
        .tf-service-icon:hover { background: #3A3A3A !important; }
      `}</style>

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div style={{ background: "#fff", color: theme.gray, padding: "8px 24px", borderBottom: `1px solid ${theme.line}` }}>
        <div className="tf-topbar" style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "flex-end", gap: 28, fontSize: 13 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone size={14} color={theme.blue} /> +260 XXX XXX XXX</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={14} color={theme.blue} /> info@technosoft.co.zm</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("support"); window.scrollTo(0, 0); }} style={{ display: "flex", alignItems: "center", gap: 6, color: theme.blue, textDecoration: "none", fontWeight: 600, borderLeft: `1px solid ${theme.line}`, paddingLeft: 20 }}>
            <Ticket size={14} /> Support Ticket
          </a>
        </div>
      </div>


      {/* ── Navbar — logo attached inline, clearly visible ──────── */}
      <header style={{ borderBottom: `1px solid ${theme.line}`, position: "sticky", top: 0, background: "#fff", zIndex: 40 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={LOGO_PATH} alt="Technosoft logo" style={{ height: 72, width: "auto", display: "block" }} />
          </div>
          <nav className="tf-nav-links">
            {["Home", "Online Store", "Products and Services", "About Us", "Contact Us"].map((label, i) => (
              <a
                key={label}
                href="#"
                onClick={(e) => { e.preventDefault(); if (i === 1) onNavigate && onNavigate("store"); else if (i === 2) goToServices(); else if (i === 3) goToAbout(); else if (i === 4) goToRequest(); else onNavigate && onNavigate("home"); }}
                className={`tf-nav-link${i === 0 ? " active" : ""}`}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="tf-nav-actions" style={{ alignItems: "center" }}>
            {user ? (
              <>
                <span className="tf-login-btn" style={{ fontSize: 14, fontWeight: 600, color: theme.black }}>Hi, {user.name.split(" ")[0]}</span>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="tf-login-btn" style={{ border: `1px solid ${theme.blue}`, color: theme.blue, padding: "9px 20px", borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Log Out</a>
              </>
            ) : (
              <>
                <a href="#" onClick={(e) => { e.preventDefault(); setPage("signup"); }} className="tf-login-btn" style={{ border: `1px solid ${theme.blue}`, color: theme.blue, padding: "9px 20px", borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Sign Up</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setPage("login"); }} className="tf-login-btn" style={{ background: theme.blue, color: "#fff", padding: "10px 22px", borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Login</a>
              </>
            )}
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("store"); }} style={{ border: `1px solid ${theme.blue}`, padding: "9px 20px", borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: "none", color: theme.black, display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingBag size={16} /> Store
            </a>
            <button className="tf-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              {mobileMenuOpen ? <X size={24} color={theme.black} /> : <Menu size={24} color={theme.black} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden", borderTop: `1px solid ${theme.line}` }}
            >
              <div style={{ display: "flex", flexDirection: "column", padding: "10px 24px 20px" }}>
                {["Home", "Online Store", "Products and Services", "About Us", "Contact Us"].map((label, i) => (
                  <a
                    key={label}
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (i === 1) onNavigate && onNavigate("store"); else if (i === 2) goToServices(); else if (i === 3) goToAbout(); else if (i === 4) goToRequest(); else onNavigate && onNavigate("home"); setMobileMenuOpen(false); }}
                    style={{ color: theme.black, fontWeight: 500, fontSize: 16, textDecoration: "none", padding: "12px 0", borderBottom: `1px solid ${theme.line}` }}
                  >
                    {label}
                  </a>
                ))}
                {user ? (
                  <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); setMobileMenuOpen(false); }} style={{ marginTop: 16, border: `1px solid ${theme.blue}`, color: theme.blue, padding: "12px 0", borderRadius: 6, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>Log Out ({user.name.split(" ")[0]})</a>
                ) : (
                  <>
                    <a href="#" onClick={(e) => { e.preventDefault(); setPage("signup"); setMobileMenuOpen(false); }} style={{ marginTop: 16, border: `1px solid ${theme.blue}`, color: theme.blue, padding: "12px 0", borderRadius: 6, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>Sign Up</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setPage("login"); setMobileMenuOpen(false); }} style={{ marginTop: 10, background: theme.blue, color: "#fff", padding: "12px 0", borderRadius: 6, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>Login</a>
                  </>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero — sophisticated split composition: copy left, abstract tech visual right, organic shapes throughout ── */}
      <style>{`
        .tf-hero { position: relative; min-height: 82vh; display: flex; align-items: center; overflow: hidden; }
        .tf-hero-grid { max-width: 1240px; margin: 0 auto; padding: 124px 24px 92px; position: relative; z-index: 2; display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; align-items: center; }
        .tf-hero-copy { text-align: left; }
        .tf-hero-badges { display: flex; flex-wrap: wrap; gap: 32px; justify-content: flex-start; }
        .tf-hero-cta { display: flex; gap: 16px; flex-wrap: wrap; justify-content: flex-start; }
        .tf-hero-visual { position: relative; height: 440px; display: flex; align-items: center; justify-content: center; }
        @keyframes tf-float-a { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(0,-14px); } }
        @keyframes tf-float-b { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(0,12px); } }
        @keyframes tf-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes tf-orb-drift { 0%, 100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-6px,-8px) rotate(1deg); } }
        .tf-node-a { animation: tf-float-a 7s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .tf-node-b { animation: tf-float-b 8.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .tf-node-glow { animation: tf-pulse 3.2s ease-in-out infinite; }
        .tf-orb-rings { animation: tf-orb-drift 12s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @media (max-width: 980px) {
          .tf-hero-grid { grid-template-columns: 1fr; padding: 104px 24px 60px; gap: 36px; text-align: center; }
          .tf-hero-copy { text-align: center; }
          .tf-hero-copy h1 { margin-left: auto; margin-right: auto; }
          .tf-hero-copy p { margin-left: auto; margin-right: auto; }
          .tf-hero-badges { justify-content: center; }
          .tf-hero-cta { justify-content: center; }
          .tf-hero-visual { height: 300px; order: -1; }
        }
        @media (max-width: 640px) { .tf-hero-decor { display: none; } .tf-hero-grid { padding: 92px 20px 52px; } .tf-hero-visual { height: 220px; } }
      `}</style>
      <section className="tf-hero" style={{ background: "#fff", color: theme.black }}>
        {/* Large soft organic shape anchoring the right side — custom asymmetric geometry, not a rectangle */}
        <div className="tf-hero-decor" aria-hidden="true" style={{
          position: "absolute", top: "-10%", right: "-10%", width: "60%", height: "118%",
          background: `linear-gradient(135deg, ${theme.blueLight} 0%, #EEF8FC 55%, #FFFFFF 100%)`,
          borderRadius: "42% 58% 65% 35% / 45% 40% 60% 55%",
          zIndex: 0, opacity: 0.95,
        }} />
        <div className="tf-hero-decor" aria-hidden="true" style={{
          position: "absolute", top: "16%", right: "2%", width: "38%", height: "62%",
          background: "linear-gradient(135deg, rgba(3,126,194,0.10) 0%, rgba(3,126,194,0) 70%)",
          borderRadius: "60% 40% 55% 45% / 55% 60% 40% 45%",
          zIndex: 0,
        }} />

        {/* Minimal dot texture on the copy side */}
        <svg className="tf-hero-decor" width="120" height="120" style={{ position: "absolute", top: 88, left: 30, opacity: 0.6, zIndex: 0 }}>
          <pattern id="tf-dot-grid-a" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.7" fill="#B7DCF0" />
          </pattern>
          <rect width="120" height="120" fill="url(#tf-dot-grid-a)" />
        </svg>

        {/* Layered, asymmetric curved transition into the next section */}
        <svg viewBox="0 0 1500 140" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: -1, width: "100%", height: 128, display: "block", zIndex: 1 }}>
          <path d="M0,140 L0,74 C 280,32 640,102 1000,58 C 1220,32 1380,64 1500,44 L1500,140 Z" fill={theme.blue} opacity="0.16" />
          <path d="M0,140 L0,86 C 320,42 660,116 1020,68 C 1230,40 1370,74 1500,54 L1500,140 Z" fill={theme.blueLight} opacity="0.85" />
          <path d="M0,140 L0,76 C 380,132 940,20 1500,84 L1500,140 Z" fill={theme.bg} />
        </svg>

        <div className="tf-hero-grid">
          <motion.div className="tf-hero-copy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${theme.line}`, borderRadius: 20, padding: "6px 18px", fontSize: 13, marginBottom: 22, color: theme.gray, background: "#fff" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: theme.blue, display: "inline-block" }} />
              Enterprise IT — Zambia
            </div>
            <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.5px", margin: "0 0 22px", maxWidth: 540 }}>
              <span style={{ color: "#C9722B" }}>Technology That Moves Your</span>{" "}
              <span style={{ color: "#0EA5E0" }}>Business Forward.</span>
            </h1>
            <p style={{ color: "#3A3A3A", fontSize: 18, lineHeight: 1.6, marginBottom: 30, maxWidth: 500 }}>
              Secure, innovative and reliable technology solutions designed to help businesses operate smarter, connect better and grow with confidence.
            </p>

            <div className="tf-hero-badges" style={{ marginBottom: 34 }}>
              {[
                { icon: Shield, label: "Secure", sub: "Your Data" },
                { icon: Cloud, label: "Cloud", sub: "Solutions" },
                { icon: Network, label: "Smart", sub: "Infrastructure" },
                { icon: TrendingUp, label: "Business", sub: "Growth" },
              ].map((f) => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", border: `1px solid ${theme.blueLight}`, boxShadow: "0 3px 10px rgba(3,126,194,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <f.icon size={17} color={theme.blue} strokeWidth={2} />
                  </div>
                  <div style={{ lineHeight: 1.3, textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: theme.black }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: theme.gray }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="tf-hero-cta">
              <motion.a whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }} href="#"
                onClick={(e) => { e.preventDefault(); goToServices(); }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: theme.blue, color: "#fff", padding: "17px 34px", borderRadius: 8, fontWeight: 700, fontSize: 16, letterSpacing: 0.2, textDecoration: "none", minWidth: 208, boxShadow: "0 8px 20px rgba(3,126,194,0.22)" }}>
                Explore Our Services <ArrowRight size={18} />
              </motion.a>
              <motion.a whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }} href="#"
                onClick={(e) => { e.preventDefault(); goToRequest(); }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${theme.blue}`, background: "#fff", color: theme.blue, padding: "17px 34px", borderRadius: 8, fontWeight: 700, fontSize: 16, letterSpacing: 0.2, textDecoration: "none", minWidth: 208 }}>
                Request IT Service
              </motion.a>
            </div>
          </motion.div>

          {/* Abstract technology visual — network of nodes around a core, no literal hardware imagery */}
          <motion.div className="tf-hero-visual" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }}>
            <svg viewBox="0 0 420 420" width="100%" height="100%" style={{ maxWidth: 440, display: "block", position: "relative", zIndex: 2 }}>
              <defs>
                <radialGradient id="tf-orb-glow" cx="50%" cy="45%" r="60%">
                  <stop offset="0%" stopColor="#EAF6FC" />
                  <stop offset="100%" stopColor="#EAF6FC" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="tf-node-line" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={theme.blue} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={theme.blue} stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <circle cx="210" cy="200" r="175" fill="url(#tf-orb-glow)" />
              <g className="tf-orb-rings">
                <circle cx="210" cy="200" r="128" fill="none" stroke={theme.blueLight} strokeWidth="1.5" opacity="0.9" />
                <circle cx="210" cy="200" r="96" fill="none" stroke={theme.blueLight} strokeWidth="1.5" opacity="0.65" />
              </g>
              <line x1="210" y1="200" x2="120" y2="118" stroke="url(#tf-node-line)" strokeWidth="1.5" />
              <line x1="210" y1="200" x2="322" y2="140" stroke="url(#tf-node-line)" strokeWidth="1.5" />
              <line x1="210" y1="200" x2="300" y2="302" stroke="url(#tf-node-line)" strokeWidth="1.5" />
              <line x1="210" y1="200" x2="108" y2="290" stroke="url(#tf-node-line)" strokeWidth="1.5" />
              <line x1="210" y1="200" x2="210" y2="66" stroke="url(#tf-node-line)" strokeWidth="1.5" />
              <circle cx="210" cy="200" r="30" fill="none" stroke={theme.blue} strokeWidth="1.5" opacity="0.35" />
              <circle cx="210" cy="200" r="19" fill={theme.blue} />
              <g className="tf-node-a">
                <circle cx="120" cy="118" r="9" fill="#fff" stroke={theme.blue} strokeWidth="2" />
                <circle className="tf-node-glow" cx="120" cy="118" r="3" fill={theme.blue} />
              </g>
              <g className="tf-node-b">
                <circle cx="322" cy="140" r="7" fill="#fff" stroke="#C9722B" strokeWidth="2" />
                <circle className="tf-node-glow" cx="322" cy="140" r="2.5" fill="#C9722B" />
              </g>
              <g className="tf-node-a">
                <circle cx="300" cy="302" r="8" fill="#fff" stroke={theme.blue} strokeWidth="2" />
                <circle className="tf-node-glow" cx="300" cy="302" r="3" fill={theme.blue} />
              </g>
              <g className="tf-node-b">
                <circle cx="108" cy="290" r="6" fill="#fff" stroke={theme.blue} strokeWidth="2" />
                <circle className="tf-node-glow" cx="108" cy="290" r="2.5" fill={theme.blue} />
              </g>
              <g className="tf-node-a">
                <circle cx="210" cy="66" r="6" fill="#fff" stroke={theme.blue} strokeWidth="2" />
                <circle className="tf-node-glow" cx="210" cy="66" r="2.5" fill={theme.blue} />
              </g>
            </svg>
          </motion.div>
        </div>
      </section>

      {/* ── Trusted By marquee (separate from the Partners section further down) ── */}
      <section style={{ padding: "50px 0", background: theme.bg, borderBottom: `1px solid ${theme.line}`, overflow: "hidden" }}>
        <div style={{ textAlign: "center", fontSize: 12, color: theme.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Trusted by Forward-Thinking Organizations
        </div>
        <p style={{ textAlign: "center", color: theme.gray, fontSize: 14, marginBottom: 24, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
          Building lasting partnerships through technology, innovation and reliable digital solutions.
        </p>
        <style>{`
          @keyframes tf-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .tf-marquee-mask {
            -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
            mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
          }
          .tf-marquee-track { display: flex; width: max-content; animation: tf-marquee 34s linear infinite; }
          .tf-marquee-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="tf-marquee-mask">
          <div className="tf-marquee-track">
            {[...MARQUEE_LOGOS, ...MARQUEE_LOGOS].map((p, i) => (
              <div key={p.name + i} style={{ flexShrink: 0, padding: "0 46px", display: "flex", alignItems: "center" }}>
                <img src={p.logo} alt={p.name} style={{ height: 42, width: "auto", maxWidth: 170, objectFit: "contain", opacity: 0.85 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product slideshow (5 products) ──────────────────── */}
      <FadeInSection>
        <section style={{ padding: "80px 24px", background: theme.bg }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 12 }}>Featured Products</h2>
            <p style={{ textAlign: "center", color: theme.gray, marginBottom: 40, fontSize: 16 }}>A closer look at what we supply</p>

            <div style={{ background: "#fff", border: `1px solid ${theme.line}`, borderRadius: 18, padding: 40, display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap", position: "relative" }}>
              <button className="tf-slide-arrow tf-slide-arrow-left" onClick={() => goTo(slideIndex - 1)} aria-label="Previous"
                style={{ position: "absolute", left: -18, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: theme.blue, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <ArrowLeftIcon size={18} />
              </button>
              <button className="tf-slide-arrow tf-slide-arrow-right" onClick={() => goTo(slideIndex + 1)} aria-label="Next"
                style={{ position: "absolute", right: -18, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: theme.blue, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <ArrowRight size={18} />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.45 }}
                  onClick={() => onNavigate && onNavigate("store", current.id)}
                  style={{ display: "flex", gap: 40, alignItems: "center", cursor: "pointer", width: "100%", flexWrap: "wrap" }}
                >
                  <img src={current.image} alt={current.name} style={{ width: 260, height: 220, objectFit: "cover", borderRadius: 14, flexShrink: 0, background: theme.bg }} />
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ fontSize: 13, color: theme.gray, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{current.category}</div>
                    <h3 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 12px" }}>{current.name}</h3>
                    <StarRating rating={current.rating} />
                    <p style={{ color: theme.gray, fontSize: 15, lineHeight: 1.6, margin: "12px 0 16px" }}>{current.description}</p>
                    <div style={{ fontSize: 26, fontWeight: 700 }}>{formatK(current.price)}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {slideshowProducts.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`}
                  style={{ width: i === slideIndex ? 22 : 8, height: 8, borderRadius: 4, background: i === slideIndex ? theme.blue : "#D1D5DB", border: "none", cursor: "pointer", transition: "width 0.2s" }} />
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ── Services Slideshow ───────────────────────────────── */}
      <FadeInSection>
        <section style={{ background: theme.bg, color: theme.black, padding: "70px 24px", position: "relative", overflow: "hidden" }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", top: "-20%", left: "-8%", width: "40%", height: "60%", opacity: 0.5 }}>
            <path d="M20,0 C60,-5 100,20 95,55 C90,90 55,100 25,90 C-5,80 -10,40 0,20 C5,10 10,5 20,0 Z" fill={theme.blueLight} />
          </svg>
          <div style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 36, color: theme.black }}>What We Offer</h2>
            <div style={{ background: "#fff", borderRadius: 32, padding: 44, position: "relative", boxShadow: "0 20px 50px rgba(3,126,194,0.14)" }}>
              <button className="tf-slide-arrow tf-slide-arrow-left" onClick={() => goToService(serviceSlideIndex - 1)} aria-label="Previous service"
                style={{ position: "absolute", left: -18, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: theme.blue, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <ArrowLeftIcon size={18} />
              </button>
              <button className="tf-slide-arrow tf-slide-arrow-right" onClick={() => goToService(serviceSlideIndex + 1)} aria-label="Next service"
                style={{ position: "absolute", right: -18, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: theme.blue, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <ArrowRight size={18} />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentService.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.45 }}
                  onClick={() => goToRequest(currentService.title)}
                  style={{ textAlign: "center", cursor: "pointer" }}
                >
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: theme.blueLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <currentService.icon size={30} color={theme.blue} strokeWidth={1.75} />
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px", color: theme.black }}>{currentService.title}</h3>
                  <p style={{ color: theme.gray, fontSize: 15, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>{currentService.blurb}</p>
                </motion.div>
              </AnimatePresence>

              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 30 }}>
                {services.map((_, i) => (
                  <button key={i} onClick={() => goToService(i)} aria-label={`Go to service ${i + 1}`}
                    style={{ width: i === serviceSlideIndex ? 22 : 8, height: 8, borderRadius: 4, background: i === serviceSlideIndex ? theme.blue : theme.line, border: "none", cursor: "pointer", transition: "width 0.2s" }} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ── Services ─────────────────────────────────────────── */}
      <FadeInSection>
        <section id="services-section" style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 12 }}>Our Services</h2>
            <p style={{ textAlign: "center", color: theme.gray, marginBottom: 44, fontSize: 16 }}>Everything your business needs from a single IT partner</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 26 }}>
              {services.map((service) => (
                <motion.div key={service.title} whileHover={{ y: -6 }}
                  style={{ border: `1px solid ${theme.line}`, borderRadius: 14, padding: 30 }}>
                  <div className="tf-service-icon" style={{ width: 54, height: 54, borderRadius: 12, background: theme.blue, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, transition: "background 0.2s" }}>
                    <service.icon size={26} color="#fff" strokeWidth={1.75} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{service.title}</h3>
                  <p style={{ fontSize: 14, color: theme.gray, lineHeight: 1.6, margin: "0 0 16px" }}>{service.blurb}</p>
                  <button
                    onClick={() => goToServiceDetail(service)}
                    style={{ background: "none", border: `1px solid ${theme.blue}`, color: theme.blue, borderRadius: 6, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Read More
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ── Why Businesses Choose Technosoft ─────────────────── */}
      <FadeInSection>
        <section style={{ background: theme.blue, padding: "90px 24px 110px", position: "relative", overflow: "hidden" }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", bottom: "-25%", left: "-6%", width: "36%", height: "55%", opacity: 0.12 }}>
            <path d="M20,0 C60,-5 100,20 95,55 C90,90 55,100 25,90 C-5,80 -10,40 0,20 C5,10 10,5 20,0 Z" fill="#fff" />
          </svg>
          <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative" }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 56, color: "#fff" }}>Why Businesses Choose Technosoft</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 28 }}>
              {[
                { n: "01", title: "Innovation", body: "Modern technology solutions designed around the way your business operates." },
                { n: "02", title: "Reliability", body: "Dependable infrastructure, software and technical support that keeps your business running." },
                { n: "03", title: "Security", body: "Protect your systems, data and digital operations from evolving threats." },
                { n: "04", title: "Local Expertise", body: "Technology solutions designed with the needs of Zambian businesses in mind." },
              ].map((c, idx) => (
                <motion.div
                  key={c.n}
                  whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.20)" }}
                  className="tf-why-card"
                  style={{
                    borderRadius: "28px 28px 28px 8px",
                    padding: 32,
                    background: "#fff",
                    boxShadow: "0 10px 26px rgba(0,0,0,0.14)",
                    position: "relative",
                    marginTop: idx % 2 === 1 ? 28 : 0,
                  }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: "16px 16px 16px 4px", background: theme.blueLight, color: theme.blue, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>{c.n}</div>
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: theme.black, margin: "0 0 10px" }}>{c.title}</h3>
                  <p style={{ fontSize: 14, color: theme.gray, lineHeight: 1.6, margin: 0 }}>{c.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <style>{`@media (max-width: 700px) { .tf-why-card { margin-top: 0 !important; } }`}</style>
        </section>
      </FadeInSection>


      {/* ── Verified credibility strip — only facts already stated elsewhere on this site ── */}
      <FadeInSection>
        <section style={{ padding: "44px 24px", borderBottom: `1px solid ${theme.line}` }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", textAlign: "center" }}>
            {[
              { label: "Founded", value: "2005" },
              { label: "Core Service Lines", value: "6" },
              { label: "Based In", value: "Lusaka, Zambia" },
              { label: "Technology Partners", value: "Cisco, Microsoft, IBM, HP, Sophos" },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{f.value}</div>
                <div style={{ fontSize: 12, color: theme.gray, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>{f.label}</div>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* ── What Are You Trying to Solve? ─────────────────────── */}
      <FadeInSection>
        <section style={{ padding: "80px 24px", background: theme.bg }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 12 }}>What Are You Trying to Solve?</h2>
            <p style={{ textAlign: "center", color: theme.gray, marginBottom: 40, fontSize: 16, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
              Tell us what your business needs and we'll help you find the right technology solution.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
              {[
                { label: "Secure My Business", service: "CCTV & Security" },
                { label: "Build My Website or Software", service: "Web Development" },
                { label: "Improve My Network", service: "Networking" },
                { label: "Move to the Cloud", service: "IT Support" },
                { label: "Get IT Support", service: "IT Support" },
                { label: "Upgrade My Technology", service: "Computer Repairs" },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  whileHover={{ y: -4, borderColor: theme.blue }}
                  onClick={() => goToRequest(item.service)}
                  style={{
                    textAlign: "left", background: "#fff", border: `1px solid ${theme.line}`, borderRadius: 12,
                    padding: "22px 24px", cursor: "pointer", fontSize: 15, fontWeight: 600, color: theme.black,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  {item.label}
                  <ArrowRight size={16} />
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ── Partners ─────────────────────────────────────────── */}
      <FadeInSection>
        <section style={{ padding: "60px 24px", background: theme.bg, borderTop: `1px solid ${theme.line}`, borderBottom: `1px solid ${theme.line}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: theme.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 30 }}>Our Partners</div>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 36 }}>
              {PARTNERS.map((p) => (
                <div key={p.name} style={{ padding: "18px 30px", border: `1px solid ${theme.line}`, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={p.logo} alt={p.name} style={{ height: 32, width: "auto", maxWidth: 140, objectFit: "contain", display: "block" }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ── Closing CTA ───────────────────────────────────────── */}
      <section style={{ background: theme.blue, color: "#fff", padding: "70px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 14 }}>Ready to Build Smarter?</h2>
        <p style={{ color: "#B5B5B5", marginBottom: 30, fontSize: 16 }}>Let's turn your technology challenges into opportunities.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <motion.a whileHover={{ scale: 1.04 }} href="#" onClick={(e) => { e.preventDefault(); goToRequest(); }}
            style={{ background: "#fff", color: theme.black, padding: "15px 32px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Talk to an Expert <ArrowRight size={16} />
          </motion.a>
          <motion.a whileHover={{ scale: 1.04 }} href="#"
            onClick={(e) => { e.preventDefault(); goToRequest(); }}
            style={{ border: "1px solid #fff", color: "#fff", padding: "15px 32px", borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Request IT Service
          </motion.a>
        </div>
      </section>

      {/* ── About Us ─────────────────────────────────────────── */}
      <FadeInSection>
        <section id="about-section" style={{ padding: "80px 24px", background: theme.bg }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: "center", marginBottom: 16, color: theme.black }}>About Us</h2>
            <p style={{ textAlign: "center", color: theme.gray, fontSize: 15, lineHeight: 1.7, marginBottom: 36, maxWidth: 700, marginLeft: "auto", marginRight: "auto" }}>
              Founded in 2005, Technosoft has, over the years, become one of Zambia's leading IT companies. We plan, develop, deploy and deliver comprehensive and advanced business and technological solutions in the areas of software, infrastructure, hardware and business operations.
            </p>
            <AboutAccordion />
          </div>
        </section>
      </FadeInSection>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{ background: "#0A1F2E", color: "#8FA9BA", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "6px 14px", borderRadius: 8, display: "inline-flex" }}>
            <img src={LOGO_PATH} alt="Technosoft logo" style={{ height: 34, display: "block" }} />
          </div>
          <div style={{ fontSize: 13 }}>&copy; {new Date().getFullYear()} Technosoft. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
