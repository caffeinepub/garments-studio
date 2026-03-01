import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { Link } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut, ShieldCheck, User, Loader2 } from 'lucide-react';

export function UserDropdown() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: isAdminLoading, isFetched: isAdminFetched } = useIsCallerAdmin();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      if (error?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // Not authenticated — show plain login button
  if (!isAuthenticated) {
    return (
      <button
        onClick={handleLogin}
        disabled={isLoggingIn}
        className="flex items-center gap-1.5 font-sans text-xs tracking-studio uppercase text-muted-foreground hover:text-accent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Login"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Logging in…</span>
          </>
        ) : (
          <>
            <User className="w-3.5 h-3.5" />
            <span>Login</span>
          </>
        )}
      </button>
    );
  }

  // Authenticated — show dropdown
  const displayName = userProfile?.name || 'Account';

  // Determine admin link visibility:
  // - Show spinner while the check is in progress (loading and not yet fetched)
  // - Show Admin link if confirmed admin
  // - Show nothing if confirmed non-admin
  const showAdminLoading = isAdminLoading && !isAdminFetched;
  const showAdminLink = isAdminFetched && isAdmin === true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 font-sans text-xs tracking-studio uppercase text-muted-foreground hover:text-accent transition-colors duration-200 focus:outline-none">
          <User className="w-3.5 h-3.5" />
          <span className="max-w-[100px] truncate">{displayName}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 font-sans text-xs"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-sans text-xs tracking-studio uppercase text-muted-foreground pb-1">
          {displayName}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Show loading indicator while admin check is in progress */}
        {showAdminLoading && (
          <DropdownMenuItem disabled className="flex items-center gap-2 font-sans text-xs tracking-studio uppercase text-muted-foreground opacity-50">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Checking…
          </DropdownMenuItem>
        )}

        {/* Show admin link only when confirmed admin */}
        {showAdminLink && (
          <DropdownMenuItem asChild>
            <Link
              to="/admin"
              className="flex items-center gap-2 cursor-pointer font-sans text-xs tracking-studio uppercase text-foreground hover:text-accent"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer font-sans text-xs tracking-studio uppercase text-muted-foreground hover:text-destructive focus:text-destructive"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
