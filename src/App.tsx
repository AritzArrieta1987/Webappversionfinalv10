import { useState, useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import LoginPanel from './components/LoginPanel';
import ArtistPortal from './components/ArtistPortal';
import AdminLayout from './components/AdminLayout';
import { Toaster } from './components/Toaster';
import { HomePage } from './pages/HomePage';
import { ArtistsPage } from './pages/ArtistsPage';
import { CatalogPage } from './pages/CatalogPage';
import { ContractsPage } from './pages/ContractsPage';
import { UploadPage } from './pages/UploadPage';
import { FinancesPage } from './pages/FinancesPage';
import { PhysicalSalesPage } from './pages/PhysicalSalesPage';
import { ArtistPortalPage } from './pages/ArtistPortalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './utils/debug'; // Importar debug tools

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'artista' | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // No limpiar uploadedCSVs - queremos que persistan los datos del CSV
    
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserType(user.type);
        setUserData(user);
        setIsLoggedIn(true);
        // Información sensible removida por seguridad
      } catch (e) {
        // Si hay error parseando, limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Información sensible removida por seguridad
        setUserType(user.type);
        setUserData(user);
        setIsLoggedIn(true);
      } catch (e) {
        console.error('Error parsing user data');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserType(null);
    setUserData(null);
  };

  // Router para admin con AdminLayout
  const adminRouter = createBrowserRouter([
    {
      path: '/',
      element: <AdminLayout onLogout={handleLogout} />,
      children: [
        {
          index: true,
          element: <HomePage />
        },
        {
          path: 'artists',
          element: <ArtistsPage />
        },
        {
          path: 'catalog',
          element: <CatalogPage />
        },
        {
          path: 'contracts',
          element: <ContractsPage />
        },
        {
          path: 'upload',
          element: <UploadPage />
        },
        {
          path: 'finances',
          element: <FinancesPage />
        },
        {
          path: 'physical-sales',
          element: <PhysicalSalesPage />
        },
        {
          path: '*',
          element: <NotFoundPage />
        }
      ]
    },
    {
      path: '/artist/:artistId',
      element: <ArtistPortalPage />
    }
  ]);

  if (!isLoggedIn) {
    return <LoginPanel onLoginSuccess={handleLoginSuccess} />;
  }

  // Si es artista, mostrar el portal de artista
  if (userType === 'artista') {
    console.log('✅ Redirigiendo a Portal de Artista');
    
    // Cargar datos del artista desde localStorage (datos del CSV)
    const artists = JSON.parse(localStorage.getItem('artists') || '[]');
    const royaltiesData = JSON.parse(localStorage.getItem('royaltiesData') || '[]');
    
    // Buscar el artista por email o nombre
    const artist = artists.find(a => 
      a.email === userData?.email || 
      a.name === userData?.name
    );
    
    let artistData = {
      id: userData?.id || 0,
      name: userData?.name || 'Artista',
      email: userData?.email || '',
      totalRevenue: 0,
      totalStreams: 0,
      tracks: [],
      monthlyData: [],
      platformBreakdown: {}
    };
    
    if (artist && artist.csvData) {
      // Encontrar datos de royalties del artista
      const artistRoyalties = royaltiesData.find(r => r.artistName === artist.name);
      
      // Preparar monthlyData desde los períodos del CSV
      const monthlyData = artist.csvData.periods.map(period => ({
        month: period.period,
        revenue: period.revenue,
        streams: 0
      }));
      
      // Preparar platformBreakdown
      const platformBreakdown = {};
      artist.csvData.platforms.forEach(platform => {
        platformBreakdown[platform.name] = platform.revenue;
      });
      
      artistData = {
        id: artist.id,
        name: artist.name,
        email: artist.email,
        photo: artist.photo || '',
        totalRevenue: artist.totalRevenue,
        totalStreams: artist.totalStreams,
        tracks: artist.csvData.tracks,
        monthlyData: monthlyData,
        platformBreakdown: platformBreakdown,
        royaltyPercentage: artistRoyalties?.royaltyPercentage || 50,
        artistRoyalty: artistRoyalties?.artistRoyalty || 0,
        labelShare: artistRoyalties?.labelShare || 0
      };
    }
    
    return (
      <>
        <Toaster />
        <ArtistPortal 
          onLogout={handleLogout}
          artistData={artistData}
        />
      </>
    );
  }

  // Si es admin, mostrar el panel de administración
  console.log('✅ Redirigiendo a Panel Admin');
  return (
    <>
      <Toaster />
      <RouterProvider router={adminRouter} />
    </>
  );
}