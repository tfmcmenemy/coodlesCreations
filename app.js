const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const { log } = require("console");

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

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env (local) or your host env vars (prod)."
  );
}

// Neon requires SSL. This is the typical Node/Postgres approach for hosted PG.
const db = pgp({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// optional connection test
db.one("SELECT 1 AS ok")
  .then(() => console.log("✅ Neon Postgres connected"))
  .catch((err) => console.error("❌ Neon connection failed:", err));

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
app.get("/admin", async (req, res, next) => {
  try {
    const mailingList = await db.any(
      `SELECT id,
              name,
              email,
              date_added,
              "from"
       FROM mailing_list
       ORDER BY date_added DESC
       LIMIT 50`
    );

    // optional: add a pretty date string for display
    mailingList.forEach((row) => {
      if (row.date_added) {
        row.displayDate = new Date(row.date_added).toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
      } else {
        row.displayDate = null;
      }
    });

    res.render("admin", {
      activePage: "admin",
      mailingList,
      pageTitle: "Admin | Coodles Creations",
    });
  } catch (err) {
    console.error("Error loading admin page:", err);
    next(err);
  }
});

app.get("/gallery", (req, res) => {
  res.render("gallery", {
    activePage: "gallery",
    pageTitle: "Gallery | Coodles Creations",
  });
});
app.get("/admin-login", (req, res) => {
  res.render("loginAdmin", {
    activePage: "admin-login",
    pageTitle: "Admin Login | Coodles Creations",
  });
});
app.get("/join", (req, res) => {
  const event = req.query.event || null; // e.g. ?event=Haymarket%20Market

  res.render("join_mailing_list", {
    activePage: "join_mailing_list",
    pageTitle: "Join Mailing List | Coodles Creations",
    event, // passed into EJS
  });
});

////////////////////////////////////////////////////////////////////////
//POST ROUTES
////////////////////////////////////////////////////////////////////////
app.post("/mailing_list", async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const emailRaw = (req.body.email || "").trim();
    const event = (req.body.event || "Online").trim();
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
      `INSERT INTO mailing_list (name, email, date_added, "from")
       VALUES ($1, $2, NOW() AT TIME ZONE 'America/New_York', $3)`,
      [name === "" ? null : name, email, event]
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
const server = app.listen(PORT, () => {
  console.log(`Coodles Creations site running on http://localhost:${PORT}`);
});
