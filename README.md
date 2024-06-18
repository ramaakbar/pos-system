# POS System

## Getting Started

- Create new `.env` file from `.env.example`:

```bash
cp .env.example .env
```

- Create a database on your local mysql instance called `pos`.
- Then run the following commands:

```bash
cd your-app-name
bun db:push
bun --bun run dev
```
