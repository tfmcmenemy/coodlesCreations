const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Tell express-ejs-layouts what our default layout file is
app.set("layout", "layout"); // looks for views/layout.ejs

// Middleware
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "public")));

//Database setup
require("dotenv").config();

const pgp = require("pg-promise")({
  // Optional: query(e) { console.log("QUERY:", e.query); }
});

const db = pgp({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  // user: process.env.PGUSER,
  // password: process.env.PGPASSWORD,
  // ssl: { rejectUnauthorized: false } // only if you need SSL (usually not for local)
});
//Database connection test
db.one("SELECT 1 AS ok")
  .then(() => console.log("✅ Postgres connected"))
  .catch((err) => console.error("❌ Postgres connection failed:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.render("home", {
    activePage: "home",
    pageTitle: "Coodles Creations | Match Your Pup",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    activePage: "about",
    pageTitle: "About Us | Coodles Creations",
  });
});

app.get("/shop", (req, res) => {
  res.render("shop", {
    activePage: "shop",
    pageTitle: "Shop | Coodles Creations",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    activePage: "contact",
    pageTitle: "Contact Us | Coodles Creations",
  });
});

app.get("/sizing", (req, res) => {
  res.render("sizing", {
    activePage: "sizing",
    pageTitle: "Sizing Guide | Coodles Creations",
  });
});

app.get("/gallery", (req, res) => {
  res.render("gallery", {
    activePage: "gallery",
    pageTitle: "Gallery | Coodles Creations",
  });
});

////////////////////////////////////////////////////////////////////////
//POST ROUTES
////////////////////////////////////////////////////////////////////////
app.post("/mailing_list", async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const emailRaw = (req.body.email || "").trim();
    if (!emailRaw) {
      return res
        .status(400)
        .json({ ok: false, type: "validation", message: "Email is required." });
    }

    const email = emailRaw.toLowerCase();
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!looksLikeEmail) {
      return res.status(400).json({
        ok: false,
        type: "validation",
        message: "Please enter a valid email address.",
      });
    }

    // Check for existing email
    const existing = await db.oneOrNone(
      `SELECT id FROM mailing_list WHERE email = $1`,
      [email]
    );

    if (existing) {
      return res.status(200).json({
        ok: true,
        type: "exists",
        message:
          "Thank you so much for supporting our business, but it looks like you are already on our mailing list. You will continue to receive event notifications, sales, and new products!",
      });
    }

    // Insert new
    await db.none(
      `INSERT INTO mailing_list (name, email, date_added)
       VALUES ($1, $2, NOW() AT TIME ZONE 'America/New_York')`,
      [name === "" ? null : name, email]
    );

    return res.status(201).json({
      ok: true,
      type: "success",
      message: "Thank you for joining Coodles Creations Mailing List!",
    });
  } catch (err) {
    console.error("Mailing list insert error:", err);
    return res.status(500).json({
      ok: false,
      type: "server",
      message:
        "Something went wrong on our side. Please try again in a moment.",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Coodles Creations site running on http://localhost:${PORT}`);
});
