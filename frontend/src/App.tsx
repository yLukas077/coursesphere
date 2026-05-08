import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import CoursesListPage from "./features/courses/CoursesListPage";
import CourseDetailPage from "./features/courses/CourseDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/courses" element={<CoursesListPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/courses" replace />} />
    </Routes>
  );
}
