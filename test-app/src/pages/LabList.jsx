import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, File, FileText, FileCode, Image as ImageIcon,
  FileArchive, FileSpreadsheet, FileAudio2, FileVideo2, Presentation,
  X, Zap, ChevronLeft, ChevronRight, Upload
} from "lucide-react";

/* ===================== إعدادات Google Drive ===================== */
const API_KEY = "AIzaSyA_yt7VNybzoM2GNsqgl196TefA8uT33Qs";
const LABS_ROOT_FOLDER_ID = "1c0xReeFi2sMXzhy-RibpObi10Qo3XG6K";

// روابط اختيارية
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdQ6L8wNp28GjRytOy06fmm6knEhDjny0TdLgHi-i1hMeA2tw/viewform";
const KAREEM_FACEBOOK_URL = "https://www.facebook.com/kareem.taha.7146";

/* ===================== Helpers ===================== */
const isFolder = (mime) => mime === "application/vnd.google-apps.folder";
const isImageFile = (f) =>
  f?.mimeType?.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test((f?.name || "").toLowerCase());

function fileTypeLabel(f) {
  if (isFolder(f.mimeType)) return "Folder";
  const n = (f.name || "").toLowerCase();
  const ext = n.includes(".") ? n.split(".").pop() : (f.mimeType?.split("/").pop() || "file");
  return ext.toUpperCase();
}

/** رابط تنزيل موحّد يعمل لكل الأنواع (صور/ملفات مباشرة/مستندات Google) */
function getUniversalDownloadLink(file) {
  if (!file) return null;
  // مستندات Google (Docs/Sheets/Slides...) — نعمل export PDF
  if (file.mimeType?.startsWith("application/vnd.google-apps")) {
    const exportMime = "application/pdf";
    return `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${encodeURIComponent(exportMime)}&key=${API_KEY}`;
  }
  // إن وجد رابط مباشر من API
  if (file.webContentLink) return file.webContentLink;
  // باقي الأنواع (صور/فيديو/Zip...) — رابط uc موثوق
  return `https://drive.google.com/uc?export=download&id=${file.id}`;
}

function pickIcon({ mime, isFolderFlag, name = "" }) {
  if (isFolderFlag) return { Icon: FolderOpen, tone: "bg-amber-500/20 text-amber-300" };
  const n = name.toLowerCase();
  if (mime?.includes("pdf") || n.endsWith(".pdf")) return { Icon: FileText, tone: "bg-rose-500/20 text-rose-300" };
  if (mime?.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/.test(n)) return { Icon: ImageIcon, tone: "bg-indigo-500/20 text-indigo-300" };
  if (mime?.startsWith("audio/") || /\.(mp3|wav|m4a|flac)$/.test(n)) return { Icon: FileAudio2, tone: "bg-fuchsia-500/20 text-fuchsia-300" };
  if (mime?.startsWith("video/") || /\.(mp4|mov|webm|mkv)$/.test(n)) return { Icon: FileVideo2, tone: "bg-violet-500/20 text-violet-300" };
  if (/\.(zip|rar|7z|tar|gz)$/i.test(n)) return { Icon: FileArchive, tone: "bg-emerald-500/20 text-emerald-300" };
  if (/\.(xlsx?|csv)$/i.test(n) || mime === "application/vnd.google-apps.spreadsheet")
    return { Icon: FileSpreadsheet, tone: "bg-lime-500/20 text-lime-300" };
  if (/\.(pptx?)$/i.test(n) || mime === "application/vnd.google-apps.presentation")
    return { Icon: Presentation, tone: "bg-orange-500/20 text-orange-300" };
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
    regex.test(part)
      ? <span key={i} className="bg-yellow-400/40 text-yellow-100 px-1 rounded">{part}</span>
      : <span key={i}>{part}</span>
  );
}

// تقسيم اسم مجلد اللاب إلى code و name
function parseLabFromFolderName(name) {
  const rx = /^\s*([A-Za-z]{3,}\d{3,})\s*[-_/:\s]+\s*(.+)\s*$/;
  const m = name?.match(rx);
  if (m) return { code: m[1].toUpperCase(), name: m[2] };
  return { code: name || "LAB", name: "" };
}

/* API: إرجاع العناصر داخل مجلد */
async function listChildren({ parentId, onlyFolders = false }) {
  const base = "https://www.googleapis.com/drive/v3/files";
  const mimeFilter = onlyFolders ? " and mimeType='application/vnd.google-apps.folder'" : "";
  const q = encodeURIComponent(`'${parentId}' in parents and trashed=false${mimeFilter}`);
  const fields = encodeURIComponent("files(id,name,mimeType,modifiedTime,webViewLink,webContentLink)");
  const url = `${base}?q=${q}&key=${API_KEY}&fields=nextPageToken,${fields}&pageSize=1000&orderBy=folder,name&supportsAllDrives=true&includeItemsFromAllDrives=true`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive HTTP ${res.status} — ${text}`);
  }
  const data = await res.json();
  return (data.files ?? []);
}

/* ===================== Component ===================== */
export default function LabsPage() {
  // بحث وقائمة اللابات
  const [search, setSearch] = useState("");
  const [labs, setLabs] = useState([]);
  const [labsLoading, setLabsLoading] = useState(false);
  const [labsErr, setLabsErr] = useState("");

  // التصفح داخل لاب
  const [selectedLab, setSelectedLab] = useState(null); // { id, code, name }
  const [pathStack, setPathStack] = useState([]); // [{id, name}]
  const [items, setItems] = useState([]);

  // أخرى
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState(null);

  // History/scroll للتحكم بالإغلاق والرجوع لنفس المكان
  const previewPushedRef = useRef(false);
  const scrollYRef = useRef(0);

  /* ===== تحميل مجلدات اللابات من مجلد الجذر ===== */
  useEffect(() => {
    async function fetchLabs() {
      if (!LABS_ROOT_FOLDER_ID) {
        setLabsErr("ضع معرف مجلد اللابات LABS_ROOT_FOLDER_ID أولاً.");
        return;
      }
      setLabsLoading(true); setLabsErr("");
      try {
        const folders = await listChildren({ parentId: LABS_ROOT_FOLDER_ID, onlyFolders: true });
        const mapped = folders.map((f) => {
          const parsed = parseLabFromFolderName(f.name);
          return { id: f.id, code: parsed.code, name: parsed.name, link: f.webViewLink };
        }).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: "base" }));
        setLabs(mapped);
      } catch (e) {
        console.error("Labs fetch failed:", e);
        setLabsErr("فشل جلب اللابات من Google Drive. تأكد من علنية المجلد وصلاحيات الـ API key.");
      } finally {
        setLabsLoading(false);
      }
    }
    fetchLabs();
  }, []);

  function resetAll() {
    setSelectedLab(null);
    setPathStack([]);
    setItems([]);
    setErr("");
    setPreview(null);
    previewPushedRef.current = false;
  }

  // استجابة زر Back في المتصفح
  useEffect(() => {
    const onPop = () => {
      if (preview) {
        setPreview(null);
        previewPushedRef.current = false;
        window.scrollTo(0, scrollYRef.current || 0);
        return;
      }
      if (pathStack.length > 1) { setPathStack((p) => p.slice(0, -1)); return; }
      if (selectedLab) { resetAll(); return; }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [preview, pathStack.length, selectedLab]);

  function backOne() {
    if (window.history.length > 1) window.history.back();
    else {
      if (preview) { setPreview(null); previewPushedRef.current = false; window.scrollTo(0, scrollYRef.current || 0); return; }
      if (pathStack.length > 1) { setPathStack((p) => p.slice(0, -1)); return; }
      if (selectedLab) { resetAll(); return; }
    }
  }

  /* ===== اختيار لاب ===== */
  function handleSelectLab(lab) {
    if (!lab?.id) return;
    setSelectedLab(lab);
    setPathStack([{ id: lab.id, name: lab.name }]);
    window.history.pushState({ type: "lab", id: lab.id }, "");
  }

  /* ===== تحميل العناصر للمجلد الحالي ===== */
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
        console.error("Folder fetch failed:", e);
        setErr("فشل تحميل محتويات المجلد من Google Drive. تحقق من العلنية وصلاحيات المفتاح.");
      } finally {
        setLoading(false);
      }
    }
    fetchFolder();
  }, [pathStack]);

  function openFolder(folder) {
    setPathStack((prev) => [...prev, { id: folder.id, name: folder.name }]);
    window.history.pushState({ type: "folder", id: folder.id }, "");
  }
  function goToLevel(index) {
    setPathStack((prev) => prev.slice(0, index + 1));
    window.history.pushState({ type: "breadcrumb", depth: index }, "");
  }

  /* ===== Preview ===== */
  // للتنقّل بالكيبورد: بين الصور فقط
  const navigableImages = useMemo(
    () => items.filter((f) => !isFolder(f.mimeType) && isImageFile(f)),
    [items]
  );

  const navAny = useCallback((dir) => {
    if (!preview || !isImageFile(preview)) return;
    const arr = navigableImages;
    const idx = arr.findIndex((x) => x.id === preview.id);
    if (idx === -1 || arr.length === 0) return;
    const next = dir === "prev" ? (idx - 1 + arr.length) % arr.length : (idx + 1) % arr.length;
    setPreview(arr[next]);
  }, [preview, navigableImages]);

  // افتح المعاينة: احفظ مكان التمرير وادفع history مرة واحدة فقط
  function openPreview(f) {
    scrollYRef.current = window.scrollY || 0;
    if (!previewPushedRef.current) {
      window.history.pushState({ type: "preview", id: f.id }, "");
      previewPushedRef.current = true;
    }
    setPreview(f);
  }

  // أغلق كل المعاينات (X أو Esc) + ارجع لنفس مكان التمرير
  function closePreviewAll() {
    setPreview(null);
    if (previewPushedRef.current) {
      window.history.back();
    }
    previewPushedRef.current = false;
    setTimeout(() => window.scrollTo(0, scrollYRef.current || 0), 0);
  }

  // كيبورد: Esc يغلق كل المعاينات + أسهم للتنقّل بين الصور
  useEffect(() => {
    if (!preview) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") { e.preventDefault(); closePreviewAll(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); navAny("prev"); }
      if (e.key === "ArrowRight") { e.preventDefault(); navAny("next"); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview, navAny]);

  /* ===== نتائج البحث للابات ===== */
  const labsList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return labs;
    return labs.filter((l) => l.code.toLowerCase().includes(q) || l.name.toLowerCase().includes(q));
  }, [search, labs]);

  /* ===================== UI ===================== */
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* خلفية فيديو مثل الهيرو */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 z-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src={process.env.PUBLIC_URL + "/videos/elec-bg.mp4"} type="video/mp4" />
      </video>

      {/* طبقة فوق الفيديو (خفيفة) */}
      <div className="fixed inset-0 z-[1] bg-transparent backdrop-blur-none" />

      <main className="relative z-10 w-full max-w-6xl text-white py-10">
        <h2
  className="
    text-4xl md:text-5xl font-extrabold tracking-tight leading-tight
    bg-gradient-to-r from-orange-400 via-orange-500 to-amber-300
    text-transparent bg-clip-text
    drop-shadow-[0_6px_20px_rgba(251,146,60,0.35)]
    text-center
  "
>
  Electrical Engineering Labs
</h2>



        {/* زر رجوع على الصفحة الرئيسية للّابات */}
        {!selectedLab && (
          <div className="mb-4 flex justify-start">
            <button
              onClick={backOne}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition"
              title="Back"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          </div>
        )}

        {/* الصفحة الرئيسية للابات */}
        {!selectedLab && (
          <>
            {/* البحث */}
            <div className="mb-6 flex justify-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code or lab name…"
                className="w-full max-w-md px-5 py-3 rounded-full text-sm bg-white/10 placeholder-white/80 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
              />
            </div>

            {/* شبكة اللابات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              <AnimatePresence>
                {labsLoading && null}

                {!labsLoading && labsErr && (
                  <p className="text-center col-span-full text-rose-300 text-sm mt-4">{labsErr}</p>
                )}

                {!labsLoading && !labsErr && labsList.map((lab) => {
                  const q = search.trim();
                  return (
                    <motion.button
                      key={lab.id}
                      onClick={() => handleSelectLab(lab)}
                      className="group text-left block w-full"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-2xl p-5 shadow-lg border border-white/10 backdrop-blur-md transition-transform duration-200 group-hover:scale-[1.03] hover:border-orange-500 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 grid place-items-center shadow-inner">
                          <Zap size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-orange-300 text-base mb-0.5">
                            {highlightMatch(lab.code, q)}
                          </h4>
                          {lab.name && (
                            <p className="text-slate-200 text-sm truncate">
                              {highlightMatch(lab.name, q)}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}

                {!labsLoading && !labsErr && labsList.length === 0 && (
                  <p className="text-center col-span-full text-slate-400 text-sm mt-4">No labs found.</p>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* مستعرض المجلدات داخل اللاب */}
        {selectedLab && (
          <motion.div
            className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl mt-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* زر Back */}
            <div className="mb-4">
              <button
                onClick={backOne}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition"
                title="Back"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            </div>

            {/* عنوان اللاب: الرمز - الاسم في سطر واحد وبشكل بارز */}
            <div className="mb-2">
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight flex flex-wrap items-baseline gap-2">
                <span className="text-orange-400">{selectedLab.code}</span>
                {selectedLab.name && (
                  <span className="text-white/90">- {selectedLab.name}</span>
                )}
              </h3>
            </div>

            {/* Breadcrumb */}
            <div className="mt-2 text-sm flex flex-wrap items-center gap-1">
              {pathStack.map((p, idx) => (
                <span key={p.id} className="flex items-center gap-1">
                  <button
                    className={`hover:underline ${idx === pathStack.length - 1 ? "text-orange-300 font-medium" : "text-slate-300"}`}
                    onClick={() => goToLevel(idx)}
                  >
                    {idx === 0 ? "Root" : p.name}
                  </button>
                  {idx < pathStack.length - 1 && <span className="text-slate-500">/</span>}
                </span>
              ))}
            </div>

            {/* حالات التحميل/الخطأ */}
            {loading && null}
            {err && <p className="text-red-300 text-sm mt-6">{err}</p>}

            {/* العناصر */}
            {!loading && !err && (
              <ul className="mt-5 space-y-3">
                <AnimatePresence>
                  {items.map((f) => {
                    const { Icon, tone } = pickIcon({ mime: f.mimeType, isFolderFlag: isFolder(f.mimeType), name: f.name });
                    const isDir = isFolder(f.mimeType);
                    const onClick = () => {
                      if (isDir) openFolder(f);
                      else { openPreview(f); }
                    };
                    return (
                      <motion.li
                        key={f.id}
                        onClick={onClick}
                        className="rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 p-4 transition hover:border-orange-500 cursor-pointer"
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
            )}
          </motion.div>
        )}

        {/* Footer – ثابت */}
        <div className="mt-10 space-y-4">
          <div className="rounded-2xl border border-orange-500/30 bg-orange-600/10 p-4 text-center">
            <p className="text-sm sm:text-base text-orange-200 font-medium">
              For suggestions or file submissions, contact{" "}
              <a
                href={KAREEM_FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-300 underline decoration-dotted underline-offset-4 hover:text-orange-200 ml-1"
                title="Open Facebook profile"
              >
                Eng. Kareem Taha
              </a>.
            </p>
          </div>

          {/* الدعاء */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-100" dir="rtl">
           <div className="text-orange-400 font-semibold mb-2 text-center">
  وأنت بتدرس، لا تنسى أهلنا في غزة
</div>

            <p className="whitespace-pre-line">
              اللهم يا رحيم، يا قوي، يا جبار، كن لأهل غزة عونًا ونصيرًا، اللهم احفظهم بحفظك، وأمنهم بأمانك، واشفِ جرحاهم،
              وتقبل شهداءهم، واربط على قلوبهم، وأبدل خوفهم أمنًا، وحزنهم فرحًا، وضعفهم قوة، اللهم عجّل لهم بالفرج والنصر المبين،
              واجعل كيد عدوهم في نحورهم، إنك وليُّ ذلكَ والقادر عليه.
            </p>
          </div>

          {/* Upload File */}
          <div className="flex justify-center">
            <a
            href={FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-400 hover:bg-orange-500 text-white text-sm transition"
            title="Upload to Pending"
          >
            <Upload size={16} />
            Upload File
          </a>
          </div>

          <p className="text-center text-xs text-slate-300">© 2025 - ElecLib</p>
        </div>
      </main>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-[95vw] md:max-w-[90vw] max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
              initial={{ scale: 0.96, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 12, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <div className="text-white font-medium pr-4 whitespace-normal break-words">{preview.name}</div>
                <button
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                  onClick={closePreviewAll}
                  title="Close Preview (Esc)"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="relative bg-neutral-950 p-3 grow">
                {isImageFile(preview) && navigableImages.length > 1 && (
                  <>
                    <button
                      onClick={() => navAny("prev")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20 z-10"
                      aria-label="Previous"
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      onClick={() => navAny("next")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20 z-10"
                      aria-label="Next"
                    >
                      <ChevronRight />
                    </button>
                  </>
                )}

                {/* نستخدم Google Drive preview عبر iframe — يعمل للصور و PDF والفيديو */}
                <iframe
                  title={preview.name}
                  src={`https://drive.google.com/file/d/${preview.id}/preview`}
                  className="w-full h-[60vh] md:h-[60vh] rounded-lg border-0"
                  allow="autoplay"
                  allowFullScreen
                />
              </div>

              {/* Footer: زر Download يظهر دائمًا */}
              <div className="p-4 flex items-center justify-end gap-2 border-t border-white/10 shrink-0">
                <a
                  href={getUniversalDownloadLink(preview)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs"
                >
                  Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
