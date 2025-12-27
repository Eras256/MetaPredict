import { Request, Response, NextFunction } from 'express';
import { supabasePublic } from '../lib/supabase';

// Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        walletAddress?: string;
      };
    }
  }
}

/**
 * Middleware de autenticación para validar tokens JWT de Supabase
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Authorization header must be in format: Bearer <token>'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Validar token con Supabase
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: error?.message || 'Token validation failed'
      });
    }

    // Agregar usuario al request
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: error.message 
    });
  }
}

/**
 * Middleware opcional - no falla si no hay token, pero agrega user si existe
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabasePublic.auth.getUser(token);
      
      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email,
        };
      }
    }

    next();
  } catch (error) {
    // En caso de error, continuar sin autenticación
    next();
  }
}

/**
 * Middleware para validar wallet address (para operaciones con wallets)
 */
export async function validateWallet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const walletAddress = req.body.walletAddress || req.query.walletAddress;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        error: 'Wallet address required',
        message: 'walletAddress must be provided in request body or query'
      });
    }

    // Validar formato de dirección Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ 
        error: 'Invalid wallet address format',
        message: 'Wallet address must be a valid Ethereum address (0x followed by 40 hex characters)'
      });
    }

    // Buscar o crear usuario por wallet address
    const { userService } = await import('../services/userService');
    const user = await userService.getUserByWalletAddress(walletAddress);
    
    if (user) {
      req.user = {
        id: user.id,
        walletAddress: user.wallet_address,
      };
    } else {
      // Usuario no existe, pero continuamos (se creará cuando sea necesario)
      req.user = {
        id: '', // Se asignará cuando se cree el usuario
        walletAddress: walletAddress.toLowerCase(),
      };
    }

    next();
  } catch (error: any) {
    console.error('Wallet validation error:', error);
    return res.status(500).json({ 
      error: 'Wallet validation error',
      message: error.message 
    });
  }
}

