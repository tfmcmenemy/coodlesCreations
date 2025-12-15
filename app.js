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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Coodles Creations site running on http://localhost:${PORT}`);
});
