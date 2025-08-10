import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import MaterialsPage from './pages/SubjectList';
import LabsPage from './pages/LabList';

function App() {
    return (
        <BrowserRouter>
            <main className="bg-[#e0e7ff] min-h-screen text-gray-900">
                <Routes>
                    <Route path="/" element={<Hero />} />
                    <Route path="/subjects" element={<MaterialsPage />} />
                    <Route path="/labs" element={<LabsPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;
