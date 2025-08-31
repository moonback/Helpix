import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

// Mock des modules
jest.mock('@/stores/authStore');
jest.mock('@/lib/supabase');

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock par défaut du store
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      setUser: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
    } as any);
  });

  it('devrait initialiser correctement', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('devrait vérifier la session au montage', async () => {
    const mockSetUser = jest.fn();
    const mockSetLoading = jest.fn();
    const mockSetError = jest.fn();

    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      setUser: mockSetUser,
      setLoading: mockSetLoading,
      setError: mockSetError,
    } as any);

    // Mock d'une session valide
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    } as any);

    // Mock d'un utilisateur trouvé dans la base
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-user-id', name: 'Test User' },
            error: null,
          }),
        }),
      }),
    } as any);

    renderHook(() => useAuth());

    // Attendre que la vérification de session soit terminée
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetUser).toHaveBeenCalledWith({ id: 'test-user-id', name: 'Test User' });
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('devrait gérer l\'absence de session', async () => {
    const mockSetUser = jest.fn();
    const mockSetLoading = jest.fn();

    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      setUser: mockSetUser,
      setLoading: mockSetLoading,
      setError: jest.fn(),
    } as any);

    // Mock d'aucune session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);

    renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('devrait gérer les erreurs de session', async () => {
    const mockSetUser = jest.fn();
    const mockSetLoading = jest.fn();
    const mockSetError = jest.fn();

    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      setUser: mockSetUser,
      setLoading: mockSetLoading,
      setError: mockSetError,
    } as any);

    // Mock d'une erreur de session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Erreur de session' },
    } as any);

    renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('devrait gérer les utilisateurs supprimés de la base', async () => {
    const mockSetUser = jest.fn();
    const mockSetLoading = jest.fn();

    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      setUser: mockSetUser,
      setLoading: mockSetLoading,
      setError: jest.fn(),
    } as any);

    // Mock d'une session valide
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    } as any);

    // Mock d'un utilisateur non trouvé dans la base
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Utilisateur non trouvé' },
          }),
        }),
      }),
    } as any);

    // Mock de la déconnexion
    mockSupabase.auth.signOut.mockResolvedValue({ error: null } as any);

    renderHook(() => useAuth());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });
});
