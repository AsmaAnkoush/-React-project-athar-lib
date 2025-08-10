import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FolderOpen, File, FileText, FileCode, Image as ImageIcon,
    FileArchive, FileSpreadsheet, FileAudio2, FileVideo2, Presentation, X
} from "lucide-react";

// Google API Key (public folders required)
const API_KEY = "AIzaSyA_yt7VNybzoM2GNsqgl196TefA8uT33Qs";

/* Subjects */
const subjects = [
    { code: "ENEE3308", name: "DYNAMICS", link: "https://drive.google.com/drive/u/0/folders/1606mxMKApRuLaxqPu7ERMH_bBXA3wYNc" },
    { code: "ENEE2313", name: "Electronics 1", link: "https://drive.google.com/drive/u/0/folders/1vnjBVs_2jSJzTIQkqGoCbUJysMumkT_J" },
    { code: "ENEE3304", name: "Electronics 2", link: "https://drive.google.com/drive/u/0/folders/1jZhd2gohbrToLkIkoSkBJwrzTOP3eYXd" },
    { code: "ENEE4302", name: "Control System 1", link: "https://drive.google.com/drive/u/0/folders/1HVPDzLhFOOcJyPwdoi2HZey5DtZQ6t8r" },
    { code: "ENEE2340", name: "Digital System", link: "https://drive.google.com/drive/u/0/folders/13jAxHfIIXxkUrw-GpdB16A4WrTA8DHPx" },
    { code: "ENEE2408", name: "Electrical Machines", link: "https://drive.google.com/drive/u/0/folders/1SQYzMLKhx4mgR8vhEojzcePpHZGg0Y6y" },
    { code: "ENEE4403", name: "Power System", link: "https://drive.google.com/drive/u/0/folders/10eRLSROCWBJeQSSjxRlzcHBouZK_DwYg" },
    { code: "ENEE3309", name: "Communication Systems 1", link: "https://drive.google.com/drive/u/0/folders/1dNrZn8bOqgS7E2EA05cIG-Zpb3v7UuCD" },
    { code: "ENEE3401", name: "Communication Systems 2", link: "https://drive.google.com/drive/u/0/folders/1GyFl5GmeMdEPfW_z0XkPO_6wzXt9d5V2" },
    { code: "ENEE5330", name: "Numerical Methods", link: "https://drive.google.com/drive/u/0/folders/1Hzmg4sJhAnL6xw4gWqik5WAAEJ_-E0VK" },
    { code: "ENEE3305", name: "Power Electronics", link: "https://drive.google.com/drive/u/0/folders/1gxdIqVBZQluLjJCAbSeFnT05Xet_JIhO" },
    { code: "ENEE5306", name: "Protection Systems", link: "https://drive.google.com/drive/u/0/folders/10cXakt1CZACqigZAG80_LupdrDVRzGd3" },
    { code: "ENEE4304", name: "Measurement and Instrumentation", link: "https://drive.google.com/drive/u/0/folders/1sTft42F38nIKzQA1nn1S3kcNuF7O4G0Q" },
    { code: "ENEE2312", name: "Signals and Systems", link: "https://drive.google.com/drive/u/0/folders/1AiBSH7Qq7d-vpKq5Rf_9r5gHSXS0qlxP" },
    { code: "ENEE3318", name: "Electromagnetics", link: "https://drive.google.com/drive/u/0/folders/1FmZ7aZIoM4uaeaX4eIfQ4hBTDEuN4xVG" },
    { code: "ENCS4308", name: "Microprocessors", link: "https://drive.google.com/drive/u/0/folders/1wUagiWg4AFe4nC1Ve16R4yVF6QimjBgD" },
    { code: "ENCS2308", name: "Computer Organization", link: "https://drive.google.com/drive/u/0/folders/1MNiulK2C72dYdSB4YgNnXydCKbGuU1Aa" },
    { code: "MATH234", name: "Linear Algebra", link: "https://drive.google.com/drive/u/0/folders/1xC9GDKU31xS8F31dGBVbgUzewpyNrPQl" },
    { code: "MATH1411", name: "Calculus 1", link: "https://drive.google.com/drive/u/0/folders/1pImx9APzpXOhRyC5rlQeSJCTvwIbJ2Dl" },
    { code: "MATH2311", name: "Calculus 3", link: "https://drive.google.com/drive/u/0/folders/1-H0EXSPSHWTX_YtYU1vuW55eoXW1ZNVa" },
    { code: "MATH331", name: "Differential Equations", link: "https://drive.google.com/drive/u/0/folders/1-UipxultNA7nNmLouZPAQlbXCyJ7oWbm" },
    { code: "ENCE232", name: "Statics", link: "https://drive.google.com/drive/u/0/folders/1wXb7GsnaKJRgDDVZF38nTsvU1dR_-YBM" },
    { code: "ENEE2311", name: "Network Analysis 1", link: "https://drive.google.com/drive/u/0/folders/1_CFlBAcIOxtZxInFVGNU9_BdGypEb7_m" },
    { code: "ENEE2315", name: "Network Analysis 2", link: "https://drive.google.com/drive/u/0/folders/1q2N9G90Cfn9NoCrhssjdXvnv1JvStc6S" },
];

/* helpers */
function getFolderId(link) {
    if (!link) return null;
    const m = link.replace(/\s+/g, "").match(/\/folders\/([^/?#]+)/);
    return m?.[1] ?? null;
}
const isFolder = (mime) => mime === "application/vnd.google-apps.folder";
function fileTypeLabel(f) {
    if (isFolder(f.mimeType)) return "Folder";
    const n = (f.name || "").toLowerCase();
    const ext = n.includes(".") ? n.split(".").pop() : (f.mimeType?.split("/").pop() || "file");
    return ext.toUpperCase();
}
function getDownloadLink(file) {
    if (file.webContentLink) return file.webContentLink; // normal files
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

/* Skeleton */
function RowSkeleton(){
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

export default function AllSubjects() {
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [pathStack, setPathStack] = useState([]); // [{id,name}]
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [preview, setPreview] = useState(null); // {file}

    const subjectsList = useMemo(() => subjects, []);

    function handleSelectSubject(subj) {
        const id = getFolderId(subj.link);
        if (!id) return;
        setSelectedSubject(subj);
        setPathStack([{ id, name: subj.name }]);
    }

    useEffect(() => {
        async function fetchFolder() {
            if (!pathStack.length) return;
            setLoading(true);
            setErr("");
            const currentId = pathStack[pathStack.length - 1].id;
            const q = encodeURIComponent(`'${currentId}' in parents and trashed=false`);
            const fields = encodeURIComponent(
                "files(id,name,mimeType,modifiedTime,webViewLink,webContentLink)"
            );
            const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${API_KEY}&fields=${fields}&pageSize=1000&orderBy=folder,name_natural`;
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const files = (data.files ?? []).slice().sort((a, b) => {
                    if (isFolder(a.mimeType) && !isFolder(b.mimeType)) return -1;
                    if (!isFolder(a.mimeType) && isFolder(b.mimeType)) return 1;
                    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
                });
                setItems(files);
            } catch (e) {
                setErr("Failed to load from Google Drive. Check Public/Key.");
            } finally {
                setLoading(false);
            }
        }
        fetchFolder();
    }, [pathStack]);

    function openFolder(folder) {
        setPathStack((prev) => [...prev, { id: folder.id, name: folder.name }]);
    }
    function goToLevel(index) {
        setPathStack((prev) => prev.slice(0, index + 1));
    }
    function resetAll() {
        setSelectedSubject(null);
        setPathStack([]);
        setItems([]);
        setErr("");
        setPreview(null);
    }

    return (
        <main
            className="min-h-screen bg-[#0f172a] bg-cover bg-center px-4 py-10 flex items-start justify-center relative"
            style={{ backgroundImage: "url('/images.jpeg')" }}
        >
            <div className="absolute inset-0 bg-[#0f172a]/85 backdrop-blur-sm z-0" />
            <div className="relative z-10 w-full max-w-6xl text-white">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center text-yellow-400 mb-10 drop-shadow">
                    Electrical Engineering Courses
                </h2>

                {/* Subjects grid (no search) */}
                {!selectedSubject && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        <AnimatePresence>
                            {subjectsList.map((subj) => (
                                <motion.button
                                    key={subj.code + subj.name}
                                    onClick={() => handleSelectSubject(subj)}
                                    className="group text-left block w-full"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white rounded-2xl p-5 shadow-lg border border-white/10 backdrop-blur-md transition-transform duration-200 group-hover:scale-[1.03] hover:border-sky-500">
                                        <h4 className="font-bold text-sky-300 text-base mb-1">{subj.code}</h4>
                                        <p className="text-slate-200 text-sm">{subj.name}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Folder browser */}
                {selectedSubject && (
                    <motion.div
                        className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={resetAll}
                                className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition"
                            >
                                ← All Subjects
                            </button>
                            <h3 className="text-xl font-semibold text-sky-300">
                                {selectedSubject.code} – {selectedSubject.name}
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
                                <RowSkeleton/><RowSkeleton/><RowSkeleton/><RowSkeleton/>
                            </div>
                        )}
                        {err && <p className="text-red-300 text-sm mt-6">{err}</p>}

                        {/* Items list: click row = Quick Preview (file) / open (folder) */}
                        {!loading && !err && (
                            <ul className="mt-5 space-y-3">
                                <AnimatePresence>
                                    {items.map((f) => {
                                        const canDownload = getDownloadLink(f);
                                        const { Icon, tone } = pickIcon({ mime: f.mimeType, isFolderFlag: isFolder(f.mimeType), name: f.name });
                                        const isDir = isFolder(f.mimeType);

                                        const onClick = () => {
                                            if (isDir) openFolder(f);
                                            else setPreview(f);
                                        };

                                        return (
                                            <motion.li
                                                key={f.id}
                                                onClick={onClick}
                                                className={`rounded-2xl bg-gradient-to-br from-[#0b1224] to-[#0a1020] border border-white/10 p-4 flex items-center gap-4 transition hover:border-sky-500 cursor-pointer`}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl grid place-items-center ${tone} shadow-inner`}>
                                                    <Icon size={22}/>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white text-sm md:text-base font-medium truncate">
                                                        {f.name}
                                                    </h4>
                                                    <div className="text-xs text-slate-400 mt-1">{fileTypeLabel(f)}</div>
                                                </div>

                                                {!isDir && (
                                                    <div className="flex items-center gap-2" onClick={(e)=>e.stopPropagation()}>
                                                        <button
                                                            onClick={() => setPreview(f)}
                                                            className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs"
                                                        >
                                                            Quick Preview
                                                        </button>

                                                    </div>
                                                )}
                                            </motion.li>
                                        );
                                    })}

                                    {items.length === 0 && (
                                        <li className="text-slate-400 text-sm">No items here.</li>
                                    )}
                                </AnimatePresence>
                            </ul>
                        )}
                    </motion.div>
                )}

                <p className="text-center text-xs text-slate-400 mt-10">© 2025 - ElecLib</p>
            </div>

            {/* Quick Preview Modal */}
            <AnimatePresence>
                {preview && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-[#0b1224] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl"
                            initial={{ scale: 0.96, y: 12, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.96, y: 12, opacity: 0 }}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <div className="text-white font-medium truncate pr-4">{preview.name}</div>
                                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20" onClick={()=>setPreview(null)}>
                                    <X size={16}/>
                                </button>
                            </div>
                            <div className="bg-[#0a1020] p-3">
                                <iframe
                                    title={preview.name}
                                    src={`https://drive.google.com/file/d/${preview.id}/preview`}
                                    className="w-full h-[70vh] rounded-lg border-0"
                                    allow="autoplay"
                                />
                            </div>
                            <div className="p-4 flex items-center justify-end gap-2 border-t border-white/10">
                                <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs" onClick={()=>setPreview(null)}>
                                    Close
                                </button>
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
