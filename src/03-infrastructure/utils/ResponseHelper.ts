export function buildSuccessResponse(data: any, message = 'Operación exitosa') {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
}

export function buildCreatedResponse(data: any, message = 'Recurso creado exitosamente') {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
}

export function buildErrorResponse(error: any, message = 'Error en la operación') {
    return {
        success: false,
        message,
        error,
        timestamp: new Date().toISOString()
    };
}

export function buildListResponse(data: any[], message = 'Lista obtenida exitosamente') {
    return {
        success: true,
        message,
        data,
        count: data.length,
        timestamp: new Date().toISOString()
    };
}
