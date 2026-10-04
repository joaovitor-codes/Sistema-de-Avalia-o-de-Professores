import { TipoUsuario, Usuario } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  cookies: {
    access_token?: string;
    [key: string]: string | undefined;
  };
  user: Usuario;
}

export interface AccessTokenPayload {
  sub: string;
  tipoUsuario: TipoUsuario;
  tokenType: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
  tokenType: 'refresh';
}
