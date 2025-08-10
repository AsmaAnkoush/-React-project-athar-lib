import React, { useEffect, useMemo, useState } from "react";

// ضع هنا مفتاح Google API
const API_KEY = "AIzaSyA_yt7VNybzoM2GNsqgl196TefA8uT33Qs";

const subjects = [
    { code: "ENEE3308", name: "DYNAMICS", link: "https://drive.google.com/drive/u/0/folders/1606mxMKApRuLaxqPu7ERMH_bBXA3wYNc" },
    { code: "ENEE2313", name: "Electronics 1", link: "https://drive.google.com/drive/u/0/folders/1vnjBVs_2jSJzTIQkqGoCbUJysMumkT_J" },
    { code: "ENEE3304", name: "Electronics 2", link: "https://drive.google.com/drive/u/0/folders/1jZhd2gohbrToLkIkoSkBJwrzTOP3eYXd" },
    { code: "ENEE4302", name: "Control System 1", link: "https://drive.google.com/drive/u/0/folders/1HVPDzLhFOOcJyPwdoi2HZey5DtZQ6t8r" },
    { code: "ENEE2340", name: "Digital System", link: "https://drive.google.com/drive/u/0/folders/13jAxHfIIXxkUrw-GpdB16A4WrTA8DHPx" },
    // باقي المواد...
];

function getFolderId(link) {
    if (!link) return null;
    const m = link.replace(/\s+/g, "").match(/\/folders\/([^/?#]+)/);
    return m?.[1] ?? null;
}

function bytesToSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let n = Number(bytes);
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function buildViewLink(file) {
    return file.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view`;
}

function buildDownloadLink(file) {
    if (file.webContentLink) return file.webContentLink;
    const isGoogleDoc = (type) => type?.startsWith("application/vnd.google-apps");
    if (isGoogleDoc(file.mimeType)) {
        const exportMime = "application/pdf";
        return `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${encodeURIComponent(exportMime)}&key=${API_KEY}`;
    }
    return `https://drive.google.com/uc?export=download&id=${file.id}`;
}

export default function AllSubjects() {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [matSearch, setMatSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const filteredSubjects = useMemo(() => {
        return subjects.filter(
            (s) =>
                s.code.toLowerCase().includes(search.toLowerCase()) ||
                s.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    useEffect(() => {
        async function fetchFolder() {
            if (!selected) return;
            setLoading(true);
            setErr("");
            setMaterials([]);
            const folderId = getFolderId(selected.link);
            if (!folderId) {
                setErr("تعذر قراءة Folder ID. تأكد من الرابط.");
                setLoading(false);
                return;
            }
            const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
            const fields = encodeURIComponent(
                "files(id,name,size,modifiedTime,mimeType,iconLink,webViewLink,webContentLink)"
            );
            const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${API_KEY}&fields=${fields}&pageSize=1000&orderBy=folder,name_natural`;
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const files = (data.files ?? []).slice().sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
                );
                setMaterials(files);
            } catch (e) {
                setErr("فشل الجلب من Google Drive API. تأكد من Public/المفتاح.");
            } finally {
                setLoading(false);
            }
        }
        fetchFolder();
    }, [selected]);

    const filteredMaterials = useMemo(() => {
        const q = matSearch.trim().toLowerCase();
        if (!q) return materials;
        return materials.filter((f) => f.name.toLowerCase().includes(q));
    }, [materials, matSearch]);

    return (
        <main
            className="min-h-screen bg-[#0f172a] bg-cover bg-center px-4 py-10 flex items-start justify-center relative"
            style={{ backgroundImage: "url('/images.jpeg')" }}
        >
            <div className="absolute inset-0 bg-[#0f172a]/85 backdrop-blur-sm z-0" />

            <div className="relative z-10 w-full max-w-6xl">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center text-yellow-400 mb-10 drop-shadow">
                    Electrical Engineering Courses
                </h2>

                {!selected && (
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
                                    onClick={() => setSelected(subj)}
                                    className="text-left block w-full"
                                >
                                    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white rounded-2xl p-4 shadow-lg border border-white/10 backdrop-blur-md transition-transform duration-200 hover:scale-105 hover:border-sky-500">
                                        <h4 className="font-bold text-sky-400 text-sm mb-1">{subj.code}</h4>
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

                {selected && (
                    <div className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl">
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={() => {
                                    setSelected(null);
                                    setMaterials([]);
                                    setMatSearch("");
                                }}
                                className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition"
                            >
                                ← Back
                            </button>
                            <h3 className="text-xl font-semibold text-sky-300">
                                {selected.code} – {selected.name}
                            </h3>
                            <a
                                href={selected.link.trim()}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-auto px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition"
                            >
                                Open in Drive
                            </a>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search materials..."
                                value={matSearch}
                                onChange={(e) => setMatSearch(e.target.value)}
                                className="w-full md:max-w-sm px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>

                        {loading && (
                            <p className="text-slate-300 text-sm mt-6">Loading materials…</p>
                        )}
                        {err && (
                            <p className="text-red-300 text-sm mt-6">{err}</p>
                        )}

                        {!loading && !err && (
                            <>
                                <p className="text-slate-400 text-sm mt-4">
                                    {filteredMaterials.length} materials
                                </p>

                                <ul className="mt-4 space-y-3">
                                    {filteredMaterials.map((file) => (
                                        <li
                                            key={file.id}
                                            className="rounded-2xl bg-gradient-to-br from-[#0b1224] to-[#0a1020] border border-white/10 p-4 flex items-center gap-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white text-sm md:text-base font-medium truncate">
                                                    {file.name}
                                                </h4>
                                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                                                    {file.size && <span>{bytesToSize(file.size)}</span>}
                                                    {file.modifiedTime && (
                                                        <span>
                                                            • {new Date(file.modifiedTime).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={buildViewLink(file)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20"
                                                >
                                                    👁️ View
                                                </a>
                                                <a
                                                    href={buildDownloadLink(file)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20"
                                                >
                                                    ⬇️ Download
                                                </a>
                                            </div>
                                        </li>
                                    ))}
                                    {filteredMaterials.length === 0 && (
                                        <li className="text-slate-400 text-sm">No files found.</li>
                                    )}
                                </ul>
                            </>
                        )}
                    </div>
                )}

                <p className="text-center text-xs text-slate-500 mt-10">© 2025 - ElecLib</p>
            </div>
        </main>
    );
}
