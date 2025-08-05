import { z } from 'zod';
import type { ServiceContract } from '../service-contract';

// Define schemas
const LoginRequestSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

const LoginResponseSchema = z.object({
  success: z.boolean(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string().email(),
    roles: z.array(z.string()),
  }),
});

const LogoutRequestSchema = z.object({
  refreshToken: z.string(),
});

const LogoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

const RefreshTokenResponseSchema = z.object({
  success: z.boolean(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

// Define the contract
export const AuthServiceContract: ServiceContract<AuthServiceInterface> = {
  name: 'AuthService',
  version: '1.0.0',
  methods: {
    login: {
      description: 'Authenticate user with credentials',
      input: LoginRequestSchema,
      output: LoginResponseSchema,
      errors: [
        {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid username or password',
          status: 401,
        },
        {
          code: 'AUTH_ACCOUNT_LOCKED',
          message: 'Account is locked due to too many failed attempts',
          status: 423,
        },
        {
          code: 'AUTH_RATE_LIMIT',
          message: 'Too many login attempts',
          status: 429,
        },
      ],
    },
    
    logout: {
      description: 'Logout user and invalidate tokens',
      input: LogoutRequestSchema,
      output: LogoutResponseSchema,
      errors: [
        {
          code: 'AUTH_INVALID_TOKEN',
          message: 'Invalid or expired token',
          status: 401,
        },
      ],
    },
    
    refreshToken: {
      description: 'Refresh access token using refresh token',
      input: RefreshTokenRequestSchema,
      output: RefreshTokenResponseSchema,
      errors: [
        {
          code: 'AUTH_INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
          status: 401,
        },
        {
          code: 'AUTH_TOKEN_REVOKED',
          message: 'Token has been revoked',
          status: 401,
        },
      ],
    },
  },
};

// Interface that implementations must follow
export interface AuthServiceInterface {
  login(request: z.infer<typeof LoginRequestSchema>): Promise<z.infer<typeof LoginResponseSchema>>;
  logout(request: z.infer<typeof LogoutRequestSchema>): Promise<z.infer<typeof LogoutResponseSchema>>;
  refreshToken(request: z.infer<typeof RefreshTokenRequestSchema>): Promise<z.infer<typeof RefreshTokenResponseSchema>>;
}