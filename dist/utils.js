export function safeJsonError(res, status, message) {
    return res.status(status).json({ message });
}
export function getTimestamp() {
    return Date.now();
}
export function randomSuffix() {
    return Math.random().toString(36).slice(2, 9);
}
export function fileNameFor(original) {
    const ext = original.includes(".") ? original.slice(original.lastIndexOf(".")) : "";
    return `${getTimestamp()}_${randomSuffix()}${ext}`;
}
//# sourceMappingURL=utils.js.map