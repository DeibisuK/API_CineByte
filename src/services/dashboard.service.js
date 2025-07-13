import db from '../config/db.js';

// === SERVICIO DE DASHBOARD CON DATOS REALES ===

// Función principal para obtener estadísticas del dashboard
export const getDashboardStats = async (mes = null, ano = null) => {
    try {
        const fechaFiltro = generarFiltroFecha(mes, ano);
        
        // Ejecutar todas las consultas en paralelo
        const [
            ventasDelPeriodo,
            ingresosTotales,
            peliculasPopulares,
            ventasPorMes,
            estadisticasGenerales,
            funcionesRecientes,
            topGeneros
        ] = await Promise.all([
            getVentasDelPeriodo(fechaFiltro),
            getIngresosTotales(fechaFiltro),
            getPeliculasPopulares(fechaFiltro),
            getVentasPorMes(ano),
            getEstadisticasGenerales(),
            getFuncionesRecientes(),
            getTopGeneros(fechaFiltro)
        ]);

        return {
            success: true,
            data: {
                // Estadísticas principales
                ventasDelPeriodo: ventasDelPeriodo.total_ventas || 0,
                ingresosTotales: ingresosTotales.ingresos_totales || 0,
                boletosVendidos: ventasDelPeriodo.boletos_vendidos || 0,
                clientesActivos: ventasDelPeriodo.clientes_unicos || 0,
                
                // Datos para gráficos
                peliculasPopulares: peliculasPopulares || [],
                ventasPorMes: ventasPorMes || [],
                topGeneros: topGeneros || [],
                
                // Datos adicionales
                estadisticasGenerales: estadisticasGenerales || {},
                funcionesRecientes: funcionesRecientes || [],
                
                // Filtros aplicados
                filtros: {
                    mes: mes,
                    ano: ano,
                    periodo: fechaFiltro.descripcion
                }
            }
        };
    } catch (error) {
        console.error('Error obteniendo estadísticas del dashboard:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

// Generar filtro de fecha según mes y año
const generarFiltroFecha = (mes, ano) => {
    const fechaActual = new Date();
    const anoActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1;
    
    // Si no se especifica año, usar el actual
    const anoFiltro = ano || anoActual;
    
    if (mes) {
        // Filtro por mes específico
        return {
            condicion: `EXTRACT(YEAR FROM v.fecha_venta) = $1 AND EXTRACT(MONTH FROM v.fecha_venta) = $2`,
            parametros: [anoFiltro, mes],
            descripcion: `${obtenerNombreMes(mes)} ${anoFiltro}`
        };
    } else {
        // Filtro por año completo
        return {
            condicion: `EXTRACT(YEAR FROM v.fecha_venta) = $1`,
            parametros: [anoFiltro],
            descripcion: `Año ${anoFiltro}`
        };
    }
};

// Obtener nombre del mes
const obtenerNombreMes = (numeroMes) => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[numeroMes - 1] || 'Mes inválido';
};




// === CONSULTAS ESPECÍFICAS ===

// Obtener ventas del período
const getVentasDelPeriodo = async (fechaFiltro) => {
    const query = `
        SELECT 
            COUNT(DISTINCT v.id_venta) as total_ventas,
            SUM(v.cantidad_boletos) as boletos_vendidos,
            SUM(v.total) as ingresos_totales,
            COUNT(DISTINCT v.firebase_uid) as clientes_unicos
        FROM ventas v
        WHERE v.estado = 'completada' AND ${fechaFiltro.condicion}
    `;
    
    const result = await db.query(query, fechaFiltro.parametros);
    return result.rows[0] || {};
};

// Obtener ingresos totales
const getIngresosTotales = async (fechaFiltro) => {
    const query = `
        SELECT 
            SUM(v.total) as ingresos_totales,
            SUM(v.subtotal) as subtotal_total,
            SUM(v.iva) as iva_total,
            AVG(v.total) as ticket_promedio
        FROM ventas v
        WHERE v.estado = 'completada' AND ${fechaFiltro.condicion}
    `;
    
    const result = await db.query(query, fechaFiltro.parametros);
    return result.rows[0] || {};
};

// Obtener películas más populares
const getPeliculasPopulares = async (fechaFiltro) => {
    const query = `
        SELECT 
            p.titulo,
            p.clasificacion,
            COUNT(DISTINCT v.id_venta) as total_ventas,
            SUM(v.cantidad_boletos) as boletos_vendidos,
            SUM(v.total) as ingresos_generados,
            AVG(v.total) as ticket_promedio
        FROM ventas v
        JOIN funciones f ON v.id_funcion = f.id_funcion
        JOIN peliculas p ON f.id_pelicula = p.id_pelicula
        WHERE v.estado = 'completada' AND ${fechaFiltro.condicion}
        GROUP BY p.id_pelicula, p.titulo, p.clasificacion
        ORDER BY boletos_vendidos DESC, ingresos_generados DESC
        LIMIT 10
    `;
    
    const result = await db.query(query, fechaFiltro.parametros);
    return result.rows;
};

// Obtener ventas por mes (para gráfico)
const getVentasPorMes = async (ano) => {
    const anoFiltro = ano || new Date().getFullYear();
    
    const query = `
        SELECT 
            EXTRACT(MONTH FROM v.fecha_venta) as mes,
            COUNT(DISTINCT v.id_venta) as total_ventas,
            SUM(v.cantidad_boletos) as boletos_vendidos,
            SUM(v.total) as ingresos
        FROM ventas v
        WHERE v.estado = 'completada' AND EXTRACT(YEAR FROM v.fecha_venta) = $1
        GROUP BY EXTRACT(MONTH FROM v.fecha_venta)
        ORDER BY mes
    `;
    
    const result = await db.query(query, [anoFiltro]);
    
    // Completar todos los meses del año
    const ventasPorMes = [];
    for (let mes = 1; mes <= 12; mes++) {
        const datosDelMes = result.rows.find(row => parseInt(row.mes) === mes);
        ventasPorMes.push({
            mes: mes,
            nombre_mes: obtenerNombreMes(mes),
            total_ventas: datosDelMes ? parseInt(datosDelMes.total_ventas) : 0,
            boletos_vendidos: datosDelMes ? parseInt(datosDelMes.boletos_vendidos) : 0,
            ingresos: datosDelMes ? parseFloat(datosDelMes.ingresos || 0) : 0
        });
    }
    
    return ventasPorMes;
};

// Obtener estadísticas generales
const getEstadisticasGenerales = async () => {
    const queries = [
        // Total de películas
        `SELECT COUNT(*) as total_peliculas FROM peliculas WHERE estado = 'activa'`,
        
        // Total de salas
        `SELECT COUNT(*) as total_salas FROM salas`,
        
        // Total de funciones programadas
        `SELECT COUNT(*) as total_funciones FROM funciones WHERE fecha_hora_inicio >= CURRENT_DATE`,
        
        // Usuarios registrados (aproximado, ya que están en Firebase)
        `SELECT COUNT(DISTINCT firebase_uid) as usuarios_con_compras FROM ventas`,
        
        // Capacidad total de salas
        `SELECT SUM(cantidad_asientos) as capacidad_total FROM salas`
    ];
    
    const resultados = await Promise.all(queries.map(query => db.query(query)));
    
    return {
        total_peliculas: parseInt(resultados[0].rows[0].total_peliculas) || 0,
        total_salas: parseInt(resultados[1].rows[0].total_salas) || 0,
        total_funciones: parseInt(resultados[2].rows[0].total_funciones) || 0,
        usuarios_con_compras: parseInt(resultados[3].rows[0].usuarios_con_compras) || 0,
        capacidad_total: parseInt(resultados[4].rows[0].capacidad_total) || 0
    };
};

// Obtener funciones recientes
const getFuncionesRecientes = async () => {
    const query = `
        SELECT 
            f.id_funcion,
            p.titulo as pelicula,
            s.nombre as sala,
            f.fecha_hora_inicio,
            f.fecha_hora_fin,
            i.nombre as idioma,
            f.estado,
            COUNT(v.id_venta) as ventas_realizadas,
            SUM(v.cantidad_boletos) as boletos_vendidos
        FROM funciones f
        JOIN peliculas p ON f.id_pelicula = p.id_pelicula
        JOIN salas s ON f.id_sala = s.id_sala
        LEFT JOIN idiomas i ON f.id_idioma = i.id_idioma
        LEFT JOIN ventas v ON f.id_funcion = v.id_funcion AND v.estado = 'completada'
        WHERE f.fecha_hora_inicio >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY f.id_funcion, p.titulo, s.nombre, f.fecha_hora_inicio, 
                 f.fecha_hora_fin, i.nombre, f.estado
        ORDER BY f.fecha_hora_inicio DESC
        LIMIT 10
    `;
    
    const result = await db.query(query);
    return result.rows;
};

// Obtener top géneros
const getTopGeneros = async (fechaFiltro) => {
    const query = `
        SELECT 
            g.nombre as genero,
            COUNT(DISTINCT v.id_venta) as total_ventas,
            SUM(v.cantidad_boletos) as boletos_vendidos,
            SUM(v.total) as ingresos_generados
        FROM ventas v
        JOIN funciones f ON v.id_funcion = f.id_funcion
        JOIN peliculas p ON f.id_pelicula = p.id_pelicula
        JOIN pelicula_generos pg ON p.id_pelicula = pg.id_pelicula
        JOIN generos g ON pg.id_genero = g.id_genero
        WHERE v.estado = 'completada' AND ${fechaFiltro.condicion}
        GROUP BY g.id_genero, g.nombre
        ORDER BY boletos_vendidos DESC, ingresos_generados DESC
        LIMIT 8
    `;
    
    const result = await db.query(query, fechaFiltro.parametros);
    return result.rows;
};

// === FUNCIONES PARA EXPORTACIONES CON FILTROS ===

// Modificar función de exportación para incluir filtros de fecha
export const generateExportWithFilters = async (category, reportType, format, mes = null, ano = null) => {
    try {
        const fechaFiltro = generarFiltroFecha(mes, ano);
        
        // Obtener datos según la categoría con filtros
        const data = await getDataByCategoryWithFilters(category, reportType, fechaFiltro);
        
        if (format === 'pdf') {
            const { generatePDF } = await import('./export.service.js');
            return await generatePDF(data, category, `${reportType} - ${fechaFiltro.descripcion}`);
        } else if (format === 'excel') {
            const { generateExcel } = await import('./export.service.js');
            return await generateExcel(data, category, `${reportType} - ${fechaFiltro.descripcion}`);
        } else {
            throw new Error('Formato no soportado');
        }
    } catch (error) {
        throw new Error(`Error al generar exportación con filtros: ${error.message}`);
    }
};

// Obtener datos por categoría con filtros de fecha
const getDataByCategoryWithFilters = async (category, reportType, fechaFiltro) => {
    const categoryLower = category.toLowerCase();
    const reportTypeLower = reportType.toLowerCase();
    
    let query = '';
    let params = fechaFiltro.parametros;
    
    switch (categoryLower) {
        case 'peliculas':
        case 'películas':
            if (reportTypeLower.includes('vendidas')) {
                query = `
                    SELECT p.titulo, p.descripcion, p.fecha_estreno, p.duracion_minutos, 
                           d.nombre as distribuidor, 
                           COUNT(DISTINCT v.id_venta) as total_ventas,
                           SUM(v.cantidad_boletos) as total_boletos_vendidos,
                           SUM(v.total) as ingresos_totales
                    FROM peliculas p
                    LEFT JOIN distribuidora d ON p.id_distribuidor = d.id_distribuidora
                    JOIN funciones f ON p.id_pelicula = f.id_pelicula
                    JOIN ventas v ON f.id_funcion = v.id_funcion
                    WHERE v.estado = 'completada' AND ${fechaFiltro.condicion}
                    GROUP BY p.id_pelicula, p.titulo, p.descripcion, p.fecha_estreno, 
                             p.duracion_minutos, d.nombre
                    HAVING COUNT(DISTINCT v.id_venta) > 0
                    ORDER BY total_boletos_vendidos DESC, ingresos_totales DESC
                    LIMIT 20
                `;
            }
            break;
            
        case 'ventas':
            query = `
                SELECT 
                    v.id_venta,
                    v.fecha_venta,
                    v.cantidad_boletos,
                    v.total,
                    p.titulo as pelicula,
                    s.nombre as sala,
                    DATE(f.fecha_hora_inicio) as fecha_funcion,
                    TO_CHAR(f.fecha_hora_inicio, 'HH24:MI') as hora_inicio
                FROM ventas v
                JOIN funciones f ON v.id_funcion = f.id_funcion
                JOIN peliculas p ON f.id_pelicula = p.id_pelicula
                JOIN salas s ON f.id_sala = s.id_sala
                WHERE v.estado = 'completada' AND ${fechaFiltro.condicion}
                ORDER BY v.fecha_venta DESC
                LIMIT 1000
            `;
            break;
            
        default:
            // Para otras categorías, usar las consultas originales sin filtro de fecha
            const { getDataByCategory } = await import('./export.service.js');
            return await getDataByCategory(category, reportType);
    }
    
    if (query) {
        const result = await db.query(query, params);
        return result.rows;
    }
    
    return [];
};
