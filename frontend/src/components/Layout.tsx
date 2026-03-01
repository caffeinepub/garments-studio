import { Outlet } from '@tanstack/react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import ProfileSetupModal from './ProfileSetupModal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export function Layout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Show profile setup modal when:
  // - user is authenticated
  // - profile query has finished loading
  // - no profile exists yet
  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const handleProfileComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      <ProfileSetupModal
        open={showProfileSetup}
        onComplete={handleProfileComplete}
      />
    </div>
  );
}
