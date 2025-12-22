import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';


export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'face-upload-server',
          configureServer(server) {
            server.middlewares.use('/api/upload-face-image', (req, res, next) => {
              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', () => {
                  try {
                    const { citizenId, imageData } = JSON.parse(body);
                    if (!citizenId || !imageData) {
                      res.statusCode = 400;
                      res.end(JSON.stringify({ error: 'Missing citizenId or imageData' }));
                      return;
                    }

                    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
                    const buffer = Buffer.from(base64Data, 'base64');
                    // Use process.cwd() to be safe in ESM
                    const uploadDir = path.join(process.cwd(), 'public/faces');
                    
                    if (!fs.existsSync(uploadDir)) {
                      fs.mkdirSync(uploadDir, { recursive: true });
                    }

                    const filePath = path.join(uploadDir, `${citizenId}.jpg`);
                    fs.writeFileSync(filePath, buffer);

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, path: `/faces/${citizenId}.jpg` }));
                  } catch (error) {
                    console.error('Upload Error:', error);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                  }
                });
              } else {
                next();
              }
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
