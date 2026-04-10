# Quote Bank Data

`quote-bank.json` is the local, non-hardcoded motivation quote source used by the web app.

## Schema

Each record includes:
- `id` (number)
- `text` (string)
- `author` (string)
- `role` (string)
- `category` (string)
- `categoryColor` (string)
- `background` (string)
- `avatar` (string)
- `avatarImage` (string)
- `avatarBackground` (string)
- `likes` (number)
- `dislikes` (number)
- `saves` (number)

## Production Setup

For production, host one JSON per quote at:
`<QUOTE_BASE_URI>/<id>.json`

Then run the contracts seed script with:
- `MOTIVATIONTOK_ADDRESS`
- `QUOTE_BASE_URI`

Example:
`MOTIVATIONTOK_ADDRESS=0x... QUOTE_BASE_URI=https://your-cdn.com/quotes npm run seed:quotes:celo-sepolia`
