export type ErrorCode =
  | 'AUTHENTICATION_FAILED'
  | 'INVALID_TOKEN'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'RESOURCE_NOT_FOUND'
  | 'INVALID_STATE_TRANSITION'
  | 'CONSTRAINT_VIOLATION'
  | 'MISSING_REQUIRED_DATA'
  | 'BUSINESS_LOGIC_ERROR'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  static authenticationFailed(): AppError {
    return new AppError('AUTHENTICATION_FAILED', 'Email o contraseña incorrectos', 401);
  }

  static invalidToken(): AppError {
    return new AppError('INVALID_TOKEN', 'Token no válido o expirado', 401);
  }

  static unauthorized(): AppError {
    return new AppError('UNAUTHORIZED', 'No tienes permisos para realizar esta acción', 403);
  }

  static notFound(entity: string, id: number | string): AppError {
    return new AppError('RESOURCE_NOT_FOUND', `${entity} con ID ${id} no existe`, 404);
  }

  static validationError(message: string, details?: unknown): AppError {
    return new AppError('VALIDATION_ERROR', message, 400, details);
  }

  static invalidStateTransition(entity: string, from: string, to: string): AppError {
    return new AppError(
      'INVALID_STATE_TRANSITION',
      `No se puede cambiar el estado de '${from}' a '${to}'`,
      400,
      { entity, currentState: from, requestedState: to }
    );
  }

  static constraintViolation(message: string): AppError {
    return new AppError('CONSTRAINT_VIOLATION', message, 409);
  }

  static missingRequiredData(message: string): AppError {
    return new AppError('MISSING_REQUIRED_DATA', message, 400);
  }

  static businessLogicError(message: string): AppError {
    return new AppError('BUSINESS_LOGIC_ERROR', message, 400);
  }
}
