import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Middleware para servir index.html con variables de entorno inyectadas
app.use((req, res, next) => {
  // Si es una solicitud de archivo estático, dejar que Express lo maneje
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return next();
  }
  
  // Para todas las demás rutas, servir index.html
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  try {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Inyectar variables de entorno como script global
    const envScript = `
    <script>
      window.__ENV__ = {
        VITE_SUPABASE_URL: '${process.env.VITE_SUPABASE_URL || ''}',
        VITE_SUPABASE_ANON_KEY: '${process.env.VITE_SUPABASE_ANON_KEY || ''}',
        VITE_APP_NAME: '${process.env.VITE_APP_NAME || 'CRM Merchandising'}',
        VITE_APP_VERSION: '${process.env.VITE_APP_VERSION || '1.0.0'}'
      };
    </script>
    `;
    
    html = html.replace('</head>', envScript + '</head>');
    res.send(html);
  } catch (err) {
    console.error('Error sirviendo index.html:', err);
    res.status(500).send('Error interno del servidor');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor CRM corriendo en puerto ${PORT}`);
  console.log(`Supabase URL: ${process.env.VITE_SUPABASE_URL}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
});
