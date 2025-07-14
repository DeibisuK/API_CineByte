import db from '../config/db.js';
import admin from '../config/firebase.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { enviarCorreoConfirmacionCompra } from './contacto.service.js';
import fs from 'fs';
import path from 'path';
import svg2img from 'svg2img';

export const generateExport = async (category, reportType, format) => {
    try {
        // Obtener datos según la categoría y tipo de reporte
        const data = await getDataByCategory(category, reportType);
        
        if (format === 'pdf') {
            return await generatePDF(data, category, reportType);
        } else if (format === 'excel') {
            return await generateExcel(data, category, reportType);
        } else {
            throw new Error('Formato no soportado');
        }
    } catch (error) {
        throw new Error(`Error al generar exportación: ${error.message}`);
    }
};

const getDataByCategory = async (category, reportType) => {
    const categoryLower = category.toLowerCase();
    const reportTypeLower = reportType.toLowerCase();
    
    let query = '';
    let params = [];
    
    // Caso especial para usuarios - usar Firebase
    if (categoryLower === 'usuarios') {
        return await getFirebaseUsers(reportTypeLower);
    }
    
    switch (categoryLower) {
        case 'peliculas':
        case 'películas':
            query = getPeliculasQuery(reportTypeLower);
            break;
        case 'actores':
            query = getActoresQuery(reportTypeLower);
            break;
        case 'generos':
        case 'géneros':
            query = getGenerosQuery(reportTypeLower);
            break;
        case 'distribuidores':
            query = getDistribuidoresQuery(reportTypeLower);
            break;
        case 'funciones':
            query = getFuncionesQuery(reportTypeLower);
            break;
        case 'salas':
            query = getSalasQuery(reportTypeLower);
            break;
        case 'sedes':
            query = getSedesQuery(reportTypeLower);
            break;
        default:
            throw new Error(`Categoría no soportada: ${category}`);
    }
    
    const result = await db.query(query, params);
    return result.rows;
};

// Función para obtener usuarios de Firebase
const getFirebaseUsers = async (reportType) => {
    try {
        const usuarios = [];
        let nextPageToken;

        // Obtener todos los usuarios de Firebase
        do {
            const result = await admin.auth().listUsers(1000, nextPageToken);
            usuarios.push(...result.users);
            nextPageToken = result.pageToken;
        } while (nextPageToken);

        // Mapear datos para el reporte
        let usuariosMapeados = usuarios.map(user => ({
            email: user.email || 'No especificado',
            nombre: user.displayName || 'No especificado',
            rol: user.customClaims?.role || 'cliente',
            proveedor: user.providerData?.map(p => p.providerId).join(', ') || 'email',
            fecha_creacion: new Date(user.metadata.creationTime).toLocaleDateString('es-ES'),
            ultimo_acceso: new Date(user.metadata.lastSignInTime || user.metadata.creationTime).toLocaleDateString('es-ES'),
            verificado: user.emailVerified ? 'Sí' : 'No',
            activo: !user.disabled ? 'Sí' : 'No'
        }));

        // Filtrar según el tipo de reporte
        switch (reportType) {
            case 'usuarios con más compras':
            case 'usuarios con mas compras':
                // Para este reporte, ordenamos por fecha de último acceso (proxy de actividad)
                usuariosMapeados = usuariosMapeados
                    .filter(u => u.ultimo_acceso !== 'Invalid Date')
                    .sort((a, b) => new Date(b.ultimo_acceso) - new Date(a.ultimo_acceso))
                    .slice(0, 50); // Top 50 usuarios más activos
                break;
            default: // Listado completo
                usuariosMapeados = usuariosMapeados.sort((a, b) => a.email.localeCompare(b.email));
                break;
        }

        return usuariosMapeados;
    } catch (error) {
        console.error('Error obteniendo usuarios de Firebase:', error);
        return [{
            error: 'Error de Firebase',
            mensaje: 'No se pudieron obtener los usuarios',
            detalle: error.message
        }];
    }
};

// Queries para Películas
const getPeliculasQuery = (reportType) => {
    switch (reportType) {
        case 'películas más vendidas':
        case 'peliculas más vendidas':
        case 'peliculas mas vendidas':
            return `
                SELECT p.titulo, p.descripcion, p.fecha_estreno, p.duracion_minutos, 
                       d.nombre as distribuidor, 
                       COUNT(DISTINCT v.id_venta) as total_ventas,
                       SUM(v.cantidad_boletos) as total_boletos_vendidos,
                       SUM(v.total) as ingresos_totales
                FROM peliculas p
                LEFT JOIN distribuidora d ON p.id_distribuidor = d.id_distribuidora
                JOIN funciones f ON p.id_pelicula = f.id_pelicula
                JOIN ventas v ON f.id_funcion = v.id_funcion
                WHERE v.estado = 'completada'
                GROUP BY p.id_pelicula, p.titulo, p.descripcion, p.fecha_estreno, 
                         p.duracion_minutos, d.nombre
                HAVING COUNT(DISTINCT v.id_venta) > 0
                ORDER BY total_boletos_vendidos DESC, ingresos_totales DESC
                LIMIT 20
            `;
        case 'por género':
        case 'por genero':
            return `
                SELECT p.titulo, p.descripcion, p.fecha_estreno, g.nombre as genero,
                       d.nombre as distribuidor, p.clasificacion
                FROM peliculas p
                JOIN pelicula_generos pg ON p.id_pelicula = pg.id_pelicula
                JOIN generos g ON pg.id_genero = g.id_genero
                LEFT JOIN distribuidora d ON p.id_distribuidor = d.id_distribuidora
                ORDER BY g.nombre, p.titulo
            `;
        default: // Listado completo
            return `
                SELECT p.titulo, p.descripcion, p.fecha_estreno, p.duracion_minutos,
                       p.estado, p.clasificacion, d.nombre as distribuidor,
                       string_agg(DISTINCT g.nombre, ', ') as generos
                FROM peliculas p
                LEFT JOIN distribuidora d ON p.id_distribuidor = d.id_distribuidora
                LEFT JOIN pelicula_generos pg ON p.id_pelicula = pg.id_pelicula
                LEFT JOIN generos g ON pg.id_genero = g.id_genero
                GROUP BY p.id_pelicula, p.titulo, p.descripcion, p.fecha_estreno, 
                         p.duracion_minutos, p.estado, p.clasificacion, d.nombre
                ORDER BY p.fecha_estreno DESC
            `;
    }
};

// Queries para Actores
const getActoresQuery = (reportType) => {
    switch (reportType) {
        case 'actores que han participado en mas películas':
        case 'actores que han participado en más películas':
            return `
                SELECT a.nombre, a.apellidos, a.fecha_nacimiento,
                       COUNT(pa.id_pelicula) as total_peliculas,
                       string_agg(p.titulo, ', ') as peliculas
                FROM actores a
                LEFT JOIN pelicula_actores pa ON a.id_actor = pa.id_actor
                LEFT JOIN peliculas p ON pa.id_pelicula = p.id_pelicula
                GROUP BY a.id_actor, a.nombre, a.apellidos, a.fecha_nacimiento
                ORDER BY total_peliculas DESC
                LIMIT 50
            `;
        default: // Listado completo
            return `
                SELECT a.nombre, a.apellidos, a.fecha_nacimiento,
                       pa.nombre as nacionalidad,
                       COUNT(pact.id_pelicula) as total_peliculas
                FROM actores a
                LEFT JOIN paises pa ON a.id_nacionalidad = pa.id_pais
                LEFT JOIN pelicula_actores pact ON a.id_actor = pact.id_actor
                GROUP BY a.id_actor, a.nombre, a.apellidos, a.fecha_nacimiento, pa.nombre
                ORDER BY a.nombre, a.apellidos
            `;
    }
};

// Queries para Géneros
const getGenerosQuery = (reportType) => {
    switch (reportType) {
        case 'generos más populares en ventas':
        case 'géneros más populares en ventas':
            return `
                SELECT g.nombre,
                       COUNT(DISTINCT v.id_venta) as total_ventas,
                       SUM(v.cantidad_boletos) as boletos_vendidos,
                       SUM(v.total) as ingresos_totales,
                       COUNT(DISTINCT p.id_pelicula) as peliculas_con_ventas
                FROM generos g
                JOIN pelicula_generos pg ON g.id_genero = pg.id_genero
                JOIN peliculas p ON pg.id_pelicula = p.id_pelicula
                JOIN funciones f ON p.id_pelicula = f.id_pelicula
                JOIN ventas v ON f.id_funcion = v.id_funcion
                WHERE v.estado = 'completada'
                GROUP BY g.id_genero, g.nombre
                HAVING COUNT(DISTINCT v.id_venta) > 0
                ORDER BY boletos_vendidos DESC, ingresos_totales DESC
            `;
        case 'generos con más películas publicadas':
        case 'géneros con más películas publicadas':
            return `
                SELECT g.nombre,
                       COUNT(p.id_pelicula) as total_peliculas,
                       string_agg(p.titulo, ', ') as peliculas_ejemplo
                FROM generos g
                JOIN pelicula_generos pg ON g.id_genero = pg.id_genero
                JOIN peliculas p ON pg.id_pelicula = p.id_pelicula
                GROUP BY g.id_genero, g.nombre
                HAVING COUNT(p.id_pelicula) > 0
                ORDER BY total_peliculas DESC
            `;
        default: // Listado completo
            return `
                SELECT g.nombre,
                       COUNT(pg.id_pelicula) as total_peliculas_asociadas
                FROM generos g
                LEFT JOIN pelicula_generos pg ON g.id_genero = pg.id_genero
                GROUP BY g.id_genero, g.nombre
                ORDER BY g.nombre
            `;
    }
};

// Queries para Distribuidores
const getDistribuidoresQuery = (reportType) => {
    switch (reportType) {
        case 'distribuidores que han publicado más películas':
            return `
                SELECT d.nombre, d.ano_fundacion, d.sitio_web,
                       COUNT(p.id_pelicula) as total_peliculas,
                       string_agg(p.titulo, ', ') as peliculas_ejemplo
                FROM distribuidora d
                LEFT JOIN peliculas p ON d.id_distribuidora = p.id_distribuidor
                GROUP BY d.id_distribuidora, d.nombre, d.ano_fundacion, d.sitio_web
                HAVING COUNT(p.id_pelicula) > 0
                ORDER BY total_peliculas DESC
            `;
        case 'distribuidores con más películas exitosas':
            return `
                SELECT d.nombre, d.ano_fundacion, d.sitio_web,
                       COUNT(DISTINCT p.id_pelicula) as peliculas_con_ventas,
                       COUNT(DISTINCT v.id_venta) as total_ventas,
                       SUM(v.cantidad_boletos) as boletos_vendidos,
                       SUM(v.total) as ingresos_totales
                FROM distribuidora d
                JOIN peliculas p ON d.id_distribuidora = p.id_distribuidor
                JOIN funciones f ON p.id_pelicula = f.id_pelicula
                JOIN ventas v ON f.id_funcion = v.id_funcion
                WHERE v.estado = 'completada'
                GROUP BY d.id_distribuidora, d.nombre, d.ano_fundacion, d.sitio_web
                HAVING COUNT(DISTINCT v.id_venta) > 0
                ORDER BY boletos_vendidos DESC, ingresos_totales DESC
            `;
        case 'distribuidores con más películas fracasadas':
            return `
                SELECT d.nombre, d.ano_fundacion, d.sitio_web,
                       COUNT(DISTINCT p.id_pelicula) as peliculas_sin_ventas
                FROM distribuidora d
                JOIN peliculas p ON d.id_distribuidora = p.id_distribuidor
                LEFT JOIN funciones f ON p.id_pelicula = f.id_pelicula
                LEFT JOIN ventas v ON f.id_funcion = v.id_funcion AND v.estado = 'completada'
                GROUP BY d.id_distribuidora, d.nombre, d.ano_fundacion, d.sitio_web
                HAVING COUNT(DISTINCT v.id_venta) = 0 AND COUNT(DISTINCT p.id_pelicula) > 0
                ORDER BY peliculas_sin_ventas DESC
            `;
        default: // Listado completo
            return `
                SELECT d.nombre, d.ano_fundacion, d.sitio_web,
                       COUNT(p.id_pelicula) as total_peliculas
                FROM distribuidora d
                LEFT JOIN peliculas p ON d.id_distribuidora = p.id_distribuidor
                GROUP BY d.id_distribuidora, d.nombre, d.ano_fundacion, d.sitio_web
                ORDER BY d.nombre
            `;
    }
};

// Queries para Funciones
const getFuncionesQuery = (reportType) => {
    switch (reportType) {
        case 'funciones con mayor asistencia':
            return `
                SELECT DATE(f.fecha_hora_inicio) as fecha, 
                       TO_CHAR(f.fecha_hora_inicio, 'HH24:MI') as hora_inicio, 
                       TO_CHAR(f.fecha_hora_fin, 'HH24:MI') as hora_fin, 
                       f.estado as tipo,
                       p.titulo as pelicula,
                       sa.cantidad_asientos as capacidad,
                       COUNT(DISTINCT v.id_venta) as ventas_realizadas,
                       SUM(v.cantidad_boletos) as boletos_vendidos,
                       ROUND((SUM(v.cantidad_boletos)::decimal / sa.cantidad_asientos) * 100, 2) as porcentaje_ocupacion
                FROM funciones f
                JOIN peliculas p ON f.id_pelicula = p.id_pelicula
                JOIN salas sa ON f.id_sala = sa.id_sala
                LEFT JOIN ventas v ON f.id_funcion = v.id_funcion AND v.estado = 'completada'
                GROUP BY f.id_funcion, f.fecha_hora_inicio, f.fecha_hora_fin, f.estado, 
                         p.titulo, sa.cantidad_asientos
                HAVING SUM(v.cantidad_boletos) > 0
                ORDER BY boletos_vendidos DESC, porcentaje_ocupacion DESC
                LIMIT 50
            `;
        case 'funciones por horario más populares':
            return `
                SELECT 
                    CASE 
                        WHEN EXTRACT(HOUR FROM f.fecha_hora_inicio) < 12 THEN 'Mañana'
                        WHEN EXTRACT(HOUR FROM f.fecha_hora_inicio) < 18 THEN 'Tarde'
                        ELSE 'Noche'
                    END as horario,
                    TO_CHAR(f.fecha_hora_inicio, 'HH24:MI') as hora_inicio, 
                    TO_CHAR(f.fecha_hora_fin, 'HH24:MI') as hora_fin,
                    COUNT(f.id_funcion) as total_funciones,
                    COUNT(DISTINCT v.id_venta) as ventas_realizadas,
                    SUM(v.cantidad_boletos) as total_boletos_vendidos
                FROM funciones f
                LEFT JOIN ventas v ON f.id_funcion = v.id_funcion AND v.estado = 'completada'
                GROUP BY 
                    CASE 
                        WHEN EXTRACT(HOUR FROM f.fecha_hora_inicio) < 12 THEN 'Mañana'
                        WHEN EXTRACT(HOUR FROM f.fecha_hora_inicio) < 18 THEN 'Tarde'
                        ELSE 'Noche'
                    END,
                    TO_CHAR(f.fecha_hora_inicio, 'HH24:MI'), 
                    TO_CHAR(f.fecha_hora_fin, 'HH24:MI')
                ORDER BY total_boletos_vendidos DESC NULLS LAST, total_funciones DESC
            `;
        case 'funciones más vendidas en los ultimos 30 días':
        case 'funciones más vendidas en los últimos 30 días':
            return `
                SELECT DATE(f.fecha_hora_inicio) as fecha, 
                       TO_CHAR(f.fecha_hora_inicio, 'HH24:MI') as hora_inicio, 
                       TO_CHAR(f.fecha_hora_fin, 'HH24:MI') as hora_fin, 
                       f.estado as tipo,
                       p.titulo as pelicula,
                       COUNT(DISTINCT v.id_venta) as ventas_realizadas,
                       SUM(v.cantidad_boletos) as boletos_vendidos,
                       SUM(v.total) as ingresos
                FROM funciones f
                JOIN peliculas p ON f.id_pelicula = p.id_pelicula
                LEFT JOIN ventas v ON f.id_funcion = v.id_funcion AND v.estado = 'completada'
                WHERE DATE(f.fecha_hora_inicio) >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY f.id_funcion, f.fecha_hora_inicio, f.fecha_hora_fin, f.estado, p.titulo
                HAVING SUM(v.cantidad_boletos) > 0
                ORDER BY boletos_vendidos DESC, ingresos DESC
                LIMIT 30
            `;
        case 'funciones por tipo':
            return `
                SELECT f.estado as tipo, 
                       COUNT(f.id_funcion) as total_funciones,
                       COUNT(DISTINCT v.id_venta) as ventas_realizadas,
                       SUM(v.cantidad_boletos) as boletos_vendidos
                FROM funciones f
                LEFT JOIN ventas v ON f.id_funcion = v.id_funcion AND v.estado = 'completada'
                GROUP BY f.estado
                ORDER BY total_funciones DESC
            `;
        default: // Listado completo
            return `
                SELECT DATE(f.fecha_hora_inicio) as fecha, 
                       TO_CHAR(f.fecha_hora_inicio, 'HH24:MI') as hora_inicio, 
                       TO_CHAR(f.fecha_hora_fin, 'HH24:MI') as hora_fin, 
                       f.estado as tipo,
                       p.titulo as pelicula
                FROM funciones f
                JOIN peliculas p ON f.id_pelicula = p.id_pelicula
                ORDER BY f.fecha_hora_inicio DESC
            `;
    }
};

// Queries para Salas
const getSalasQuery = (reportType) => {
    switch (reportType) {
        case 'salas disponibles':
            return `
                SELECT sa.nombre, sa.cantidad_asientos as capacidad, sa.tipo_sala as tipo,
                       COUNT(f.id_funcion) as funciones_programadas
                FROM salas sa
                LEFT JOIN funciones f ON sa.id_sala = f.id_sala 
                    AND DATE(f.fecha_hora_inicio) >= CURRENT_DATE
                GROUP BY sa.id_sala, sa.nombre, sa.cantidad_asientos, sa.tipo_sala
                ORDER BY sa.nombre
            `;
        case 'ocupación por sala':
        case 'ocupacion por sala':
            return `
                SELECT sa.nombre, sa.cantidad_asientos as capacidad, sa.tipo_sala as tipo,
                       COUNT(f.id_funcion) as total_funciones
                FROM salas sa
                LEFT JOIN funciones f ON sa.id_sala = f.id_sala
                GROUP BY sa.id_sala, sa.nombre, sa.cantidad_asientos, sa.tipo_sala
                ORDER BY total_funciones DESC NULLS LAST
            `;
        default: // Listado completo
            return `
                SELECT sa.nombre, sa.cantidad_asientos as capacidad, sa.tipo_sala as tipo,
                       COUNT(f.id_funcion) as total_funciones_historicas
                FROM salas sa
                LEFT JOIN funciones f ON sa.id_sala = f.id_sala
                GROUP BY sa.id_sala, sa.nombre, sa.cantidad_asientos, sa.tipo_sala
                ORDER BY sa.nombre
            `;
    }
};

// Queries para Sedes
const getSedesQuery = (reportType) => {
    switch (reportType) {
        case 'sedes principales':
            return `
                SELECT s.nombre, s.direccion as ubicacion,
                       COUNT(DISTINCT ss.id_sala) as total_salas,
                       SUM(sa.cantidad_asientos) as capacidad_total,
                       COUNT(f.id_funcion) as total_funciones
                FROM sedes s
                LEFT JOIN sede_salas ss ON s.id_sede = ss.id_sede
                LEFT JOIN salas sa ON ss.id_sala = sa.id_sala
                LEFT JOIN funciones f ON sa.id_sala = f.id_sala
                GROUP BY s.id_sede, s.nombre, s.direccion
                HAVING COUNT(DISTINCT ss.id_sala) > 0
                ORDER BY total_funciones DESC, total_salas DESC
            `;
        default: // Listado completo
            return `
                SELECT s.nombre, s.direccion as ubicacion,
                       COUNT(DISTINCT ss.id_sala) as total_salas,
                       SUM(sa.cantidad_asientos) as capacidad_total
                FROM sedes s
                LEFT JOIN sede_salas ss ON s.id_sede = ss.id_sede
                LEFT JOIN salas sa ON ss.id_sala = sa.id_sala
                GROUP BY s.id_sede, s.nombre, s.direccion
                ORDER BY s.nombre
            `;
    }
};

// Queries para Usuarios
const getUsuariosQuery = (reportType) => {
    switch (reportType) {
        case 'usuarios con más compras':
        case 'usuarios con mas compras':
            return `
                SELECT 'Usuarios' as tabla, 
                       'Sistema Firebase' as tipo_autenticacion,
                       'No disponible en base de datos local' as estado,
                       'Los usuarios se gestionan desde Firebase Authentication' as descripcion
            `;
        default: // Listado completo
            return `
                SELECT 'Usuarios' as tabla, 
                       'Sistema Firebase' as tipo_autenticacion,
                       'No disponible en base de datos local' as estado,
                       'Los usuarios se gestionan desde Firebase Authentication' as descripcion
            `;
    }
};



const generatePDF = async (data, category, reportType) => {
    return new Promise(async (resolve, reject) => {
        try {
            // === CARGAR LOGO ===
            const logoBuffer = await cargarLogoSVG();
            
            // === CONFIGURACIÓN OPTIMIZADA DEL DOCUMENTO ===
            const doc = new PDFDocument({ 
                margin: 40,
                size: 'A4',
                layout: 'portrait',
                bufferPages: false,      // Evitar buffers adicionales
                autoFirstPage: true,     // Solo crear primera página automáticamente
                compress: false          // Evitar compresión que puede generar páginas extra
            });
            const chunks = [];
            
            // Color del fondo del documento
            doc.rect(0, 0, doc.page.width, doc.page.height)
               .fill('#F8F9FA');  // Gris claro de fondo
            
            // Eventos del documento optimizados
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                resolve({
                    data: Buffer.concat(chunks),
                    filename: `CineByte_${category}_${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
                });
            });
            doc.on('error', reject);

            // === PALETA DE COLORES PROFESIONAL (INSPIRADA EN FACTURA) ===
            const colors = {
                // Header oscuro profesional
                headerDark: '#121212',        // Gris muy oscuro para header
                headerAccent: '#ffc800',      // Naranja principal del proyecto
                
                // Contenido principal
                primary: '#333',          // Texto principal
                secondary: '#585858',        // Texto secundario
                accent: '#ffc800',           // Naranja principal del proyecto
                
                // Fondos y contenedores
                cardBg: '#e7e7e7',           // Fondo de tarjetas
                tableBg: '#FFFFFF',          // Fondo de tabla
                altRow: '#f1f1f1',           // Filas alternas
                
                // Bordes y divisores
                border: '#ff0000',           // Bordes suaves
                divider: '#ffc800'           // Líneas divisoras
            };

            // === HELPER PARA RECTÁNGULOS REDONDEADOS ===
            const roundedRect = (x, y, w, h, r = 3) => {  // Redondeo reducido de 6 a 3
                doc.roundedRect(x, y, w, h, r);
                return doc;
            };

            // === HEADER PROFESIONAL ESTILO FACTURA CON LOGO ===
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;
            
            // Fondo del header con degradado simulado
            roundedRect(0, 0, pageWidth, 120, 0)
                .fill(colors.headerDark);
            
            // Banda naranja de acento
            roundedRect(0, 90, pageWidth, 8, 0)
                .fill(colors.headerAccent);
            
            // === LOGO Y TÍTULO PRINCIPAL ===
            if (logoBuffer) {
                // Agregar logo
                doc.image(logoBuffer, 50, 15, { width: 30, height: 30 });
                // Título al lado del logo
                doc.fillColor('#FFFFFF')
                   .fontSize(28)
                   .font('Helvetica-Bold')
                   .text('CineByte', 110, 25);
            } else {
                // Sin logo, solo título
                doc.fillColor('#FFFFFF')
                   .fontSize(28)
                   .font('Helvetica-Bold')
                   .text('CineByte', 50, 25);
            }
               
            doc.fontSize(12)
               .font('Helvetica')
               .fillColor('#E2E8F0')
               .text('Sistema de Gestión Cinematográfica', logoBuffer ? 110 : 50, 60);

            // Info de documento en la esquina derecha
            const infoBoxX = pageWidth - 200;
            roundedRect(infoBoxX, 25, 170, 50, 3)  // Redondeo reducido
                .fill('#FFFFFF');
                
            doc.fillColor(colors.primary)
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('REPORTE GENERADO', infoBoxX + 15, 35)
               .fontSize(9)
               .font('Helvetica')
               .text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, infoBoxX + 15, 50)
               .text(`Hora: ${new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}`, infoBoxX + 15, 62);

            let currentY = 140;

            // === INFORMACIÓN DEL REPORTE (ESTILO FACTURA) ===
            // Contenedor principal del reporte
            roundedRect(40, currentY, pageWidth - 80, 70, 5)  // Redondeo reducido
                .fill(colors.cardBg);
                
            // Banda lateral de color
            roundedRect(45, currentY + 5, 6, 60, 2)  // Redondeo reducido
                .fill(colors.accent);
                
            doc.fillColor(colors.primary)
               .fontSize(18)
               .font('Helvetica-Bold')
               .text(category.toUpperCase(), 65, currentY + 15);
               
            doc.fontSize(14)
               .font('Helvetica')
               .fillColor(colors.secondary)
               .text(reportType, 65, currentY + 40);

            currentY += 90;

            // === RESUMEN EJECUTIVO ===
            // Caja de estadísticas destacada
            roundedRect(40, currentY, pageWidth - 80, 45, 5)  // Redondeo reducido
                .fill(colors.accent);
                
            doc.fillColor('#FFFFFF')
               .fontSize(14)
               .font('Helvetica-Bold')
               .text(`TOTAL DE REGISTROS: ${data.length}`, 60, currentY + 20);

            currentY += 65;

            // === TABLA DE DATOS PROFESIONAL ===
            if (data.length === 0) {
                // Estado vacío elegante
                roundedRect(40, currentY, pageWidth - 80, 80, 5)  // Redondeo reducido
                    .fill('#FFF8E1');
                    
                doc.fillColor('#F57C00')
                   .fontSize(14)
                   .font('Helvetica-Bold')
                   .text('Sin datos disponibles', 60, currentY + 35, {
                       width: pageWidth - 120,
                       align: 'center'
                   });
                
                // Asegurar que no se agreguen páginas extra cuando no hay datos
                currentY += 80;
            } else {
                const headers = Object.keys(data[0]);
                const tableWidth = pageWidth - 80;
                const colWidth = tableWidth / headers.length;
                const rowHeight = 25;
                
                // === ENCABEZADOS DE TABLA ===
                roundedRect(40, currentY, tableWidth, rowHeight, 4)  // Redondeo reducido
                    .fill(colors.headerDark);
                
                doc.fillColor('#FFFFFF')
                   .fontSize(9)
                   .font('Helvetica-Bold');
                
                headers.forEach((header, idx) => {
                    const x = 50 + (idx * colWidth);
                    const displayHeader = header.toUpperCase().replace(/_/g, ' ');
                    doc.text(displayHeader, x, currentY + 10, {
                        width: colWidth - 10,
                        align: 'left',
                        ellipsis: true
                    });
                });
                
                currentY += rowHeight;
                
                // === FILAS DE DATOS CON CONTROL ULTRA-ESTRICTO DE PÁGINAS ===
                data.forEach((row, rowIndex) => {
                    // Control más estricto - verificar si necesitamos nueva página con margen mayor
                    if (currentY + rowHeight > pageHeight - 140) {  // Margen más grande
                        doc.addPage();
                        
                        // Color del fondo del documento en nueva página
                        doc.rect(0, 0, doc.page.width, doc.page.height)
                           .fill('#F8F9FA');  // Gris claro de fondo
                           
                        currentY = 50;
                        
                        // Mini-header en nueva página
                        roundedRect(40, currentY, tableWidth, rowHeight, 4)  // Redondeo reducido
                            .fill(colors.headerDark);
                        
                        doc.fillColor('#FFFFFF')
                           .fontSize(9)
                           .font('Helvetica-Bold');
                        
                        headers.forEach((header, idx) => {
                            const x = 50 + (idx * colWidth);
                            const displayHeader = header.toUpperCase().replace(/_/g, ' ');
                            doc.text(displayHeader, x, currentY + 10, {
                                width: colWidth - 10,
                                align: 'left',
                                ellipsis: true
                            });
                        });
                        
                        currentY += rowHeight;
                    }
                    
                    // Fila de datos con alternancia visual
                    const bgColor = rowIndex % 2 === 0 ? colors.tableBg : colors.altRow;
                    roundedRect(40, currentY, tableWidth, rowHeight, 2)  // Redondeo reducido
                        .fill(bgColor);
                    
                    // Contenido de celdas
                    doc.fillColor(colors.primary)
                       .fontSize(8)
                       .font('Helvetica');
                    
                    headers.forEach((header, colIdx) => {
                        let cellValue = row[header];
                        
                        // Formateo de datos limpio
                        if (cellValue === null || cellValue === undefined) {
                            cellValue = '-';
                        } else if (typeof cellValue === 'boolean') {
                            cellValue = cellValue ? 'Sí' : 'No';
                        } else if (typeof cellValue === 'number') {
                            cellValue = cellValue.toLocaleString('es-ES');
                        } else {
                            cellValue = String(cellValue);
                            // Truncar texto largo elegantemente
                            if (cellValue.length > 35) {
                                cellValue = cellValue.substring(0, 32) + '...';
                            }
                        }
                        
                        const x = 50 + (colIdx * colWidth);
                        doc.text(cellValue, x, currentY + 9, {
                            width: colWidth - 10,
                            align: 'left',
                            ellipsis: true
                        });
                    });
                    
                    currentY += rowHeight;
                });
            }

            // === FOOTER PROFESIONAL ===
            // Solo agregar footer si hay espacio suficiente, sino saltar el footer
            const footerY = pageHeight - 80;  // Margen para footer
            
            if (currentY <= footerY - 20) {  // Solo si hay espacio suficiente
                // Línea divisoria elegante
                doc.strokeColor(colors.accent)
                   .lineWidth(2)
                   .moveTo(40, footerY)
                   .lineTo(pageWidth - 40, footerY)
                   .stroke();
                
                // Información de la empresa
                doc.fillColor(colors.secondary)
                   .fontSize(8)
                   .font('Helvetica')
                   .text('CineByte - Sistema de Gestión Cinematográfica', 40, footerY + 15)
                   .text(`Página 1 | Generado el ${new Date().toLocaleString('es-ES')}`, 40, footerY + 30);
                
                // Contacto en la derecha
                doc.text('www.cinebyte.com | contacto@cinebyte.com', pageWidth - 250, footerY + 15);
            }

            // FINALIZAR DOCUMENTO SIN PÁGINAS EXTRA - MÉTODO DEFINITIVO
            // NO usar flushPages() ya que puede causar páginas extra
            doc.end();
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            reject(error);
        }
    });
};

const generateExcel = async (data, category, reportType) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${category} - ${reportType}`);
        
        if (data.length === 0) {
            worksheet.addRow(['No hay datos disponibles para este reporte']);
            worksheet.getCell('A1').font = { bold: true };
        } else {
            // Encabezados
            const headers = Object.keys(data[0]);
            const headerRow = worksheet.addRow(headers.map(h => h.toUpperCase()));
            
            // Estilo para encabezados
            headerRow.eachCell(cell => {
                cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF366092' }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
            
            // Datos
            data.forEach(row => {
                const rowData = headers.map(header => {
                    let value = row[header];
                    if (value === null || value === undefined) {
                        return 'N/A';
                    }
                    return value;
                });
                
                const dataRow = worksheet.addRow(rowData);
                dataRow.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });
            
            // Ajustar ancho de columnas
            headers.forEach((header, index) => {
                const column = worksheet.getColumn(index + 1);
                const maxLength = Math.max(
                    header.length,
                    ...data.map(row => String(row[header] || '').length)
                );
                column.width = Math.min(Math.max(maxLength + 2, 10), 50);
            });
        }
        
        // Información del reporte
        worksheet.insertRow(1, [`Reporte: ${category} - ${reportType}`]);
        worksheet.insertRow(2, [`Fecha: ${new Date().toLocaleDateString('es-ES')}`]);
        worksheet.insertRow(3, [`Total de registros: ${data.length}`]);
        worksheet.insertRow(4, []); // Fila vacía
        
        // Estilo para la información del reporte
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A2').font = { italic: true };
        worksheet.getCell('A3').font = { italic: true };
        
        const buffer = await workbook.xlsx.writeBuffer();
        
        return {
            data: buffer,
            filename: `${category}_${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
        };
    } catch (error) {
        throw new Error(`Error al generar Excel: ${error.message}`);
    }
};

export const getAvailableReports = async () => {
    return {
        categories: [
            'Peliculas', 'Actores', 'Generos', 'Distribuidores', 
            'Funciones', 'Salas', 'Sedes', 'Usuarios'
        ],
        formats: ['pdf', 'excel']
    };
};

export const generarFacturaPDF = async (ventaId, firebase_uid) => {
    try {
        // === VALIDACIÓN DE PARÁMETROS ===
        if (!ventaId || !firebase_uid) {
            throw new Error('ID de venta y UID de Firebase son requeridos');
        }
        
        // === OBTENER DATOS DEL USUARIO DE FIREBASE ===
        let datosUsuario = {
            nombre: 'Cliente',
            email: 'N/A'
        };
        
        try {
            const usuarioFirebase = await admin.auth().getUser(firebase_uid);
            datosUsuario = {
                nombre: usuarioFirebase.displayName || usuarioFirebase.email?.split('@')[0] || 'Cliente',
                email: usuarioFirebase.email || 'N/A'
            };
        } catch (error) {
            console.warn('Error obteniendo datos de Firebase, usando valores por defecto:', error.message);
        }
        
        // Obtener datos completos de la venta con JOIN mejorado
        const query = `
            SELECT 
                v.id_venta,
                v.firebase_uid,
                v.id_funcion,
                v.fecha_venta,
                v.cantidad_boletos,
                v.subtotal,
                v.iva,
                v.total,
                v.estado as venta_estado,
                
                -- Datos de la factura
                f.id_factura,
                f.numero_factura,
                f.fecha_emision,
                f.cliente_nombre,
                f.cliente_email,
                f.cliente_telefono,
                f.pelicula_titulo,
                f.sala_nombre,
                f.fecha_funcion,
                f.hora_inicio,
                f.hora_fin,
                f.idioma,
                f.subtotal as factura_subtotal,
                f.iva_valor,
                f.total as factura_total,
                
                -- Datos del pago
                p.id_pago,
                p.id_metodo_pago,
                p.monto,
                p.fecha_pago,
                
                -- Datos de asientos
                CONCAT(a.fila, a.columna) as numero_asiento,
                va.precio_unitario,
                
                -- Datos de detalles de factura
                fd.descripcion as detalle_descripcion,
                fd.cantidad as detalle_cantidad,
                fd.precio_unitario as detalle_precio_unitario,
                fd.subtotal as detalle_subtotal,
                
                -- Datos REALES de función y película
                pel.titulo as pelicula_titulo_real,
                sal.nombre as sala_nombre_real,
                fun.fecha_hora_inicio,
                fun.fecha_hora_fin,
                i.nombre as idioma_real,
                TO_CHAR(fun.fecha_hora_inicio, 'HH24:MI') as hora_inicio_real,
                TO_CHAR(fun.fecha_hora_fin, 'HH24:MI') as hora_fin_real,
                DATE(fun.fecha_hora_inicio) as fecha_funcion_real
                
            FROM ventas v
            LEFT JOIN facturas f ON v.id_venta = f.id_venta
            LEFT JOIN pagos p ON v.id_venta = p.id_venta
            LEFT JOIN venta_asientos va ON v.id_venta = va.id_venta
            LEFT JOIN asientos a ON va.id_asiento = a.id_asiento
            LEFT JOIN factura_detalles fd ON f.id_factura = fd.id_factura
            -- JOINs adicionales para obtener datos reales
            LEFT JOIN funciones fun ON v.id_funcion = fun.id_funcion
            LEFT JOIN peliculas pel ON fun.id_pelicula = pel.id_pelicula
            LEFT JOIN salas sal ON fun.id_sala = sal.id_sala
            LEFT JOIN idiomas i ON fun.id_idioma = i.id_idioma
            WHERE v.id_venta = $1 AND v.firebase_uid = $2
            ORDER BY va.id_venta, va.id_asiento, fd.id_detalle
        `;
        
        const result = await db.query(query, [ventaId, firebase_uid]);
        
        if (result.rows.length === 0) {
            throw new Error('Venta no encontrada o no pertenece al usuario');
        }
        
        // Agrupar datos
        let ventaData = result.rows[0];
        
        // === COMBINAR DATOS DE FIREBASE CON DATOS DE BD ===
        ventaData = {
            ...ventaData,
            cliente_nombre: datosUsuario.nombre,
            cliente_email: datosUsuario.email,
            // Usar datos reales de la función si están disponibles
            pelicula_titulo: ventaData.pelicula_titulo_real || ventaData.pelicula_titulo || 'N/A',
            sala_nombre: ventaData.sala_nombre_real || ventaData.sala_nombre || 'N/A',
            hora_inicio: ventaData.hora_inicio_real || ventaData.hora_inicio || 'N/A',
            hora_fin: ventaData.hora_fin_real || ventaData.hora_fin || 'N/A',
            fecha_funcion: ventaData.fecha_funcion_real || ventaData.fecha_funcion || new Date(),
            idioma: ventaData.idioma_real || ventaData.idioma || 'N/A'
        };
        
        // === PROCESAR ASIENTOS SIN DUPLICADOS ===
        const asientos = result.rows
            .filter(row => row.numero_asiento)
            .reduce((acc, row) => {
                const existe = acc.find(a => a.numero_asiento === row.numero_asiento);
                if (!existe) {
                    acc.push({
                        numero_asiento: row.numero_asiento,
                        precio_unitario: parseFloat(row.precio_unitario) || 0
                    });
                }
                return acc;
            }, []);
        
        // === PROCESAR DETALLES SIN DUPLICADOS ===
        const detalles = result.rows
            .filter(row => row.detalle_descripcion)
            .reduce((acc, row) => {
                const existe = acc.find(d => 
                    d.descripcion === row.detalle_descripcion && 
                    d.precio_unitario === row.detalle_precio_unitario
                );
                if (!existe) {
                    acc.push({
                        descripcion: row.detalle_descripcion,
                        cantidad: parseInt(row.detalle_cantidad) || 1,
                        precio_unitario: parseFloat(row.detalle_precio_unitario) || 0,
                        subtotal: parseFloat(row.detalle_subtotal) || 0
                    });
                }
                return acc;
            }, []);
        
        // === ENVIAR CORREO DE CONFIRMACIÓN ===
        try {
            if (datosUsuario.email && datosUsuario.email !== 'N/A') {
                await enviarCorreoConfirmacionCompra({
                    emailCliente: datosUsuario.email,
                    nombreCliente: datosUsuario.nombre,
                    pelicula: ventaData.pelicula_titulo,
                    sala: ventaData.sala_nombre,
                    fechaFuncion: ventaData.fecha_funcion,
                    horarioInicio: ventaData.hora_inicio,
                    horarioFin: ventaData.hora_fin,
                    asientos: asientos,
                    total: ventaData.total || ventaData.factura_total || 0,
                    numeroFactura: ventaData.numero_factura || ventaData.id_venta
                });
            }
        } catch (emailError) {
            console.warn('Error enviando correo de confirmación:', emailError.message);
            // No lanzar error, continuar con la generación del PDF
        }
        
        // === GENERAR PDF CON CONFIGURACIÓN OPTIMIZADA ===
        const pdfBuffer = await generarFacturaPDFBuffer({
            venta: ventaData,
            asientos,
            detalles
        });
        
        const filename = `Factura_${ventaData.numero_factura || ventaData.id_venta}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        return {
            data: pdfBuffer,
            filename
        };
        
    } catch (error) {
        console.error('Error generando factura PDF:', error);
        throw new Error(`Error al generar factura PDF: ${error.message}`);
    }
};

// Función para generar el buffer del PDF de factura - OPTIMIZADA PARA EVITAR PÁGINAS EN BLANCO
const generarFacturaPDFBuffer = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // === CARGAR LOGO ===
            const logoBuffer = await cargarLogoSVG();
            
            // === CONFIGURACIÓN CRÍTICA PARA EVITAR PÁGINAS EN BLANCO ===
            const doc = new PDFDocument({ 
                margin: 40,
                size: 'A4',
                layout: 'portrait',
                bufferPages: false,      // CRÍTICO: No usar buffer de páginas
                autoFirstPage: true,     // Solo crear primera página
                compress: false          // Evitar compresión que puede generar páginas extra
            });
            
            const chunks = [];
            
            // === EVENTOS OPTIMIZADOS ===
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);
            
            // === PALETA DE COLORES ===
            const colors = {
                headerDark: '#121212',
                headerAccent: '#ffc800',
                primary: '#333',
                secondary: '#585858',
                accent: '#ffc800',
                cardBg: '#e7e7e7',
                tableBg: '#FFFFFF',
                altRow: '#f1f1f1'
            };

            // === HELPER PARA RECTÁNGULOS REDONDEADOS ===
            const roundedRect = (x, y, w, h, r = 3) => {
                doc.roundedRect(x, y, w, h, r);
                return doc;
            };

            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;
            
            // === CALCULAR EL CONTENIDO TOTAL ANTES DE EMPEZAR ===
            const headerHeight = 120;
            const infoSectionHeight = 160;
            const funcionHeight = 110;
            const tableHeaderHeight = 25;
            const itemsCount = Math.max(data.detalles?.length || 0, data.asientos?.length || 0, 1);
            const itemsHeight = itemsCount * 25;
            const totalesHeight = 80;
            const footerHeight = 80;
            
            const totalContentHeight = headerHeight + infoSectionHeight + funcionHeight + 
                                     tableHeaderHeight + itemsHeight + totalesHeight + footerHeight;
            
            // Color del fondo del documento
            doc.rect(0, 0, pageWidth, pageHeight).fill('#F8F9FA');

            // === HEADER PROFESIONAL ===
            roundedRect(0, 0, pageWidth, 120, 0).fill(colors.headerDark);
            roundedRect(0, 90, pageWidth, 8, 0).fill(colors.headerAccent);
            
            // === LOGO Y TÍTULO ===
            if (logoBuffer) {
                doc.image(logoBuffer, 50, 15, { width: 30, height: 30 });
                doc.fillColor('#FFFFFF').fontSize(28).font('Helvetica-Bold').text('CineByte', 110, 25);
            } else {
                doc.fillColor('#FFFFFF').fontSize(28).font('Helvetica-Bold').text('CineByte', 50, 25);
            }
               
            doc.fontSize(12).font('Helvetica').fillColor('#E2E8F0')
               .text('Sistema de Gestión Cinematográfica', logoBuffer ? 110 : 50, 60);

            // Info de documento en la esquina derecha
            const infoBoxX = pageWidth - 200;
            roundedRect(infoBoxX, 25, 170, 50, 3).fill('#FFFFFF');
                
            doc.fillColor(colors.primary).fontSize(10).font('Helvetica-Bold')
               .text('FACTURA GENERADA', infoBoxX + 15, 35)
               .fontSize(9).font('Helvetica')
               .text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, infoBoxX + 15, 50)
               .text(`Hora: ${new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}`, infoBoxX + 15, 62);

            let currentY = 140;

            // === INFORMACIÓN DEL REPORTE ===
            roundedRect(40, currentY, pageWidth - 80, 70, 5).fill(colors.cardBg);
            roundedRect(45, currentY + 5, 6, 60, 2).fill(colors.accent);
                
            doc.fillColor(colors.primary).fontSize(18).font('Helvetica-Bold')
               .text('FACTURA DE COMPRA', 65, currentY + 15);
               
            doc.fontSize(14).font('Helvetica').fillColor(colors.secondary)
               .text(`Número: ${data.venta.numero_factura || data.venta.id_venta}`, 65, currentY + 40);

            currentY += 90;

            // === INFORMACIÓN EMPRESA Y CLIENTE ===
            roundedRect(40, currentY, (pageWidth - 80) / 2 - 10, 80, 5).fill(colors.tableBg);
                
            doc.fillColor(colors.primary).fontSize(12).font('Helvetica-Bold')
               .text('INFORMACIÓN DE LA EMPRESA', 50, currentY + 10);
            
            doc.font('Helvetica').fontSize(10)
               .text('CineByte S.A.S', 50, currentY + 30)
               .text('contacto@cinebyte.com', 50, currentY + 45)
               .text('Tel: (+593) 96 812 2692', 50, currentY + 60);

            const clienteX = 40 + (pageWidth - 80) / 2 + 10;
            roundedRect(clienteX, currentY, (pageWidth - 80) / 2 - 10, 80, 5).fill(colors.tableBg);
                
            doc.fillColor(colors.primary).fontSize(12).font('Helvetica-Bold')
               .text('INFORMACIÓN DEL CLIENTE', clienteX + 10, currentY + 10);
            
            doc.font('Helvetica').fontSize(10)
               .text(`Nombre: ${data.venta.cliente_nombre || 'Cliente'}`, clienteX + 10, currentY + 30)
               .text(`Email: ${data.venta.cliente_email || 'N/A'}`, clienteX + 10, currentY + 45)
               .text(`Teléfono: ${data.venta.cliente_telefono || 'N/A'}`, clienteX + 10, currentY + 60);

            currentY += 100;

            // === INFORMACIÓN DE LA FUNCIÓN ===
            roundedRect(40, currentY, pageWidth - 80, 90, 5).fill(colors.cardBg);
            roundedRect(45, currentY + 5, 6, 80, 2).fill(colors.accent);
                
            doc.fillColor(colors.primary).fontSize(14).font('Helvetica-Bold')
               .text('DETALLES DE LA FUNCIÓN', 65, currentY + 15);
            
            doc.font('Helvetica').fontSize(10)
               .text(`Película: ${data.venta.pelicula_titulo || 'N/A'}`, 65, currentY + 40)
               .text(`Sala: ${data.venta.sala_nombre || 'N/A'}`, 65, currentY + 55)
               .text(`Fecha: ${data.venta.fecha_funcion ? new Date(data.venta.fecha_funcion).toLocaleDateString('es-ES') : 'N/A'}`, 65, currentY + 70)
               .text(`Horario: ${data.venta.hora_inicio || 'N/A'} - ${data.venta.hora_fin || 'N/A'}`, 350, currentY + 40)
               .text(`Idioma: ${data.venta.idioma || 'N/A'}`, 350, currentY + 55)
               .text(`Asientos: ${data.asientos.map(a => a.numero_asiento).join(', ') || 'N/A'}`, 350, currentY + 70);

            currentY += 110;

            // === VERIFICAR SI NECESITAMOS NUEVA PÁGINA ANTES DE LA TABLA ===
            const remainingHeight = pageHeight - currentY - 100; // Margen para footer
            const requiredTableHeight = 25 + (itemsCount * 25) + 100; // Header + items + totales
            
            if (requiredTableHeight > remainingHeight) {
                doc.addPage();
                doc.rect(0, 0, pageWidth, pageHeight).fill('#F8F9FA');
                currentY = 50;
            }

            // === TABLA DE DETALLES ===
            const tableWidth = pageWidth - 80;
            const rowHeight = 25;
            
            // Encabezados de tabla
            roundedRect(40, currentY, tableWidth, rowHeight, 4).fill(colors.headerDark);
            
            doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
               .text('DESCRIPCIÓN', 50, currentY + 10)
               .text('CANT.', 280, currentY + 10)
               .text('PRECIO UNIT.', 350, currentY + 10)
               .text('SUBTOTAL', 450, currentY + 10);
            
            currentY += rowHeight;
            
            // Filas de datos
            let rowIndex = 0;
            
            if (data.detalles && data.detalles.length > 0) {
                data.detalles.forEach((detalle) => {
                    const bgColor = rowIndex % 2 === 0 ? colors.tableBg : colors.altRow;
                    roundedRect(40, currentY, tableWidth, rowHeight, 2).fill(bgColor);
                    
                    doc.fillColor(colors.primary).font('Helvetica').fontSize(9)
                       .text(detalle.descripcion, 50, currentY + 9)
                       .text(detalle.cantidad.toString(), 280, currentY + 9)
                       .text(`$${detalle.precio_unitario.toLocaleString()}`, 350, currentY + 9)
                       .text(`$${detalle.subtotal.toLocaleString()}`, 450, currentY + 9);
                    currentY += rowHeight;
                    rowIndex++;
                });
            } else {
                data.asientos.forEach((asiento) => {
                    const bgColor = rowIndex % 2 === 0 ? colors.tableBg : colors.altRow;
                    roundedRect(40, currentY, tableWidth, rowHeight, 2).fill(bgColor);
                    
                    doc.fillColor(colors.primary).font('Helvetica').fontSize(9)
                       .text(`Asiento ${asiento.numero_asiento}`, 50, currentY + 9)
                       .text('1', 280, currentY + 9)
                       .text(`$${asiento.precio_unitario.toLocaleString()}`, 350, currentY + 9)
                       .text(`$${asiento.precio_unitario.toLocaleString()}`, 450, currentY + 9);
                    currentY += rowHeight;
                    rowIndex++;
                });
            }
            
            // === TOTALES ===
            currentY += 20;
            
            roundedRect(pageWidth - 220, currentY, 180, 80, 5).fill(colors.cardBg);
                
            doc.fillColor(colors.primary).font('Helvetica').fontSize(10)
               .text(`Subtotal:`, pageWidth - 210, currentY + 15)
               .text(`$${(data.venta.subtotal || data.venta.factura_subtotal || 0).toLocaleString()}`, pageWidth - 120, currentY + 15)
               .text(`IVA (19%):`, pageWidth - 210, currentY + 35)
               .text(`$${(data.venta.iva || data.venta.iva_valor || 0).toLocaleString()}`, pageWidth - 120, currentY + 35);
            
            doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.accent)
               .text(`TOTAL:`, pageWidth - 210, currentY + 55)
               .text(`$${(data.venta.total || data.venta.factura_total || 0).toLocaleString()}`, pageWidth - 120, currentY + 55);
            
            currentY += 100;

            // === FOOTER SOLO SI HAY ESPACIO ===
            const footerY = pageHeight - 80;
            
            if (currentY <= footerY - 20) {
                doc.strokeColor(colors.accent).lineWidth(2)
                   .moveTo(40, footerY).lineTo(pageWidth - 40, footerY).stroke();
                
                doc.fillColor(colors.secondary).fontSize(8).font('Helvetica')
                   .text('CineByte - Sistema de Gestión Cinematográfica', 40, footerY + 15)
                   .text('Esta factura fue generada digitalmente y es de simulación por el proyecto.', 40, footerY + 30)
                   .text(`Generado el ${new Date().toLocaleString('es-ES')}`, 40, footerY + 31);
                
                doc.text('contacto@cinebyte.com | (+593) 96 812 2692', pageWidth - 250, footerY + 15);
            }

            // === FINALIZAR DOCUMENTO SIN PÁGINAS EXTRA ===
            doc.end();
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            reject(error);
        }
    });
};

// === FUNCIÓN HELPER PARA CARGAR LOGO SVG ===
const cargarLogoSVG = async () => {
    try {
        const logoPath = path.join(process.cwd(), 'src', 'imagenes', 'branding', 'Isotipo blanco.svg');
        const svgData = fs.readFileSync(logoPath, 'utf8');
        
        return new Promise((resolve, reject) => {
            svg2img(svgData, { width: 40, height: 40 }, (error, buffer) => {
                if (error) {
                    console.warn('Error convirtiendo SVG a imagen:', error);
                    resolve(null);
                } else {
                    resolve(buffer);
                }
            });
        });
    } catch (error) {
        console.warn('Error cargando logo SVG:', error.message);
        return null;
    }
};

