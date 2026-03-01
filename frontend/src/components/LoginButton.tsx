import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={isLoggingIn}
      className="flex items-center gap-1.5 font-sans text-xs tracking-studio uppercase text-muted-foreground hover:text-accent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isAuthenticated ? 'Logout' : 'Login'}
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Logging in…</span>
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </>
      ) : (
        <>
          <LogIn className="w-3.5 h-3.5" />
          <span>Login</span>
        </>
      )}
    </button>
  );
}
