import { createHash, randomBytes } from "crypto";

const args = process.argv.slice(2);
const firstArgAsNumber = Number(args[0]);
const count = Number.isInteger(firstArgAsNumber) && firstArgAsNumber > 0 ? firstArgAsNumber : 1;
const labelBase =
  count > 1
    ? args.slice(1).join(" ").trim() || "member invite"
    : args.join(" ").trim() || "member invite";

if (count > 100) {
  throw new Error("For safety, generate at most 100 invite codes at a time.");
}

const rows = Array.from({ length: count }, (_, index) => {
  const code = `LAW-${randomBytes(4).toString("hex").toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;
  const codeHash = createHash("sha256").update(code).digest("hex");
  const label = count > 1 ? `${labelBase}-${String(index + 1).padStart(2, "0")}` : labelBase;
  return { code, codeHash, label };
});

console.log("Invite codes:");
rows.forEach((row, index) => {
  console.log(`${index + 1}. ${row.code} (${row.label})`);
});

console.log("");
console.log("Run this SQL once in Supabase SQL Editor:");
console.log("");
console.log("insert into public.member_invite_codes (code_hash, label, max_uses) values");
console.log(
  rows
    .map(
      (row) =>
        `('${row.codeHash}', '${escapeSql(row.label)}', 1)`,
    )
    .join(",\n") + ";",
);

function escapeSql(value: string) {
  return value.replace(/'/g, "''");
}
