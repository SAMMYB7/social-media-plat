import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from "./components/Home";
import { AuthProvider } from "./components/auth/AuthContext";
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount, error) => {
				// Don't retry on 401, 403, 404 errors
				if (error && typeof error === 'object' && 'status' in error) {
					const status = (error as { status: number }).status;
					if ([401, 403, 404].includes(status)) {
						return false;
					}
				}
				return failureCount < 3;
			},
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes
		},
		mutations: {
			retry: false,
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
						<Route path="/dashboard/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
						<Route path="/dashboard/professor" element={<ProtectedRoute roles={["professor"]}><ProfessorDashboard /></ProtectedRoute>} />
						<Route path="/dashboard/student" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
					</Routes>
					<Toaster position="top-right" richColors />
				</BrowserRouter>
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default App;
