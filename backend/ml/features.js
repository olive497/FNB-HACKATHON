// Shared by training and prediction so features always match.
export function normalise(text) {
  return String(text)
    .toLowerCase()
    .replace(/https?:\/\/\S+|www\.\S+|\b\w+\.(xyz|click|top|shop|loan|money)\b|bit\.ly\/?\S*/g, " urltoken ")
    .replace(/\br\s?\d[\d\s,]*(\.\d+)?/g, " randamt ")
    .replace(/\b0\d{2}[\s-]?\d{3}[\s-]?\d{4}\b|\+27\d{9}/g, " phonetoken ")
    .replace(/\b\d{4,}\b/g, " longnum ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text) {
  const words = normalise(text).split(" ").filter(Boolean);
  const grams = [...words];
  for (let i = 0; i < words.length - 1; i++) grams.push(words[i] + "_" + words[i + 1]);
  return grams;
}
