import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { RegistryPage } from "./pages/RegistryPage";
import { StudentDetail } from "./pages/StudentDetail";
import { AIAnalysisPage } from "./pages/AIAnalysisPage";
import { RoutePage } from "./pages/RoutePage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { MessagesPage } from "./pages/MessagesPage";
import { StudentsDirectoryPage } from "./pages/StudentsDirectoryPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="registro" element={<RegistryPage />} />
          <Route path="students" element={<StudentsDirectoryPage />} />
          <Route path="student/:id" element={<StudentDetail />} />
          <Route path="ai-analysis" element={<AIAnalysisPage />} />
          <Route path="route" element={<RoutePage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
