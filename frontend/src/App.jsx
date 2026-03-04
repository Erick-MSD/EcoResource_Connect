import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Páginas (placeholders)
const Home = () => <div className="p-8"><h1 className="text-3xl font-bold">EcoResource Connect</h1><p className="mt-4">Conectando excedentes de alimentos con ONGs</p></div>;
const Login = () => <div className="p-8"><h1 className="text-2xl font-bold">Iniciar Sesión</h1></div>;
const Register = () => <div className="p-8"><h1 className="text-2xl font-bold">Registro</h1></div>;
const Dashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Dashboard</h1></div>;

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
