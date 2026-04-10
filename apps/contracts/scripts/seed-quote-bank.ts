import { readFileSync } from "node:fs";
import path from "node:path";
import hre from "hardhat";

type QuoteRecord = {
  id: number;
  text: string;
  author: string;
};

const QUOTE_BANK_PATH = path.resolve(__dirname, "../../web/public/data/quote-bank.json");
const BATCH_SIZE = Number(process.env.SEED_BATCH_SIZE ?? 100);
const BASE_URI = process.env.QUOTE_BASE_URI?.trim();
const CONTRACT_ADDRESS = process.env.MOTIVATIONTOK_ADDRESS?.trim() as `0x${string}` | undefined;

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Set MOTIVATIONTOK_ADDRESS in env before seeding");
  }

  if (!BASE_URI) {
    throw new Error("Set QUOTE_BASE_URI in env, e.g. https://example.com/quotes");
  }

  const raw = readFileSync(QUOTE_BANK_PATH, "utf8");
  const quoteBank = JSON.parse(raw) as QuoteRecord[];

  if (!Array.isArray(quoteBank) || quoteBank.length === 0) {
    throw new Error("Quote bank is empty or invalid");
  }

  const quoteIds = quoteBank.map((quote) => BigInt(quote.id));
  const uris = quoteBank.map((quote) => `${BASE_URI}/${quote.id}.json`);

  const motivationTok = await hre.viem.getContractAt("MotivationTok", CONTRACT_ADDRESS);
  const [deployer] = await hre.viem.getWalletClients();

  console.log(`Seeding ${quoteIds.length} quotes to ${CONTRACT_ADDRESS} in batches of ${BATCH_SIZE}`);
  console.log(`Using deployer ${deployer.account.address}`);

  const idBatches = chunkArray(quoteIds, BATCH_SIZE);
  const uriBatches = chunkArray(uris, BATCH_SIZE);

  for (let index = 0; index < idBatches.length; index++) {
    const ids = idBatches[index];
    const chunkUris = uriBatches[index];

    const hash = await motivationTok.write.listQuotes([ids, chunkUris], {
      account: deployer.account,
    });

    console.log(`Batch ${index + 1}/${idBatches.length}: tx ${hash}`);
    await hre.viem.getPublicClient().waitForTransactionReceipt({ hash });
  }

  console.log("Quote bank seed completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
