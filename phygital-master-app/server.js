// Phygital showcase — kiosk server
// Serves the screen (public/) and the project list from Postgres.
//   npm install && npm start   →   http://localhost:4173
//
// Database connection (see .env.example):
//   • Hosted Postgres (Neon / Supabase / Render / Railway …):
//       set DATABASE_URL=postgres://user:pass@host/db   (SSL is enabled automatically)
//   • Local Postgres: leave DATABASE_URL unset; uses PGHOST/PGUSER/... (db "phygital").

const path = require("path");
const fs = require("fs");
const express = require("express");
const { Pool } = require("pg");

const PORT = process.env.PORT || 4173;

// SSL on for managed hosts; OFF for a plain self-hosted VPS Postgres.
// Default: enabled, unless DB_SSL=false or the URL has sslmode=disable.
const URL_SSL =
  process.env.DB_SSL !== "false" &&
  !/sslmode=disable/i.test(process.env.DATABASE_URL || "");

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: URL_SSL ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.PGHOST || "localhost",
        port: process.env.PGPORT || 5432,
        user: process.env.PGUSER || process.env.USER,
        password: process.env.PGPASSWORD || undefined,
        database: process.env.PGDATABASE || "phygital",
      }
);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Live project list for the kiosk screen.
app.get("/api/projects", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT slug, name, description, category, sub, logo, live_url, deploy_repo, source_repo, accent, sort_order
         FROM projects ORDER BY sort_order, name`
    );
    // A project is viewable in the in-kiosk iframe if a local copy of its
    // build exists at public/apps/<slug>/index.html (preferred — works offline,
    // same-origin). Otherwise the client falls back to live_url.
    const withApp = rows.map((r) => ({
      ...r,
      app_url: fs.existsSync(
        path.join(__dirname, "public", "apps", r.slug, "index.html")
      )
        ? `/apps/${r.slug}/`
        : null,
    }));
    res.json(withApp);
  } catch (err) {
    console.error("DB error:", err.message);
    res.status(503).json({ error: "database unavailable" });
  }
});

// Upsert a project (used by /phygital-deploy; also handy for manual edits).
app.post("/api/projects", async (req, res) => {
  const { slug, name, description, category, sub, logo,
          live_url, deploy_repo, source_repo, accent, sort_order } = req.body || {};
  if (!slug || !name || !logo) {
    return res.status(400).json({ error: "slug, name and logo are required" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO projects (slug, name, description, category, sub, logo, live_url, deploy_repo, source_repo, accent, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,'#fe347e'),COALESCE($11,100))
       ON CONFLICT (slug) DO UPDATE SET
         name=EXCLUDED.name, description=EXCLUDED.description, category=EXCLUDED.category,
         sub=EXCLUDED.sub, logo=EXCLUDED.logo,
         live_url=EXCLUDED.live_url, deploy_repo=EXCLUDED.deploy_repo,
         source_repo=EXCLUDED.source_repo, accent=EXCLUDED.accent,
         sort_order=EXCLUDED.sort_order
       RETURNING *`,
      [slug, name, description, category, sub, logo, live_url, deploy_repo, source_repo, accent, sort_order]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("DB error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Phygital kiosk → http://localhost:${PORT}`);
});
