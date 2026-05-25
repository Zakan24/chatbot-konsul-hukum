import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface BpkRecord {
  judul: string;
  sub_judul: string;
  isi: string;
  tanggal_ditetapkan: string;
  tanggal_berlaku: string;
  kategori_hukum: string;
  url_bpk: string;
}

function extractTahun(judul: string): string {
  // Extract year from titles like "Undang-Undang Nomor 1 Tahun 2026"
  const match = judul.match(/Tahun\s+(\d{4})/i);
  if (match && match[1]) return match[1];
  return "";
}

async function main() {
  console.log("🌱 Starting seed...");

  // Read the JSON data
  const jsonPath = path.join(process.cwd(), "prisma", "bpk_database.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const records: BpkRecord[] = JSON.parse(rawData) as BpkRecord[];

  console.log(`📄 Found ${records.length} records in bpk_database.json`);

  // Clear existing data
  const deleted = await prisma.peraturan.deleteMany();
  console.log(`🗑️  Deleted ${deleted.count} existing records`);

  // Insert in batches of 50
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    const data = batch.map((record) => ({
      judul: record.judul,
      sub_judul: record.sub_judul || "",
      isi: record.isi || "",
      tanggal_ditetapkan: record.tanggal_ditetapkan || "",
      tanggal_berlaku: record.tanggal_berlaku || "",
      kategori_hukum: record.kategori_hukum || "",
      url_bpk: record.url_bpk || "",
      tahun: extractTahun(record.judul),
    }));

    await prisma.peraturan.createMany({ data });
    inserted += batch.length;
    console.log(`  ✅ Inserted ${inserted}/${records.length}`);
  }

  console.log(`\n🎉 Seeding complete! ${inserted} records inserted.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
