import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs/promises";
import { InvokeBodySchema, FileUploadBodySchema } from "./types.js";
import { safeJsonError, fileNameFor } from "./utils.js";
import { loadFileText } from "./loaders.js";
import { invokeChain } from "./chain.js";
import { getModelInfo } from "./model.js";
const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
// ensure uploads dir exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(() => { });
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, fileNameFor(file.originalname))
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
});
app.get("/health", (req, res) => {
    const model = getModelInfo();
    res.json({ status: "ok", timestamp: Date.now(), model });
});
app.post("/search/document", async (req, res) => {
    const parsed = InvokeBodySchema.safeParse(req.body);
    if (!parsed.success)
        return safeJsonError(res, 400, parsed.error.message);
    const body = parsed.data;
    try {
        const document = body.documentText ?? (await loadFileText(body.documentPath));
        const result = await invokeChain(document, body.question, body.promptType);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        return safeJsonError(res, 500, "Server error processing request");
    }
});
app.post("/search/upload", upload.array("files"), async (req, res) => {
    // Multer will have saved files and enforced size limits
    const parsed = FileUploadBodySchema.safeParse(req.body);
    if (!parsed.success)
        return safeJsonError(res, 400, parsed.error.message);
    const body = parsed.data;
    const files = req.files || [];
    if (files.length === 0)
        return safeJsonError(res, 400, "No files uploaded");
    try {
        const texts = [];
        for (const f of files) {
            const p = path.join(UPLOAD_DIR, f.filename);
            try {
                const txt = await loadFileText(p);
                texts.push(txt);
            }
            catch (e) {
                texts.push(`[Failed to parse ${f.originalname}: ${e.message}]`);
            }
        }
        const combined = texts.join("\n\n---\n\n");
        const result = await invokeChain(combined, body.question, body.promptType);
        // cleanup unless PRESERVE_UPLOADS is true
        if (process.env.PRESERVE_UPLOADS !== "true") {
            for (const f of files) {
                const p = path.join(UPLOAD_DIR, f.filename);
                fs.unlink(p).catch(() => { });
            }
        }
        res.json({ ...result, filesProcessed: files.map(f => f.originalname) });
    }
    catch (err) {
        console.error(err);
        return safeJsonError(res, 500, "Server error processing upload");
    }
});
app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});
app.listen(PORT, () => {
    console.log(`QA Bot server listening on port ${PORT}`);
});
//# sourceMappingURL=server.js.map