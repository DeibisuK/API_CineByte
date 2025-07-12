import express from 'express';
import { getDashboardStats, generateExportWithFilters } from '../services/dashboard.service.js';

const router = express.Router();

// === RUTA PRINCIPAL DEL DASHBOARD ===
// GET /api/dashboard/stats?mes=12&ano=2024
router.get('/stats', async (req, res) => {
    try {
        const { mes, ano } = req.query;
        
        // Validar parámetros opcionales
        const mesNum = mes ? parseInt(mes) : null;
        const anoNum = ano ? parseInt(ano) : null;
        
        if (mes && (mesNum < 1 || mesNum > 12)) {
            return res.status(400).json({
                success: false,
                message: 'El mes debe estar entre 1 y 12'
            });
        }
        
        if (ano && (anoNum < 2020 || anoNum > 2030)) {
            return res.status(400).json({
                success: false,
                message: 'El año debe estar entre 2020 y 2030'
            });
        }
        
        console.log(`📊 Obteniendo estadísticas del dashboard para: ${mesNum ? `${mesNum}/` : ''}${anoNum || 'año actual'}`);
        
        const stats = await getDashboardStats(mesNum, anoNum);
        
        if (stats.success) {
            res.json(stats);
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: stats.error
            });
        }
        
    } catch (error) {
        console.error('Error en ruta /dashboard/stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// === EXPORTACIONES CON FILTROS ===
// GET /api/dashboard/export?category=peliculas&reportType=peliculas%20mas%20vendidas&format=pdf&mes=12&ano=2024
router.get('/export', async (req, res) => {
    try {
        const { category, reportType, format, mes, ano } = req.query;
        
        // Validar parámetros requeridos
        if (!category || !reportType || !format) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros requeridos: category, reportType, format'
            });
        }
        
        // Validar formato
        if (!['pdf', 'excel'].includes(format.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Formato no válido. Use "pdf" o "excel"'
            });
        }
        
        // Validar parámetros opcionales
        const mesNum = mes ? parseInt(mes) : null;
        const anoNum = ano ? parseInt(ano) : null;
        
        if (mes && (mesNum < 1 || mesNum > 12)) {
            return res.status(400).json({
                success: false,
                message: 'El mes debe estar entre 1 y 12'
            });
        }
        
        console.log(`📋 Generando exportación filtrada: ${category} - ${reportType} (${format}) para ${mesNum ? `${mesNum}/` : ''}${anoNum || 'año actual'}`);
        
        const exportResult = await generateExportWithFilters(category, reportType, format, mesNum, anoNum);
        
        // Configurar headers para descarga
        const mimeType = format.toLowerCase() === 'pdf' 
            ? 'application/pdf' 
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
        res.setHeader('Content-Length', exportResult.data.length);
        
        res.send(exportResult.data);
        
    } catch (error) {
        console.error('Error en ruta /dashboard/export:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando exportación',
            error: error.message
        });
    }
});

// === RUTA PARA OBTENER RESUMEN RÁPIDO ===
// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
    try {
        const stats = await getDashboardStats();
        
        if (stats.success) {
            // Devolver solo los datos más importantes para widgets
            res.json({
                success: true,
                data: {
                    ventasHoy: stats.data.ventasDelPeriodo,
                    ingresosTotales: stats.data.ingresosTotales,
                    boletosVendidos: stats.data.boletosVendidos,
                    clientesActivos: stats.data.clientesActivos,
                    peliculasPrincipal: stats.data.peliculasPopulares.slice(0, 3),
                    estadisticasGenerales: stats.data.estadisticasGenerales
                }
            });
        } else {
            res.status(500).json(stats);
        }
        
    } catch (error) {
        console.error('Error en ruta /dashboard/summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo resumen del dashboard',
            error: error.message
        });
    }
});

export default router;
