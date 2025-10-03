const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Configuración del transportador de Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verificar configuración de correo al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Error en configuración de Gmail:', error.message);
    } else {
        console.log('✅ Configuración de Gmail verificada correctamente');
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para enviar correo
app.post('/enviar-correo', async (req, res) => {
    try {
        const { nombre, telefono, direccion } = req.body;
        
        // Validar datos
        if (!nombre || !telefono || !direccion) {
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos' 
            });
        }
        
        // Configurar el correo
        const mailOptions = {
            from: `"Sistema de Contacto Web" <${process.env.GMAIL_USER}>`,
            to: 'luiscelisflorez1@gmail.com',
            subject: `🌐 Nuevo contacto desde la web: ${nombre}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                    <div style="background-color: #667eea; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">🌐 Nuevo Contacto desde la Web</h1>
                    </div>
                    
                    <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Información del Contacto</h2>
                        
                        <div style="margin-bottom: 20px;">
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #667eea;">
                                <strong style="color: #667eea; font-size: 16px;">👤 Nombre:</strong><br>
                                <span style="font-size: 18px; color: #333; margin-left: 10px;">${nombre}</span>
                            </div>
                            
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #28a745;">
                                <strong style="color: #28a745; font-size: 16px;">📱 Teléfono:</strong><br>
                                <span style="font-size: 18px; color: #333; margin-left: 10px;">${telefono}</span>
                            </div>
                            
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ffc107;">
                                <strong style="color: #ffc107; font-size: 16px;">🏠 Dirección:</strong><br>
                                <span style="font-size: 16px; color: #333; margin-left: 10px; line-height: 1.4;">${direccion}</span>
                            </div>
                        </div>
                        
                        <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                📅 Fecha de envío: ${new Date().toLocaleString('es-ES', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
                                🌐 Enviado desde: formulario web público
                            </p>
                        </div>
                        
                        <div style="margin-top: 25px; text-align: center;">
                            <p style="color: #667eea; font-weight: bold; margin: 0;">✅ Correo generado automáticamente por el sistema web</p>
                        </div>
                    </div>
                </div>
            `,
            text: `
                NUEVO CONTACTO DESDE LA WEB\n\n                Nombre: ${nombre}\n                Teléfono: ${telefono}\n                Dirección: ${direccion}\n\n                Fecha: ${new Date().toLocaleString('es-ES')}\n                Fuente: Formulario web público\n\n                ---\n                Correo generado automáticamente
            `
        };
        
        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Correo enviado desde web:`);
        console.log(`   📧 Para: luiscelisflorez1@gmail.com`);
        console.log(`   👤 Contacto: ${nombre}`);
        console.log(`   🆔 Message ID: ${info.messageId}`);
        
        res.json({ 
            success: true, 
            message: 'Correo enviado exitosamente',
            messageId: info.messageId
        });
        
    } catch (error) {
        console.error('❌ Error al enviar correo:', error.message);
        
        let errorMessage = 'Error interno del servidor';
        
        if (error.code === 'EAUTH') {
            errorMessage = 'Error de autenticación con Gmail.';
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = 'No se pudo conectar con Gmail.';
        }
        
        res.status(500).json({ 
            error: errorMessage
        });
    }
});

// Ruta de prueba
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Servidor funcionando correctamente en la web',
        gmail_configured: !!(process.env.GMAIL_USER && process.env.GMAIL_PASSWORD),
        timestamp: new Date().toISOString(),
        environment: 'production'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('\n🌐 ==========================================');
    console.log('📧 SERVIDOR WEB DE FORMULARIO INICIADO');
    console.log('==========================================\n');
    console.log(`✅ Servidor ejecutándose en puerto: ${PORT}`);
    console.log(`📧 Destino de correos: luiscelisflorez1@gmail.com`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
});

// Manejo de errores globales
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Error no manejado:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada:', error.message);
    process.exit(1);
});