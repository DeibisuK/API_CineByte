import * as service from '../services/export.service.js';

export const exportData = async (req, res) => {
    try {
        const { category, reportType, format } = req.body;
        
        if (!category || !reportType || !format) {
            return res.status(400).json({
                error: 'Faltan parámetros requeridos: category, reportType, format'
            });
        }

        const result = await service.generateExport(category, reportType, format);
        
        if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        } else if (format === 'excel') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        }
        
        res.send(result.data);
    } catch (error) {
        console.error('Error en exportData:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al generar la exportación',
            details: error.message 
        });
    }
};

export const getAvailableReports = async (req, res) => {
    try {
        const reports = await service.getAvailableReports();
        res.json(reports);
    } catch (error) {
        console.error('Error en getAvailableReports:', error);
        res.status(500).json({ 
            error: 'Error al obtener los reportes disponibles',
            details: error.message 
        });
    }
};

export const generarFacturaPDF = async (req, res) => {
    try {
        const { ventaId, firebase_uid } = req.params;

        if (!ventaId) {
            return res.status(400).json({
                error: 'ID de venta requerido'
            });
        }

        if (!firebase_uid) {
            return res.status(400).json({
                error: 'UID de usuario requerido'
            });
        }

        console.log('Generando factura PDF para venta:', ventaId, 'usuario:', firebase_uid);

        const result = await service.generarFacturaPDF(ventaId, firebase_uid);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.data);
        
    } catch (error) {
        console.error('Error en generarFacturaPDF:', error);
        res.status(500).json({ 
            error: 'Error al generar la factura PDF',
            details: error.message 
        });
    }
};
