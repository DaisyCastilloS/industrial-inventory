export const ALLOWED_FIELDS = {
  users: [
    'id', 'email', 'password', 'name', 'role', 'is_active', 
    'created_at', 'updated_at'
  ],
  categories: [
    'id', 'name', 'description', 'parent_id', 'is_active', 
    'created_at', 'updated_at'
  ],
  locations: [
    'id', 'name', 'description', 'zone', 'shelf', 'is_active', 
    'created_at', 'updated_at'
  ],
  suppliers: [
    'id', 'name', 'description', 'contact_person', 'email', 'phone', 
    'address', 'is_active', 'created_at', 'updated_at'
  ],
  products: [
    'id', 'name', 'description', 'sku', 'price', 'quantity', 
    'critical_stock', 'category_id', 'location_id', 'supplier_id', 
    'is_active', 'created_at', 'updated_at'
  ],
  product_movements: [
    'id', 'product_id', 'user_id', 'quantity', 'movement_type', 
    'previous_quantity', 'new_quantity', 'reason', 'created_at'
  ],
  audit_logs: [
    'id', 'table_name', 'record_id', 'action', 'old_values', 
    'new_values', 'user_id', 'ip_address', 'user_agent', 'created_at'
  ]
} as const;

export const ALLOWED_TABLES = Object.keys(ALLOWED_FIELDS);

export function validateTable(tableName: string): string {
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new Error(`Tabla no permitida: ${tableName}`);
  }
  return tableName;
}

export function validateField(tableName: string, field: string): string {
  const allowedFields = ALLOWED_FIELDS[tableName as keyof typeof ALLOWED_FIELDS];
  
  if (!allowedFields) {
    throw new Error(`Tabla no permitida: ${tableName}`);
  }
  
  if (!allowedFields.includes(field as any)) {
    throw new Error(`Campo no permitido para tabla ${tableName}: ${field}`);
  }
  
  return field;
}

export function validateOrderBy(tableName: string, orderBy: string): string {
  return validateField(tableName, orderBy);
}

export function validateOrderDirection(direction?: string): 'ASC' | 'DESC' {
  if (!direction || !['ASC', 'DESC'].includes(direction.toUpperCase())) {
    return 'ASC';
  }
  return direction.toUpperCase() as 'ASC' | 'DESC';
}

export function toSnakeCase(field: string): string {
  return field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function validatePagination(page?: number, limit?: number): {
  page: number;
  limit: number;
  offset: number;
} {
  const validPage = Math.max(1, Math.min(1000, Math.floor(Number(page) || 1)));
  const validLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
  const offset = (validPage - 1) * validLimit;
  
  return {
    page: validPage,
    limit: validLimit,
    offset
  };
}

export function validatePositiveInteger(value: any, fieldName: string): number {
  const num = Math.floor(Number(value));
  if (isNaN(num) || num < 0) {
    throw new Error(`${fieldName} debe ser un número entero positivo`);
  }
  return num;
}

export function validatePositiveDecimal(value: any, fieldName: string): number {
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    throw new Error(`${fieldName} debe ser un número decimal positivo`);
  }
  return Number(num.toFixed(2));
}

export function sanitizeLikeText(text: string): string {
  return text
    .replace(/[\\%_]/g, char => `\\${char}`)
    .replace(/'/g, "''");
}

export function buildWhereClause(
  tableName: string,
  conditions: Record<string, any>
): {
  whereClause: string;
  params: any[];
} {
  const clauses: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [field, value] of Object.entries(conditions)) {
    if (value !== undefined && value !== null) {
      const validatedField = validateField(tableName, field);
      clauses.push(`${validatedField} = $${paramIndex++}`);
      params.push(value);
    }
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  
  return {
    whereClause,
    params
  };
}

export function buildOrderByClause(
  tableName: string,
  orderBy?: string,
  orderDirection?: string
): string {
  if (!orderBy) {
    return 'ORDER BY created_at DESC';
  }

  const validatedField = validateField(tableName, orderBy);
  const validatedDirection = validateOrderDirection(orderDirection);
  
  return `ORDER BY ${validatedField} ${validatedDirection}`;
}

export function buildPaginationClause(page?: number, limit?: number): {
  clause: string;
  params: number[];
} {
  const { limit: validLimit, offset } = validatePagination(page, limit);
  
  return {
    clause: 'LIMIT $1 OFFSET $2',
    params: [validLimit, offset]
  };
}

export function buildJoinClause(
  mainTable: string,
  joins: Array<{
    table: string;
    alias?: string;
    on: string;
    type?: 'INNER' | 'LEFT' | 'RIGHT';
  }>
): string {
  return joins
    .map(join => {
      const validatedTable = validateTable(join.table);
      const joinType = join.type || 'INNER';
      const alias = join.alias ? ` AS ${join.alias}` : '';
      
      return `${joinType} JOIN ${validatedTable}${alias} ON ${join.on}`;
    })
    .join(' ');
}

export function buildSelectQuery(options: {
  tableName: string;
  fields?: string[];
  conditions?: Record<string, any>;
  orderBy?: string;
  orderDirection?: string;
  page?: number;
  limit?: number;
  joins?: Array<{
    table: string;
    alias?: string;
    on: string;
    type?: 'INNER' | 'LEFT' | 'RIGHT';
  }>;
}): {
  query: string;
  params: any[];
} {
  const validatedTable = validateTable(options.tableName);
  const validatedFields = options.fields?.map(field => 
    validateField(options.tableName, field)
  ) || ['*'];
  
  const { whereClause, params: whereParams } = buildWhereClause(
    options.tableName,
    options.conditions || {}
  );
  
  const orderByClause = buildOrderByClause(
    options.tableName,
    options.orderBy,
    options.orderDirection
  );
  
  const { clause: paginationClause, params: paginationParams } = 
    buildPaginationClause(options.page, options.limit);
  
  const joinClause = options.joins ? buildJoinClause(options.tableName, options.joins) : '';
  
  const query = `
    SELECT ${validatedFields.join(', ')}
    FROM ${validatedTable}
    ${joinClause}
    ${whereClause}
    ${orderByClause}
    ${paginationClause}
  `.trim();
  
  return {
    query,
    params: [...paginationParams, ...whereParams]
  };
} 