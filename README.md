# Remit to Revenue

**Live App:** https://remit-to-revenue.netlify.app

Convert remittances into wealth. Remit to Revenue helps Nepali remittance-receiving families track incoming funds and build consistent saving habits, turning financial inflows into productive assets.

## Vision

With over **2.5 million (25 lakh)** Nepalis currently working abroad, remittances form a cornerstone of the national economy — contributing roughly **20–25% of Nepal's GDP** and serving as a primary source of household income.

However, a significant portion of these incoming funds is directed toward daily consumption and unproductive expenditures rather than long-term, wealth-generating investments. Remit to Revenue aims to change this behavior by seamlessly converting these financial inflows into productive assets, boosting individual financial security and contributing to broader economic growth.

## Features (v1.0)

- 💳 **Transaction tracking** — record incoming remittances with sender and amount
- 💰 **One-tap savings** — earmark 10% of any remittance with a single tap
- 🎯 **Personalized goals** — set savings targets with progress tracking and deadlines
- 🏆 **Streak tracking** — build habits by saving from consecutive remittances
- 📊 **Weekly analytics** — totals received/saved, save rate, and momentum
- 📚 **Financial lessons** — bite-sized education for remittance recipients

## Roadmap

Future releases will let users allocate saved remittances directly into productive investments:

- 📈 IPO investments
- 🛡️ Insurance policies
- 💳 Diversified portfolio options
- 🤝 Peer-to-peer lending
- 🤖 AI-powered investment recommendations

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Supabase (Postgres, Auth, Row Level Security)
- **Hosting:** Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://app.supabase.com) project

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/NiranjanNlc/remit-to-revenue.git
   cd remit-to-revenue
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env.local` with your Supabase credentials:

   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Create the database tables — run the SQL in [SETUP.md](SETUP.md) and the scripts under `supabase/` in the Supabase SQL Editor.

5. Start the dev server:

   ```bash
   npm run dev
   ```

   The app opens at http://localhost:5173.

See [SETUP.md](SETUP.md) for the full setup guide and [REMITTANCE_PLAN.md](REMITTANCE_PLAN.md) for the technical spec.

## Schema Notes

- Amounts are stored in **paisa** (Rs. 1 = 100 paisa) to avoid float precision issues
- Each transaction can be saved against only once (enforced by a UNIQUE constraint)
- Streaks count consecutive transactions that have a savings entry

## License

This project is licensed under the MIT License — see [LICENSE.md](LICENSE.md) for details.
