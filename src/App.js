import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./Hero";
import FolderView from "./FolderView";
import Links from "./Links";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />} />

        {/* المجلد الإجباري */}
       <Route
  path="/mandatory"
  element={<FolderView folderId="19QUGPeHP1QuMa8dTmeVkrLd7zVh4axvk" />}
/>

<Route
  path="/others"
  element={<FolderView folderId="1mAhIsfs1LkjQXK2kTyUauGj1hgns-m5a" />}
/>


        {/* صفحة الروابط */}
        <Route path="/links" element={<Links />} />

        {/* فتح أي مجلد فرعي */}
        <Route path="/folder/:id" element={<FolderView />} />
      </Routes>
    </BrowserRouter>
  );
}
