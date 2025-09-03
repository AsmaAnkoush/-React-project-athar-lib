import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FolderOpen, File, FileText, FileCode, Image as ImageIcon,
    FileArchive, FileSpreadsheet, FileAudio2, FileVideo2, Presentation,
    X, Zap, ChevronLeft, ChevronRight, Upload
} from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";

/********************
 * CONFIG
 ********************/
const ROOT_FOLDER_ID = "1iPnlPlC-LzXE_jTn7KIk3EFD02_9cVyD"; // parent folder that contains subject folders
const KAREEM_FACEBOOK_URL = "https://www.facebook.com/kareem.taha.7146";
const API_KEY = "AIzaSyA_yt7VNybzoM2GNsqgl196TefA8uT33Qs";
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdQ6L8wNp28GjRytOy06fmm6knEhDjny0TdLgHi-i1hMeA2tw/viewform";

/********************
 * HELPERS
 ********************/
const isFolder = (mime) => mime === "application/vnd.google-apps.folder";
const isImageFile = (f) =>
    f?.mimeType?.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test((f?.name || "").toLowerCase());

function fileTypeLabel(f) {
    if (isFolder(f.mimeType)) return "Folder";
    const n = (f.name || "").toLowerCase();
    const ext = n.includes(".") ? n.split(".").pop() : (f.mimeType?.split("/").pop() || "file");
    return ext.toUpperCase();
}
function getDownloadLink(file) {
    if (file.webContentLink) return file.webContentLink;
    const isGoogleDoc = file.mimeType?.startsWith("application/vnd.google-apps");
    if (isGoogleDoc) {
        return `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${encodeURIComponent("application/pdf")}&key=${API_KEY}`;
    }
    return null;
}
function pickIcon({ mime, isFolderFlag, name = "" }) {
    if (isFolderFlag) return { Icon: FolderOpen, tone: "bg-amber-500/20 text-amber-300" };
    const n = name.toLowerCase();
    if (mime?.includes("pdf") || n.endsWith(".pdf")) return { Icon: FileText, tone: "bg-rose-500/20 text-rose-300" };
    if (mime?.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/.test(n)) return { Icon: ImageIcon, tone: "bg-indigo-500/20 text-indigo-300" };
    if (mime?.startsWith("audio/") || /\.(mp3|wav|m4a|flac)$/.test(n)) return { Icon: FileAudio2, tone: "bg-fuchsia-500/20 text-fuchsia-300" };
    if (mime?.startsWith("video/") || /\.(mp4|mov|webm|mkv)$/.test(n)) return { Icon: FileVideo2, tone: "bg-violet-500/20 text-violet-300" };
    if (/\.(zip|rar|7z|tar|gz)$/i.test(n)) return { Icon: FileArchive, tone: "bg-emerald-500/20 text-emerald-300" };
    if (/\.(xlsx?|csv)$/i.test(n) || mime === "application/vnd.google-apps.spreadsheet") return { Icon: FileSpreadsheet, tone: "bg-lime-500/20 text-lime-300" };
    if (/\.(pptx?)$/i.test(n) || mime === "application/vnd.google-apps.presentation") return { Icon: Presentation, tone: "bg-orange-500/20 text-orange-300" };
    if (/\.(js|ts|tsx|jsx|py|cpp|c|java|go|rb)$/i.test(n)) return { Icon: FileCode, tone: "bg-sky-500/20 text-sky-300" };
    if (mime === "application/vnd.google-apps.document") return { Icon: FileText, tone: "bg-cyan-500/20 text-cyan-300" };
    return { Icon: File, tone: "bg-slate-500/20 text-slate-300" };
}
function escapeRegExp(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function highlightMatch(text, query) {
    if (!query) return text;
    const q = query.trim();
    if (!q) return text;
    const regex = new RegExp(`(${escapeRegExp(q)})`, "ig");
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
        regex.test(part) ? (
            <span key={i} className="bg-yellow-400/40 text-yellow-100 px-1 rounded">{part}</span>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}
function RowSkeleton() {
    return (
        <div className="rounded-2xl p-4 border border-white/10 bg-white/5 flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-white/10" />
            <div className="flex-1">
                <div className="h-4 w-2/5 bg-white/20 rounded mb-2" />
                <div className="h-3 w-1/4 bg-white/10 rounded" />
            </div>
            <div className="h-8 w-24 bg-white/10 rounded" />
        </div>
    );
}

/********************
 * SUBJECT NAME PARSER
 ********************/
function parseSubjectFolderName(folderName) {
    const raw = (folderName || "").trim();
    if (!raw) return { code: raw, name: raw };
    const sepMatch = raw.split(/\s*[\-–—]\s*/);
    if (sepMatch.length >= 2) {
        const code = sepMatch[0].trim();
        const name = sepMatch.slice(1).join(" - ").trim();
        return { code, name };
    }
    const tokens = raw.split(/\s+/);
    if (tokens.length >= 2) {
        const code = tokens[0];
        const name = tokens.slice(1).join(" ");
        return { code, name };
    }
    return { code: raw, name: "" };
}

/********************
 * API HELPERS
 ********************/
async function listChildren({ parentId, onlyFolders = false }) {
    const base = "https://www.googleapis.com/drive/v3/files";
    const mimeFilter = onlyFolders ? " and mimeType='application/vnd.google-apps.folder'" : "";
    const q = encodeURIComponent(`'${parentId}' in parents and trashed=false${mimeFilter}`);
    const fields = encodeURIComponent("files(id,name,mimeType,modifiedTime,webViewLink,webContentLink)");
    const url = `${base}?q=${q}&key=${API_KEY}&fields=${fields}&pageSize=1000&orderBy=folder,name_natural`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Drive HTTP ${res.status}`);
    const data = await res.json();
    return (data.files ?? []);
}

export default function AllSubjects() {
    // Search and selection
    const [search, setSearch] = useState("");
    const [selectedSubject, setSelectedSubject] = useState(null); // { id, code, name }
    const [pathStack, setPathStack] = useState([]); // [{id,name}]

    // Data
    const [subjects, setSubjects] = useState([]); // dynamically loaded from Drive
    const [items, setItems] = useState([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [preview, setPreview] = useState(null);

    // ===== Load subject folders from Drive root (once) =====
    useEffect(() => {
        async function fetchSubjects() {
            if (!ROOT_FOLDER_ID || ROOT_FOLDER_ID.startsWith("<")) return; // guard if not configured
            setErr("");
            try {
                const folders = await listChildren({ parentId: ROOT_FOLDER_ID, onlyFolders: true });
                const mapped = folders.map(f => {
                    const { code, name } = parseSubjectFolderName(f.name);
                    return {
                        id: f.id,
                        code: code || f.name,
                        name: name || "",
                        link: `https://drive.google.com/drive/folders/${f.id}`,
                    };
                }).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: "base" }));
                setSubjects(mapped);
            } catch (e) {
                console.error(e);
                setErr("Failed to load subjects from Google Drive. Make sure the root folder is public and the API key is valid.");
            }
        }
        fetchSubjects();
    }, []);

    function resetAll() {
        setSelectedSubject(null);
        setPathStack([]);
        setItems([]);
        setErr("");
        setPreview(null);
    }

    // ===== Browser Back integration (popstate) =====
    useEffect(() => {
        const onPop = () => {
            if (preview) { setPreview(null); return; }
            if (pathStack.length > 1) { setPathStack(p => p.slice(0, -1)); return; }
            if (selectedSubject) { resetAll(); return; }
            // عند الهوم: المتصفح يرجع لصفحة سابقة خارج هذه الصفحة (السلوك الطبيعي)
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, [preview, pathStack.length, selectedSubject]);

    const subjectsList = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return subjects;
        return subjects.filter((s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }, [search, subjects]);

    function handleSelectSubject(subj) {
        if (!subj?.id) return;
        setSelectedSubject(subj);
        setPathStack([{ id: subj.id, name: subj.name || subj.code }]);
        window.history.pushState({ view: "subject", id: subj.id }, "");
    }

    // Load items for current folder
    useEffect(() => {
        async function fetchFolder() {
            if (!pathStack.length) return;
            setLoading(true); setErr("");
            const currentId = pathStack[pathStack.length - 1].id;
            try {
                const files = await listChildren({ parentId: currentId, onlyFolders: false });
                const sorted = files.slice().sort((a, b) => {
                    if (isFolder(a.mimeType) && !isFolder(b.mimeType)) return -1;
                    if (!isFolder(a.mimeType) && isFolder(b.mimeType)) return 1;
                    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
                });
                setItems(sorted);
            } catch (e) {
                console.error(e);
                setErr("Failed to load from Google Drive. Check public permissions/API key.");
            } finally {
                setLoading(false);
            }
        }
        fetchFolder();
    }, [pathStack]);

    function openFolder(folder) {
        setPathStack((prev) => [...prev, { id: folder.id, name: folder.name }]);
        window.history.pushState({ view: "folder", id: folder.id }, "");
    }
    function goToLevel(index) {
        setPathStack((prev) => prev.slice(0, index + 1));
        window.history.pushState({ view: "folder", level: index }, "");
    }

    // ===== Preview navigation (keyboard for all files) =====
    const previewableItems = useMemo(() => items.filter((f) => !isFolder(f.mimeType)), [items]);
    const navAny = useCallback((dir) => {
        if (!preview) return;
        const arr = previewableItems;
        const idx = arr.findIndex((x) => x.id === preview.id);
        if (idx === -1 || arr.length === 0) return;
        const next = dir === "prev" ? (idx - 1 + arr.length) % arr.length : (idx + 1) % arr.length;
        setPreview(arr[next]);

    }, [preview, navAny]);

    // Keyboard nav while preview open
    useEffect(() => {
        if (!preview) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") { e.preventDefault(); setPreview(null); return; }
            if (e.key === "ArrowLeft") { e.preventDefault(); navAny("prev"); }
            if (e.key === "ArrowRight") { e.preventDefault(); navAny("next"); }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [preview, navAny]);

    return (
        <main
            className="min-h-screen bg-[#0f172a] bg-cover bg-center px-4 py-10 flex items-start justify-center relative"
            style={{ backgroundImage: "url('/images.jpeg')" }}
        >
            <div className="absolute inset-0 bg-[#0f172a]/85 backdrop-blur-sm z-0" />
            <div className="relative z-10 w-full max-w-6xl text-white">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center text-yellow-400 mb-8 drop-shadow">
                    Electrical Engineering Courses
                </h2>

                {/* Search (subjects) */}
                {!selectedSubject && (
                    <div className="mb-6 flex justify-center">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by code or course name…"
                            className="w-full max-w-md px-5 py-3 rounded-full text-sm bg-white/10 placeholder-white/80 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-lg"
                        />
                    </div>
                )}

                {/* Subjects grid */}
                {!selectedSubject && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        <AnimatePresence>
                            {subjectsList.map((subj) => {
                                const q = search.trim();
                                return (
                                    <motion.button
                                        key={subj.id}
                                        onClick={() => handleSelectSubject(subj)}
                                        className="group text-left block w-full"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white rounded-2xl p-5 shadow-lg border border-white/10 backdrop-blur-md transition-transform duration-200 group-hover:scale-[1.03] hover:border-sky-500 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 grid place-items-center shadow-inner">
                                                <Zap size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-sky-300 text-base mb-0.5">
                                                    {highlightMatch(subj.code, q)}
                                                </h4>
                                                <p className="text-slate-200 text-sm truncate">
                                                    {highlightMatch(subj.name || "", q)}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                            {subjectsList.length === 0 && subjects.length > 0 && (
                                <p className="text-center col-span-full text-slate-400 text-sm mt-4">
                                    No subjects found.
                                </p>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Folder browser */}
                {selectedSubject && (
                    <motion.div
                        className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl mt-4"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        {/* زر Back بالأعلى مع أيقونة سهم */}
                        <div className="mb-4">
                            <button
                                onClick={() => window.history.back()}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition"
                                title="Back"
                                aria-label="Back"
                            >
                                <FiArrowLeft className="text-lg" />
                                <span>Back</span>
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-semibold text-sky-300">
                                {selectedSubject.code}{selectedSubject.name ? " – " : ""}{selectedSubject.name}
                            </h3>
                        </div>

                        {/* Breadcrumb */}
                        <div className="mt-3 text-sm flex flex-wrap items-center gap-1">
                            {pathStack.map((p, idx) => (
                                <span key={p.id} className="flex items-center gap-1">
                  <button
                      className={`hover:underline ${idx === pathStack.length - 1 ? "text-sky-300 font-medium" : "text-slate-300"}`}
                      onClick={() => goToLevel(idx)}
                  >
                    {idx === 0 ? "Root" : p.name}
                  </button>
                                    {idx < pathStack.length - 1 && <span className="text-slate-500">/</span>}
                </span>
                            ))}
                        </div>

                        {/* States */}
                        {loading && (
                            <div className="mt-6 space-y-3">
                                <RowSkeleton /><RowSkeleton /><RowSkeleton /><RowSkeleton />
                            </div>
                        )}
                        {err && <p className="text-red-300 text-sm mt-6">{err}</p>}

                        {/* Items */}
                        {!loading && !err && (
                            <>
                                <ul className="mt-5 space-y-3">
                                    <AnimatePresence>
                                        {items.map((f) => {
                                            const { Icon, tone } = pickIcon({ mime: f.mimeType, isFolderFlag: isFolder(f.mimeType), name: f.name });
                                            const isDir = isFolder(f.mimeType);
                                            const onClick = () => {
                                                if (isDir) openFolder(f);
                                                else { setPreview(f); window.history.pushState({ view: "preview", id: f.id }, ""); }
                                            };
                                            return (
                                                <motion.li
                                                    key={f.id}
                                                    onClick={onClick}
                                                    className="rounded-2xl bg-gradient-to-br from-[#0b1224] to-[#0a1020] border border-white/10 p-4 transition hover:border-sky-500 cursor-pointer"
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl grid place-items-center ${tone} shadow-inner shrink-0`}>
                                                            <Icon size={22} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-white text-sm md:text-base font-medium break-words whitespace-normal sm:truncate">
                                                                {f.name}
                                                            </h4>
                                                            <div className="text-xs text-slate-400 mt-1">{fileTypeLabel(f)}</div>
                                                        </div>
                                                    </div>
                                                </motion.li>
                                            );
                                        })}
                                        {items.length === 0 && <li className="text-slate-400 text-sm">No items here.</li>}
                                    </AnimatePresence>
                                </ul>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Footer – ثابت بكل الصفحات */}
                <div className="mt-10 space-y-4">
                    <div className="rounded-2xl border border-sky-500/30 bg-sky-600/10 p-4 text-center">
                        <p className="text-sm sm:text-base text-sky-200 font-medium">
                            For suggestions or file submissions, contact{" "}
                            <a
                                href={KAREEM_FACEBOOK_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-300 underline decoration-dotted underline-offset-4 hover:text-sky-200 ml-1"
                                title="Open Facebook profile"
                            >
                                Eng. Kareem Taha
                            </a>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-100" dir="rtl">
                        <div className="text-yellow-300 font-semibold mb-2 text-center">
                            وأنت بتدرس، لا تنسى أهلنا في غزة
                        </div>
                        <p className="whitespace-pre-line">
                            اللهم يا رحيم، يا قوي، يا جبار، كن لأهل غزة عونًا ونصيرًا، اللهم احفظهم بحفظك، وأمنهم بأمانك، واشفِ جرحاهم، وتقبل شهداءهم، واربط على قلوبهم، وأبدل خوفهم أمنًا، وحزنهم فرحًا، وضعفهم قوة، اللهم عجّل لهم بالفرج والنصر المبين، واجعل كيد عدوهم في نحورهم، إنك وليُّ ذلكَ والقادر عليه.
                        </p>
                    </div>

                    {/* Upload File — ظاهر دائمًا */}
                    <div className="flex justify-center">
                        <a
                            href={FORM_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm"
                            title="Upload to Pending"
                        >
                            <Upload size={16} />
                            Upload File
                        </a>
                    </div>

                    <p className="text-center text-xs text-slate-400">© 2025 - ElecLib</p>
                </div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {preview && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="relative bg-[#0b1224] border border-white/10 rounded-2xl w-full max-w-6xl md:max-w-7xl overflow-hidden shadow-2xl"
                            initial={{ scale: 0.96, y: 12, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.96, y: 12, opacity: 0 }}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <div className="text-white font-medium pr-4 whitespace-normal break-words">{preview.name}</div>
                                <button
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                                    onClick={() => setPreview(null)}
                                    title="Close Preview (Esc)"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="relative bg-[#0a1020] p-3">
                                {/* أزرار مرئية فقط للصور؛ الكيبورد يعمل لكل الملفات */}
                                {isImageFile(preview) && previewableItems.length > 1 && (
                                    <>
                                        <button onClick={() => navAny("prev")} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20" aria-label="Previous">
                                            <ChevronLeft />
                                        </button>
                                        <button onClick={() => navAny("next")} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20" aria-label="Next">
                                            <ChevronRight />
                                        </button>
                                    </>
                                )}
                                <iframe
                                    title={preview.name}
                                    src={`https://drive.google.com/file/d/${preview.id}/preview`}
                                    className="w-full h-[80vh] rounded-lg border-0"
                                    allow="autoplay"
                                    allowFullScreen
                                />
                            </div>

                            <div className="p-4 flex items-center justify-end gap-2 border-t border-white/10">
                                {getDownloadLink(preview) && (
                                    <a
                                        href={getDownloadLink(preview)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
                                    >
                                        Download
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
