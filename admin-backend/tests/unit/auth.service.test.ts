import { AuthService } from '../../src/services/auth.service';
import { supabase } from '../../src/config/database.config';

// Mock Supabase
jest.mock('../../src/config/database.config');

describe('AuthService', () => {
  let authService: AuthService;
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin',
        permissions: ['view_users'],
        is_active: true,
        password_hash: '$2a$12$hashedpassword',
        last_login_at: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockAdmin,
                error: null
              })
            })
          })
        })
      } as any);

      // Mock bcrypt compare
      jest.doMock('bcryptjs', () => ({
        compare: jest.fn().mockResolvedValue(true)
      }));

      const credentials = {
        email: 'admin@test.com',
        password: 'password123'
      };

      const result = await authService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.admin.email).toBe('admin@test.com');
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for invalid credentials', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'User not found' }
              })
            })
          })
        })
      } as any);

      const credentials = {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      };

      await expect(authService.login(credentials)).rejects.toThrow('Identifiants invalides');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockSession = {
        id: 'session-123',
        admin_id: 'admin-123',
        refresh_token: 'valid-refresh-token',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      };

      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@test.com',
        role: 'admin'
      };

      // Mock session lookup
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockSession,
                  error: null
                })
              })
            })
          })
        })
      } as any);

      // Mock admin lookup
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockAdmin,
                error: null
              })
            })
          })
        })
      } as any);

      // Mock session update
      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null
          })
        })
      } as any);

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for invalid refresh token', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Session not found' }
                })
              })
            })
          })
        })
      } as any);

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow('Token de rafraîchissement invalide');
    });
  });
});
