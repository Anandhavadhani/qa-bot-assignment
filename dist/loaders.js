import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
export async function loadFileText(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".txt") {
        const buf = await fs.readFile(filePath, "utf8");
        if (Buffer.byteLength(buf, "utf8") > 1024 * 1024) {
            return "[Warning: text file exceeds 1MB]\n" + buf.slice(0, 1024 * 1024);
        }
        return buf;
    }
    if (ext === ".csv") {
        const buf = await fs.readFile(filePath, "utf8");
        const rows = buf.split(/\r?\n/).filter(Boolean);
        return rows.slice(0, 1000).map((r, i) => `Row ${i + 1}: ${r}`).join("\n");
    }
    if (ext === ".pdf") {
        const buffer = await fs.readFile(filePath);
        const data = await pdfParse(buffer);
        // pdf-parse returns text with page breaks; keep as-is
        return data.text || "";
    }
    if (ext === ".docx") {
        const res = await mammoth.extractRawText({ path: filePath });
        return res.value || "";
    }
    throw new Error("Unsupported file type");
}
//# sourceMappingURL=loaders.js.map