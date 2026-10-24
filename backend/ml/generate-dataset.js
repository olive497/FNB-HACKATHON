// Builds a synthetic, South-Africa-flavoured scam/legit SMS dataset (ml/data/training.csv).
// Deterministic (seeded). Replace or extend with a real labelled dataset for better accuracy:
//   node ml/train.js --data path\to\your.csv      (rows: label,text   label = scam|ham)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
let seed = 20261024;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const amt = () => `R${pick([150, 250, 480, 899, 1200, 2500, 4500, 7800, 15000])}`;
const banks = ["FNB", "Capitec", "Absa", "Standard Bank", "Nedbank", "TymeBank", "Discovery Bank", "SASSA"];
const urls = ["http://bit.ly/3xK9aP", "www.secure-login-update.xyz", "http://fnb-verify.click/login", "tinyurl.com/claim-now", "https://capitec-reactivate.top/id", "www.sassa-grant-update.money"];
const names = ["Thabo", "Lerato", "Sipho", "Naledi", "Ayanda", "Mpho", "Zanele", "Pieter", "Kagiso"];

const scam = [
  () => `${pick(banks)}: Your account has been suspended. Verify your identity immediately at ${pick(urls)}`,
  () => `Dear customer your ${pick(banks)} account will be blocked within 24 hours. Confirm your OTP to reactivate.`,
  () => `URGENT: unauthorised login detected on your ${pick(banks)} account. Send your PIN code to stop the transaction now.`,
  () => `Congratulations! You have won ${amt()} in the lucky draw. Claim your prize at ${pick(urls)}`,
  () => `You've been selected for a cash giveaway of ${amt()}. Pay a ${amt()} fee first to release your winnings.`,
  () => `SASSA grant payout update: your grant will increase. Confirm your banking details and password at ${pick(urls)}`,
  () => `Earn ${amt()} per day working from home. Guaranteed returns, no experience needed. WhatsApp ${pick(["082","071","063","076"])} ${Math.floor(1000000 + rnd() * 8999999)}`,
  () => `Investment opportunity: double your money in 7 days. Deposit ${amt()} today to activate your account. Last chance!`,
  () => `Tax refund of ${amt()} is waiting for you. Submit your login details at ${pick(urls)} to claim.`,
  () => `Hi it's ${pick(names)}, I'm in trouble and lost my phone. Please send ${amt()} urgently to this number, I will pay you back.`,
  () => `${pick(banks)} alert: payment of ${amt()} pending. Share the verification code sent to you to approve or cancel.`,
  () => `Final notice: unclaimed funds of ${amt()} in your name. Transfer a small admin fee to receive your money immediately.`,
  () => `Your ${pick(banks)} app link has expired. Update your password now at ${pick(urls)} or your account will be closed.`,
  () => `Loan approved ${amt()} no credit check! Pay the insurance fee first and the money is released within the hour.`,
  () => `Hello, I sent ${amt()} to your account by mistake. Please send it back, screenshot of payment attached.`,
  () => `Verify your account right now: ${pick(banks)} security team needs your OTP and ID number to stop a fraud attempt.`,
];
const ham = [
  () => `${pick(banks)}: ${amt()} paid from cheque account ending 4471 to ${pick(names)} on 24 Oct. Avail bal ${amt()}.`,
  () => `${pick(banks)}: Your OTP is for your own transaction only. Never share your OTP, PIN or password with anyone, including bank staff.`,
  () => `Hi ${pick(names)}, are we still on for lunch tomorrow at 1? I will bring the notes.`,
  () => `Your Takealot order has been dispatched and will arrive on Friday. Track it in the app.`,
  () => `Reminder: your clinic appointment is on Monday at 09:30. Please bring your ID and clinic card.`,
  () => `Mom: please buy bread and milk on your way home, and call Gogo tonight.`,
  () => `Your airtime top-up of ${amt()} was successful. Your new balance is ${amt()}. Thank you.`,
  () => `Eskom: your prepaid electricity purchase of ${amt()} was successful. Token will be sent to your meter.`,
  () => `Meeting moved to 14:00 in the boardroom. Please send the updated budget before then.`,
  () => `${pick(names)}: I paid my share of the rent, ${amt()}, thanks for sorting it out this month.`,
  () => `Your salary has been deposited. Remember to review your monthly budget in the app.`,
  () => `Lecture venue changed to Block C room 12. Assignment 3 is due on Friday at 23:59 on the student portal.`,
  () => `Your ${pick(banks)} card ending 2290 was used at a store in Polokwane for ${amt()}. Not you? Call the number on the back of your card.`,
  () => `Thanks for your payment of ${amt()}. Your receipt is available in the app under Documents.`,
  () => `Taxi fare going up from Monday. I will send money for the stokvel on the 25th, same as always.`,
  () => `Happy birthday ${pick(names)}! Hope you have a great day, see you at the braai on Saturday.`,
];

const rows = [];
const seen = new Set();
const add = (label, text) => {
  const t = text.replace(/\s+/g, " ").replace(/"/g, "'");
  if (seen.has(label + t)) return;
  seen.add(label + t);
  rows.push(`${label},"${t}"`);
};
for (let i = 0; i < 2000 && rows.length < 1400; i++) {
  add("scam", pick(scam)());
  add("ham", pick(ham)());
}
fs.mkdirSync(path.join(here, "data"), { recursive: true });
fs.writeFileSync(path.join(here, "data", "training.csv"), "label,text\n" + rows.join("\n") + "\n");
console.log(`Wrote ${rows.length} rows to ml/data/training.csv`);
