import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  FolderOpen, File, FileText, FileCode, Image as ImageIcon,
  FileArchive, FileSpreadsheet, FileAudio2, FileVideo2, Presentation,
  X, Zap, ChevronLeft, ChevronRight, Upload
} from "lucide-react";

/* =========================================================
   AllSubjects — Unified Back Behavior (System = UI)
   - System Back (Android/iOS) behaves EXACTLY like the in-UI Back button.
   - History: pushState on forward navigations; popstate -> backOneUI().
   - Video bg always on, mobile optimizations, paging, alt=media images.
   ========================================================= */

/* ===================== Feedback trigger helper ===================== */
const LS_TRIGGER_KEY = "eleclib_feedback_trigger";
const LS_COUNT_KEY   = "eleclib_feedback_open_count";
function bumpFeedbackCounterAndTrigger() {
  try {
    if (localStorage.getItem(LS_TRIGGER_KEY) === "1") return;
    const n = parseInt(localStorage.getItem(LS_COUNT_KEY) || "0", 10) + 1;
    localStorage.setItem(LS_COUNT_KEY, String(n));
    if (n >= 7) {
      localStorage.setItem(LS_TRIGGER_KEY, "1");
      window.dispatchEvent(new Event("eleclib:feedback"));
    }
  } catch {}
}

/********************
 * CONFIG (Subjects)
 ********************/
const API_KEY = "AIzaSyA_yt7VNybzoM2GNsqgl196TefA8uT33Qs";
const SUBJECTS_ROOT_FOLDER_ID = "1iPnlPlC-LzXE_jTn7KIk3EFD02_9cVyD"; // from your original AllSubjects

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

function getUniversalDownloadLink(file) {
  if (!file) return null;
  if (file.mimeType?.startsWith("application/vnd.google-apps")) {
    const exportMime = "application/pdf";
    return `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${encodeURIComponent(exportMime)}&key=${API_KEY}`;
  }
  if (file.webContentLink) return file.webContentLink;
  return `https://drive.google.com/uc?export=download&id=${file.id}`;
}

function getImageMediaUrl(file) {
  return `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;
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
    part.toLowerCase() === q.toLowerCase()
      ? <span key={i} className="bg-yellow-400/40 text-yellow-100 px-1 rounded">{part}</span>
      : <span key={i}>{part}</span>
  );
}

function parseEntryFromFolderName(name) {
  const rx = /^\s*([A-Za-z]{3,}\d{3,})\s*[-/_:\s]+\s*(.+)\s*$/;
  const m = name?.match(rx);
  if (m) return { code: m[1].toUpperCase(), name: m[2] };
  return { code: name || "COURSE", name: "" };
}

function useDebouncedValue(value, delay = 220) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

async function listChildren({ parentId, onlyFolders = false, signal }) {
  const base = "https://www.googleapis.com/drive/v3/files";
  const mimeFilter = onlyFolders ? " and mimeType='application/vnd.google-apps.folder'" : "";
  const q = encodeURIComponent(`'${parentId}' in parents and trashed=false${mimeFilter}`);
  const fields = encodeURIComponent("files(id,name,mimeType,modifiedTime,webViewLink,webContentLink)");
  const url = `${base}?q=${q}&key=${API_KEY}&fields=nextPageToken,${fields}&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive HTTP ${res.status} — ${text}`);
  }
  const data = await res.json();
  return (data.files ?? []);
}

/* ===================== Component ===================== */
export default function AllSubjects() {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.matchMedia?.('(pointer:coarse)').matches;
  const motionOK = !isMobile && !prefersReducedMotion;

  // بحث وقائمة المواد
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 220);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsErr, setSubjectsErr] = useState("");

  // التصفح داخل مادة
  const [selectedCourse, setSelectedCourse] = useState(null); // { id, code, name }
  const [pathStack, setPathStack] = useState([]); // [{id, name}]
  const [items, setItems] = useState([]);

  // أخرى
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState(null);
  const [imgError, setImgError] = useState(false);

  // History/scroll
  const scrollYRef = useRef(0);
  const backBusyRef = useRef(false);
  const tapGuardRef = useRef(0);

  // مرجع لأحدث نسخة من backOneUI داخل popstate
  const backRef = useRef(() => {});

  /* ===== تحميل مجلدات المواد من مجلد الجذر ===== */
  useEffect(() => {
    let controller = new AbortController();
    async function fetchSubjects() {
      if (!SUBJECTS_ROOT_FOLDER_ID) {
        setSubjectsErr("ضع معرف مجلد المواد SUBJECTS_ROOT_FOLDER_ID أولاً.");
        return;
      }
      setSubjectsLoading(true); setSubjectsErr("");
      try {
        const folders = await listChildren({ parentId: SUBJECTS_ROOT_FOLDER_ID, onlyFolders: true, signal: controller.signal });
        const mapped = folders.map((f) => {
          const parsed = parseEntryFromFolderName(f.name);
          return { id: f.id, code: parsed.code, name: parsed.name, link: f.webViewLink };
        }).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: "base" }));
        setSubjects(mapped);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error("Subjects fetch failed:", e);
          setSubjectsErr("فشل جلب المواد من Google Drive. تأكد من علنية المجلد وصلاحيات الـ API key.");
        }
      } finally {
        if (!controller.signal.aborted) setSubjectsLoading(false);
      }
    }
    fetchSubjects();
    return () => controller.abort();
  }, []);

  function resetAll() {
    setSelectedCourse(null);
    setPathStack([]);
    setItems([]);
    setErr("");
    setPreview(null);
    setImgError(false);
  }

  /* ====== توحيد سلوك Back: إعداد التاريخ + popstate ====== */
  useEffect(() => {
    // ثبّت جذر داخلي لو مافي state
    if (!window.history.state) {
      window.history.replaceState({ __eleclib: true, depth: 0 }, "");
    }

    const onPop = () => {
      if (typeof backRef.current === 'function') backRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function pushStep() {
    try { window.history.pushState({ __eleclib: true, t: Date.now() }, ""); } catch {}
  }

  /* ==== زر الرجوع داخل الواجهة ==== */
  function backOneUI() {
    if (backBusyRef.current) return;
    backBusyRef.current = true;

    // 1) إغلاق المعاينة إن كانت مفتوحة
    if (preview) {
      setPreview(null);
      requestAnimationFrame(() => window.scrollTo(0, scrollYRef.current || 0));
      backBusyRef.current = false;
      return;
    }

    // 2) التراجع مستوى داخل المجلدات
    if (pathStack.length > 1) {
      setPathStack((p) => p.slice(0, -1));
      backBusyRef.current = false;
      return;
    }

    // 3) الرجوع من داخل مادة إلى صفحة جميع المواد
    if (selectedCourse) {
      resetAll();
      backBusyRef.current = false;
      return;
    }

    // 4) على الصفحة الرئيسية: رجوع المتصفح الحقيقي
    const onPopOnce = () => {
      window.removeEventListener('popstate', onPopOnce);
      backBusyRef.current = false;
    };
    window.addEventListener('popstate', onPopOnce, { once: true });
    window.history.back();
    setTimeout(() => {
      window.removeEventListener('popstate', onPopOnce);
      if (backBusyRef.current) backBusyRef.current = false;
    }, 400);
  }

  // حافظ على أحدث نسخة في المرجع
  useEffect(() => { backRef.current = backOneUI; });

  /* ===== اختيار مادة ===== */
  function handleSelectCourse(course) {
    if (!course?.id) return;
    setSelectedCourse(course);
    setPathStack([{ id: course.id, name: course.name }]);
    pushStep(); // خطوة للأمام
  }

  /* ===== تحميل العناصر للمجلد الحالي ===== */
  useEffect(() => {
    let controller = new AbortController();
    async function fetchFolder() {
      if (!pathStack.length) return;
      setLoading(true); setErr("");
      const currentId = pathStack[pathStack.length - 1].id;
      try {
        const files = await listChildren({ parentId: currentId, onlyFolders: false, signal: controller.signal });
        const sorted = files.slice().sort((a, b) => {
          if (isFolder(a.mimeType) && !isFolder(b.mimeType)) return -1;
          if (!isFolder(a.mimeType) && isFolder(b.mimeType)) return 1;
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
        });
        setItems(sorted);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error("Folder fetch failed:", e);
          setErr("فشل تحميل محتويات المجلد من Google Drive. تحقق من العلنية وصلاحيات المفتاح.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchFolder();
    return () => controller.abort();
  }, [pathStack]);

  function openFolder(folder) {
    const next = [...pathStack, { id: folder.id, name: folder.name }];
    setPathStack(next);
    pushStep(); // خطوة للأمام
  }

  function goToLevel(index) {
    const next = pathStack.slice(0, index + 1);
    setPathStack(next);
    if (index >= pathStack.length - 1) pushStep();
  }

  /* ===== Preview (عدّلنا هنا) ===== */
  // ⬅️ تنقّل بين جميع الملفات غير المجلدات (PDF/Word/صور/فيديو…)
  const navigableAll = useMemo(
    () => items.filter((f) => !isFolder(f.mimeType)),
    [items]
  );
  const hasNav = navigableAll.length > 1;

  const navAny = useCallback((dir) => {
    if (!preview) return;
    const arr = navigableAll;
    const idx = arr.findIndex((x) => x.id === preview.id);
    if (idx === -1 || arr.length === 0) return;
    const next = dir === "prev" ? (idx - 1 + arr.length) % arr.length : (idx + 1) % arr.length;
    setPreview(arr[next]); // لا يغيّر history
  }, [preview, navigableAll]);

  function openPreview(f) {
    scrollYRef.current = window.scrollY || 0;

    const now = Date.now();
    if (now - (tapGuardRef.current || 0) < 700) return;
    tapGuardRef.current = now;

    if (isMobile && !isImageFile(f)) {
      const url = `https://drive.google.com/file/d/${f.id}/preview`;
      try { window.location.assign(url); } catch { window.location.href = url; }
      return;
    }

    setImgError(false);
    setPreview(f);
    pushStep(); // أول Back يسكر المعاينة
    bumpFeedbackCounterAndTrigger();
  }

  function closePreviewAll() {
    // الزر الداخلي يستدعي Back النظام لتوحيد السلوك 100%
    window.history.back();
  }

  useEffect(() => { setImgError(false); }, [preview?.id]);

  useEffect(() => {
    if (!preview) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") { e.preventDefault(); closePreviewAll(); return; }
      if (e.key === "ArrowLeft")  { e.preventDefault(); navAny("prev"); }
      if (e.key === "ArrowRight") { e.preventDefault(); navAny("next"); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview, navAny]);

  /* ===== نتائج البحث للمواد ===== */
  const subjectsList = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [debouncedSearch, subjects]);

  const MANY = isMobile ? 40 : 60;
  const lotsOfSubjects = subjectsList.length > MANY;
  const lotsOfItems = items.length > MANY;

  const CardShell = ({ tone, Icon, title, subtitle }) => (
    <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-2xl p-5 border border-white/10 transition hover:border-orange-500 flex items-center gap-3" style={{ contain: 'content' }}>
      <div className={`w-10 h-10 rounded-xl ${tone} grid place-items-center`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-orange-300 text-base mb-0.5">{title}</h4>
        {subtitle && <p className="text-slate-200 text-sm truncate">{subtitle}</p>}
      </div>
    </div>
  );

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 80;
  const pagedItems = useMemo(() => items.slice(0, page * PAGE_SIZE), [items, page]);
  useEffect(() => { setPage(1); }, [items]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* خلفية فيديو — مفعّلة على كل الأجهزة */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={process.env.PUBLIC_URL + "/videos/elec-bg-poster.jpg"}
        className="fixed inset-0 z-0 w-full h-full object-cover will-change-transform"
        aria-hidden="true"
      >
        <source src={process.env.PUBLIC_URL + "/videos/elec-bg.mp4"} type="video/mp4" />
      </video>

      {/* طبقة بسيطة فوق الخلفية */}
      <div className="fixed inset-0 z-[1] bg-black/30" />

      <main className="relative z-10 w-full max-w-6xl text-white py-10">
        <h2
          className="text-4xl md:text-5xl font-extrabold tracking-wide leading-normal 
                     bg-gradient-to-r from-orange-400 via-orange-500 to-amber-300 
                     text-transparent bg-clip-text 
                     drop-shadow-[0_6px_20px_rgba(251,146,60,0.35)] text-center pb-1"
        >
          Electrical Engineering Courses
        </h2>

        {/* زر رجوع على الصفحة الرئيسية للمواد */}
        {!selectedCourse && (
          <div className="mb-4 flex justify-start">
            <button
              onClick={() => window.history.back()} // توحيد السلوك
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Back"
              disabled={!!preview || !!selectedCourse || pathStack.length > 1}
            >
              <ChevronLeft size={18} />
              Back
            </button>
          </div>
        )}

        {/* الصفحة الرئيسية للمواد */}
        {!selectedCourse && (
          <>
            {/* البحث */}
            <div className="mb-6 flex justify-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code or course name…"
                className="w-full max-w-md px-5 py-3 rounded-full text-sm bg-white/10 placeholder-white/80 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* شبكة المواد */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {motionOK && !lotsOfSubjects ? (
                <AnimatePresence>
                  {subjectsLoading && <div className="col-span-full text-center text-slate-300 text-sm">Loading courses…</div>}
                  {!subjectsLoading && subjectsErr && (
                    <p className="text-center col-span-full text-rose-300 text-sm mt-4">{subjectsErr}</p>
                  )}
                  {!subjectsLoading && !subjectsErr && subjectsList.map((course) => {
                    const q = debouncedSearch.trim();
                    return (
                      <motion.button
                        key={course.id}
                        onClick={() => handleSelectCourse(course)}
                        className="group text-left block w-full"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                      >
                        <CardShell tone="bg-orange-500/20 text-orange-300" Icon={Zap} title={highlightMatch(course.code, q)} subtitle={course.name && highlightMatch(course.name, q)} />
                      </motion.button>
                    );
                  })}
                  {!subjectsLoading && !subjectsErr && subjectsList.length === 0 && (
                    <p className="text-center col-span-full text-slate-400 text-sm mt-4">No courses found.</p>
                  )}
                </AnimatePresence>
              ) : (
                <>
                  {subjectsLoading && <div className="col-span-full text-center text-slate-300 text-sm">Loading courses…</div>}
                  {!subjectsLoading && subjectsErr && (
                    <p className="text-center col-span-full text-rose-300 text-sm mt-4">{subjectsErr}</p>
                  )}
                  {!subjectsLoading && !subjectsErr && subjectsList.map((course) => {
                    const q = debouncedSearch.trim();
                    return (
                      <button key={course.id} onClick={() => handleSelectCourse(course)} className="group text-left block w-full">
                        <CardShell tone="bg-orange-500/20 text-orange-300" Icon={Zap} title={highlightMatch(course.code, q)} subtitle={course.name && highlightMatch(course.name, q)} />
                      </button>
                    );
                  })}
                  {!subjectsLoading && !subjectsErr && subjectsList.length === 0 && (
                    <p className="text-center col-span-full text-slate-400 text-sm mt-4">No courses found.</p>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* مستعرض المجلدات داخل المادة */}
        {selectedCourse && (
          <motion.div
            className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 mt-4"
            initial={motionOK ? { opacity: 0, y: 8 } : false}
            animate={motionOK ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.22 }}
          >
            {/* زر Back */}
            <div className="mb-4">
              <button
                onClick={() => window.history.back()} // توحيد السلوك
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Back"
                disabled={loading}
              >
                <ChevronLeft size={18} />
                Back
              </button>
            </div>

            {/* عنوان المادة */}
            <div className="mb-2">
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight flex flex-wrap items-baseline gap-2">
                <span className="text-orange-400">{selectedCourse.code}</span>
                {selectedCourse.name && (
                  <span className="text-white/90">- {selectedCourse.name}</span>
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
            {loading && <div className="text-center text-slate-300 text-sm mt-4">Loading…</div>}
            {err && <p className="text-red-300 text-sm mt-6">{err}</p>}

            {/* العناصر */}
            {!loading && !err && (
              <div className="mt-5">
                <ul className="space-y-3">
                  {motionOK && !lotsOfItems ? (
                    <AnimatePresence>
                      {items.map((f) => {
                        const { Icon, tone } = pickIcon({ mime: f.mimeType, isFolderFlag: isFolder(f.mimeType), name: f.name });
                        const isDir = isFolder(f.mimeType);
                        const onClick = () => { isDir ? openFolder(f) : openPreview(f); };
                        return (
                          <motion.li
                            key={f.id}
                            onClick={onClick}
                            style={{ contain: 'content' }}
                            className="rounded-2xl bg-neutral-900 border border-white/10 p-4 hover:border-orange-500 cursor-pointer"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.16 }}
                          >
                            <div className="flex gap-4">
                              <div className={`w-12 h-12 rounded-2xl grid place-items-center ${tone} shrink-0`}>
                                <Icon size={22} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white text-sm md:text-base font-medium break-words whitespace-normal sm:truncate">{f.name}</h4>
                                <div className="text-xs text-slate-400 mt-1">{fileTypeLabel(f)}</div>
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                      {items.length === 0 && <li className="text-slate-400 text-sm">No items here.</li>}
                    </AnimatePresence>
                  ) : (
                    <>
                      {pagedItems.map((f) => {
                        const { Icon, tone } = pickIcon({ mime: f.mimeType, isFolderFlag: isFolder(f.mimeType), name: f.name });
                        const isDir = isFolder(f.mimeType);
                        const onClick = () => { isDir ? openFolder(f) : openPreview(f); };
                        return (
                          <li
                            key={f.id}
                            onClick={onClick}
                            style={{ contain: 'content' }}
                            className="rounded-2xl bg-neutral-900 border border-white/10 p-4 hover:border-orange-500 cursor-pointer"
                          >
                            <div className="flex gap-4">
                              <div className={`w-12 h-12 rounded-2xl grid place-items-center ${tone} shrink-0`}>
                                <Icon size={22} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white text-sm md:text-base font-medium break-words whitespace-normal sm:truncate">{f.name}</h4>
                                <div className="text-xs text-slate-400 mt-1">{fileTypeLabel(f)}</div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                      {pagedItems.length < items.length && (
                        <li className="text-center">
                          <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20">Load more</button>
                        </li>
                      )}
                      {items.length === 0 && <li className="text-slate-400 text-sm">No items here.</li>}
                    </>
                  )}
                </ul>
              </div>
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

      {/* Preview Modal — mobile-safe overlay */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 grid place-items-center px-4"
            initial={motionOK ? { opacity: 0 } : false}
            animate={motionOK ? { opacity: 1 } : false}
            exit={motionOK ? { opacity: 0 } : false}
          >
            <div className="relative bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-[95vw] md:max-w-[90vw] max-h-[92vh] overflow-hidden shadow-xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <div className="text-white font-medium pr-4 whitespace-normal break-words">{preview.name}</div>
                {/* X أوضح */}
                <button
                  className="p-2 rounded-xl bg-orange-600 hover:bg-orange-700 ring-1 ring-white/60 text-white"
                  onClick={closePreviewAll}
                  title="Close Preview (Esc)"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="relative bg-neutral-950 p-3 grow overflow-auto">
                {/* أسهم تنقّل — تظهر فقط إذا في أكثر من ملف */}
                {hasNav && (
                  <>
                    <button
                      onClick={() => navAny("prev")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-orange-600 hover:bg-orange-700 ring-1 ring-white/60 z-10"
                      aria-label="Previous"
                      title="Previous (←)"
                    >
                      <ChevronLeft className="text-white" />
                    </button>
                    <button
                      onClick={() => navAny("next")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-orange-600 hover:bg-orange-700 ring-1 ring-white/60 z-10"
                      aria-label="Next"
                      title="Next (→)"
                    >
                      <ChevronRight className="text-white" />
                    </button>
                  </>
                )}

                {isImageFile(preview) && !imgError ? (
                  <img
                    src={getImageMediaUrl(preview)}
                    alt={preview.name}
                    className="w-full h-[60vh] md:h-[60vh] object-contain rounded-lg"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <iframe
                    title={preview?.name || 'Preview'}
                    src={`https://drive.google.com/file/d/${preview.id}/preview`}
                    className="w-full h-[60vh] md:h-[60vh] rounded-lg border-0"
                    allow="autoplay"
                    allowFullScreen
                    loading="lazy"
                  />
                )}
              </div>

              {/* Footer */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
