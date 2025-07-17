-- Script para corregir las particiones de product_movements
-- Ejecutar después de init.sql para agregar las particiones faltantes

-- Eliminar particiones incorrectas si existen
DROP TABLE IF EXISTS product_movements_y224TION CASCADE;
DROP TABLE IF EXISTS product_movements_y225TION CASCADE;
DROP TABLE IF EXISTS product_movements_y226RTITION CASCADE;

-- Crear particiones correctas para2024EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-1-1) TO ('20241EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-2-1) TO ('20241EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-3-1) TO ('20241EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-4-1) TO ('20241EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-5-1) TO ('20241EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-6-1) TO ('20241EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-7-1) TO ('20241EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-8-1) TO ('20241EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-9-1) TO ('20241EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-10-1) TO ('20241EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-11-1) TO ('20241EATE TABLE product_movements_y2024RTITION OF product_movements
    FOR VALUES FROM ('2024-12-1) TO (20251;

-- Crear particiones para 2025año actual)
CREATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-1-1) TO ('20251EATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-2-1) TO ('20251EATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-3-1) TO ('20251EATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-4-1) TO ('20251EATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-5-1) TO ('20251EATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-6-1) TO ('20251EATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-7-1) TO ('20251EATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-8-1) TO ('20251EATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-9-1) TO ('20251EATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-10-1) TO ('20251EATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-11-1) TO ('20251EATE TABLE product_movements_y2025RTITION OF product_movements
    FOR VALUES FROM ('2025-12-1) TO (20261;

-- Crear particiones para2026EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-1-1) TO ('20261EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-2-1) TO ('20261EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-3-1) TO ('20261EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-4-1) TO ('20261EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-5-1) TO ('20261EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-6-1) TO ('20261EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-7-1) TO ('20261EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-8-1) TO ('20261EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-9-1) TO ('20261EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-10-1) TO ('20261EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-11-1) TO ('20261EATE TABLE product_movements_y2026RTITION OF product_movements
    FOR VALUES FROM ('2026-12-1) TO (20271

-- Verificar que las particiones se crearon correctamente
SELECT schemaname, tablename, partitiontablename 
FROM pg_partitions 
WHERE tablename = product_movements' 
ORDER BY partitiontablename; 