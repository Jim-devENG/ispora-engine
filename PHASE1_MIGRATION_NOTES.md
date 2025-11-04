# Phase 1 Migration Notes: Knex.js → Mongoose

**Important:** This Phase 1 implementation uses **Mongoose** as requested, but the current backend uses **Knex.js** with SQLite/PostgreSQL.

**Architecture Decision:**
- Current backend: Knex.js + SQLite (dev) / PostgreSQL (production)
- Phase 1 implementation: Mongoose + MongoDB (as requested)

**Options:**
1. Run both systems in parallel (Mongoose for Phase 1 features, Knex for existing)
2. Migrate entirely to Mongoose/MongoDB
3. Keep Knex.js and adapt Phase 1 to work with it

**Recommendation:** For Phase 1, we'll create Mongoose models and routes that work alongside the existing Knex.js system, then migrate fully in later phases.

