import React, {
  FC,
  ReactNode,
  Suspense,
  useState,
  useEffect,
} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import axios from 'axios';
import { ChakraProvider, Box, Spinner } from '@chakra-ui/react';
import Login from './Login';
import HomePage from './HomePage';
import NavBar from './NavBar';
// added lazy loading
const CharCreation = React.lazy(() => import('./CharCreation'));
const Encounters = React.lazy(() => import('./Encounters'));
const Inventory = React.lazy(() => import('./Inventory'));
const Store = React.lazy(() => import('./Store'));
const MapGen = React.lazy(() => import('./MapGen'));

interface AuthCheck {
  isAuthenticated: boolean
}

interface Profile {
  id: number;
  googleId: string;
  email: string;
  name: string;
}

const App: FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get<AuthCheck>('/auth/check-auth');
        setIsAuthenticated(response.data.isAuthenticated);

        if (response.data.isAuthenticated) {
          const profileResponse = await axios.get<Profile>('/auth/me');
          setProfile(profileResponse.data);
        } else {
          setProfile(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        throw new Error('Error checking auth');
      }
    };
    checkAuth();
  }, []);

  interface ProtectedRouteProps {
    children: ReactNode;
  }

  const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <ChakraProvider>
      <Router>
        <Box bg="#CB0404" minHeight="100vh">
          {isAuthenticated && <NavBar />}
          <Suspense fallback={<Spinner color="white" size="xl" />}>
            <Routes>
              <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home" replace />} />
              <Route
                path="/home"
                element={(
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/char-creation"
                element={(
                  <ProtectedRoute>
                    <CharCreation profile={profile} />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/encounters"
                element={(
                  <ProtectedRoute>
                    <Encounters />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/inventory"
                element={(
                  <ProtectedRoute>
                    <Inventory userId={profile?.id} />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/map-gen"
                element={(
                  <ProtectedRoute>
                    <MapGen userId={profile?.id} />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/store"
                element={(
                  <ProtectedRoute>
                    <Store userId={profile?.id} />
                  </ProtectedRoute>
                )}
              />
            </Routes>
          </Suspense>
        </Box>
      </Router>
    </ChakraProvider>
  );
};

export default App;
