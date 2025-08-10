import React, { useEffect, useMemo, useState } from "react";

// Google API Key (make sure folders are Public - Viewer)
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
function bytesToSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0, n = Number(bytes);
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
function getDownloadLink(file) {
    if (file.webContentLink) return file.webContentLink; // normal files
    const isGoogleDoc = file.mimeType?.startsWith("application/vnd.google-apps");
    if (isGoogleDoc) {
        return `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${encodeURIComponent("application/pdf")}&key=${API_KEY}`;
    }
    return null;
}

export default function AllSubjects() {
    const [search, setSearch] = useState("");
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [pathStack, setPathStack] = useState([]); // [{id,name}]
    const [items, setItems] = useState([]);
    const [fileSearch, setFileSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const filteredSubjects = useMemo(() => {
        return subjects.filter(
            (s) =>
                s.code.toLowerCase().includes(search.toLowerCase()) ||
                s.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const filteredItems = useMemo(() => {
        const q = fileSearch.trim().toLowerCase();
        if (!q) return items;
        return items.filter((f) => f.name?.toLowerCase().includes(q));
    }, [items, fileSearch]);

    // choose subject
    function handleSelectSubject(subj) {
        const id = getFolderId(subj.link);
        if (!id) return;
        setSelectedSubject(subj);
        setPathStack([{ id, name: subj.name }]);
    }

    // fetch current folder content
    useEffect(() => {
        async function fetchFolder() {
            if (!pathStack.length) return;
            setLoading(true);
            setErr("");
            const currentId = pathStack[pathStack.length - 1].id;
            const q = encodeURIComponent(`'${currentId}' in parents and trashed=false`);
            const fields = encodeURIComponent(
                "files(id,name,size,mimeType,modifiedTime,webViewLink,webContentLink)"
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

    // open subfolder by clicking the row
    function openFolder(folder) {
        setPathStack((prev) => [...prev, { id: folder.id, name: folder.name }]);
    }

    // breadcrumb navigation
    function goToLevel(index) {
        setPathStack((prev) => prev.slice(0, index + 1));
    }

    // back to subject list
    function resetAll() {
        setSelectedSubject(null);
        setPathStack([]);
        setItems([]);
        setFileSearch("");
        setErr("");
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

                {/* Subjects grid */}
                {!selectedSubject && (
                    <>
                        <div className="mb-6 flex justify-center">
                            <input
                                type="text"
                                placeholder="Search by code or name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full max-w-md px-5 py-3 rounded-full text-sm bg-white/10 placeholder-white text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {filteredSubjects.map((subj) => (
                                <button
                                    key={subj.code + subj.name}
                                    onClick={() => handleSelectSubject(subj)}
                                    className="group text-left block w-full"
                                >
                                    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white rounded-2xl p-5 shadow-lg border border-white/10 backdrop-blur-md transition-transform duration-200 group-hover:scale-[1.03] hover:border-sky-500">
                                        <h4 className="font-bold text-sky-300 text-base mb-1">{subj.code}</h4>
                                        <p className="text-slate-200 text-sm">{subj.name}</p>
                                    </div>
                                </button>
                            ))}

                            {filteredSubjects.length === 0 && (
                                <p className="text-center col-span-full text-slate-400 text-sm mt-4">
                                    No subjects found.
                                </p>
                            )}
                        </div>
                    </>
                )}

                {/* Folder browser */}
                {selectedSubject && (
                    <div className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl">
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

                        {/* Tools */}
                        <div className="mt-4">
                            <input
                                type="text"
                                placeholder="Search in this folder..."
                                value={fileSearch}
                                onChange={(e) => setFileSearch(e.target.value)}
                                className="w-full md:max-w-sm px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>

                        {/* States */}
                        {loading && <p className="text-slate-300 text-sm mt-6">Loading…</p>}
                        {err && <p className="text-red-300 text-sm mt-6">{err}</p>}

                        {/* Items list */}
                        {!loading && !err && (
                            <ul className="mt-5 space-y-3">
                                {filteredItems.map((f) => {
                                    const canDownload = getDownloadLink(f);
                                    return (
                                        <li
                                            key={f.id}
                                            onClick={() => isFolder(f.mimeType) && openFolder(f)}
                                            className={`rounded-2xl bg-gradient-to-br from-[#0b1224] to-[#0a1020] border border-white/10 p-4 flex items-center gap-4 transition hover:border-sky-500 ${isFolder(f.mimeType) ? "cursor-pointer" : ""}`}
                                        >
                                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-lg">
                                                {isFolder(f.mimeType) ? "📁" : "📄"}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white text-sm md:text-base font-medium truncate">
                                                    {f.name}
                                                </h4>
                                                {!isFolder(f.mimeType) && f.size && (
                                                    <div className="text-xs text-slate-400 mt-1">{bytesToSize(f.size)}</div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            {!isFolder(f.mimeType) && (
                                                <div className="flex items-center gap-2" onClick={(e)=>e.stopPropagation()}>
                                                    <a
                                                        href={f.webViewLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs"
                                                    >
                                                        Open File
                                                    </a>
                                                    {canDownload && (
                                                        <a
                                                            href={canDownload}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="px-3 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
                                                        >
                                                            Download
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}

                                {filteredItems.length === 0 && (
                                    <li className="text-slate-400 text-sm">No items here.</li>
                                )}
                            </ul>
                        )}
                    </div>
                )}

                <p className="text-center text-xs text-slate-400 mt-10">© 2025 - ElecLib</p>
            </div>
        </main>
    );
}
