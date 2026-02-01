import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Folder,
  File,
  Search,
  ChevronLeft,
  X,
  Download,
} from "lucide-react";

const API_KEY = "AIzaSyCboKI_SgpSYo9ljw__npVNEFbjbFTUPcM";

function parseCourseFolder(name) {
  if (!name) return { code: "", title: "" };
  const clean = name.replace(/[–—−]/g, "-");
  const parts = clean.split("-");
  if (parts.length >= 2)
    return { code: parts[0].trim(), title: parts.slice(1).join("-").trim() };
  return { code: clean.trim(), title: "" };
}

export default function FolderView({ folderId }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const finalFolderId = folderId || paramId;

  const [rootFolderName, setRootFolderName] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [pathStack, setPathStack] = useState([]);

  const isFolder = (mime) => mime === "application/vnd.google-apps.folder";

  async function loadFolderName(id) {
    const url =
      `https://www.googleapis.com/drive/v3/files/${id}?fields=id,name&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    setRootFolderName(data.name || "");
  }

  async function loadItems(folderId) {
    setLoading(true);

    const url =
      `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false` +
      `&key=${API_KEY}&fields=files(id,name,mimeType)` +
      `&supportsAllDrives=true&includeItemsFromAllDrives=true`;

    const res = await fetch(url);
    const data = await res.json();

    setItems(data.files || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!finalFolderId) return;

    loadFolderName(finalFolderId);
    loadItems(finalFolderId);

  }, [finalFolderId]);

  function goBack() {
    if (pathStack.length > 1) {
      const s = [...pathStack];
      s.pop();
      loadItems(s[s.length - 1].id);
      setPathStack(s);
      return;
    }
    navigate("/");
  }

  function openFile(f) {
    if (isFolder(f.mimeType)) {
      setPathStack((p) => [...p, { id: f.id, name: f.name }]);
      loadItems(f.id);
      return;
    }
    setPreview(f);
    setImgError(false);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((f) => f.name.toLowerCase().includes(q));
  }, [items, search]);

  function getMediaURL(f) {
    return `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media&key=${API_KEY}`;
  }

  function getPreviewURL(f) {
    return `https://drive.google.com/file/d/${f.id}/preview`;
  }

  function getDownloadURL(f) {
    return `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media&key=${API_KEY}`;
  }

  const parsedRoot = parseCourseFolder(rootFolderName);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#f7fbff] via-[#ffffff] to-[#fff8e7]
                 text-[#111] p-6"
      dir="rtl"
    >
      {/* ------- مكتبة أثر ------- */}
      <div className="text-center mb-4">
        <h1 className="text-5xl font-extrabold">مكتبة أثر</h1>
      </div>

      {/* ------- عنوان المادة مع الأيقونة ------- */}
      <div className="flex items-center gap-3 mb-2">
        <Folder size={30} className="text-[#2f80ff]" />
        <h2 className="text-2xl font-bold">
          {parsedRoot.code} – {parsedRoot.title}
        </h2>
      </div>

      {/* ------- Breadcrumb: Root + Current Folder ------- */}
      <div className="text-sm text-[#666] mb-6">
        {/* Root */}
        <div>{pathStack[0]?.name}</div>

        {/* Current folder */}
        {pathStack.length > 1 && (
          <div className="mt-1 font-medium text-[#111] flex items-center gap-2">
            <Folder size={18} className="text-[#2f80ff]" />
            {pathStack[pathStack.length - 1].name}
          </div>
        )}
      </div>

      {/* ------- زر رجوع ------- */}
      <button
        onClick={goBack}
        className="px-5 py-2 rounded-xl bg-white border border-[#ddd]
                   hover:bg-[#f5f5f5] transition flex items-center gap-2 mb-6"
      >
        <ChevronLeft size={18} />
        رجوع
      </button>

      {/* ------- البحث ------- */}
      <div className="relative max-w-md mx-auto mb-6">
        <Search className="absolute left-3 top-3 text-[#888]" size={18} />
        <input
          type="text"
          placeholder="ابحث…"
          className="w-full bg-white border border-[#ddd] px-10 py-3 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-[#2f80ff] text-[#111]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ------- LIST ------- */}
      {!loading && (
        <div className="space-y-4">
          {filtered.map((f) => {
            const isDir = isFolder(f.mimeType);

            return (
              <div
                key={f.id}
                onClick={() => openFile(f)}
                className="flex items-center gap-3 bg-white border border-gray-200
                           rounded-2xl px-6 py-4 hover:shadow-lg hover:-translate-y-1
                           transition cursor-pointer"
              >
                {/* Icon (Right) */}
                {isDir ? (
                  <Folder size={28} className="text-[#F6C851]" />
                ) : (
                  <File size={28} className="text-[#2f80ff]" />
                )}

                {/* Text (Left) */}
                <div className="flex flex-col">
                  <span className="text-[#111] font-semibold text-sm">
                    {f.name}
                  </span>

                  <span className="text-gray-500 text-xs mt-1">
                    {isDir ? "مجلد" : "ملف"}
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center text-[#777]">لا يوجد نتائج</p>
          )}
        </div>
      )}

      {/* ------- PREVIEW ------- */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
          <div className="bg-white border border-[#ddd] rounded-2xl w-full max-w-3xl
                          overflow-hidden shadow-xl flex flex-col">

            <div className="flex justify-between items-center px-4 py-3 border-b border-[#eee]">
              <p className="text-[#111] font-medium">{preview.name}</p>
              <button
                onClick={() => setPreview(null)}
                className="p-2 bg-[#f4f4f4] hover:bg-[#eaeaea] rounded-lg"
              >
                <X />
              </button>
            </div>

            <div className="p-3 bg-[#fafafa] max-h-[70vh] overflow-auto">
              {preview.mimeType.startsWith("image/") && !imgError ? (
                <img
                  src={getMediaURL(preview)}
                  className="w-full max-h-[65vh] object-contain rounded-xl"
                  onError={() => setImgError(true)}
                />
              ) : (
                <iframe
                  src={getPreviewURL(preview)}
                  className="w-full h-[65vh] rounded-xl"
                />
              )}
            </div>

            <div className="p-4 border-t border-[#eee] flex justify-end">
              <a
                href={getDownloadURL(preview)}
                target="_blank"
                className="px-4 py-2 bg-[#2F80FF] hover:bg-[#1f6fe0] rounded-xl text-sm text-white flex items-center gap-2"
              >
                <Download size={16} /> تحميل
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
