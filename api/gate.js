// Vercel Serverless Function (modelo classico Node.js — mais estavel que
// o "Routing Middleware" para projetos sem framework).
//
// Faz a autenticacao (HTTP Basic Auth) E entrega o dashboard, no mesmo lugar.
// As credenciais vem de variaveis de ambiente configuradas na Vercel
// (Settings > Environment Variables), nunca ficam neste arquivo.
//
// Identico ao gate.js do "Growth Lead Funnel Radar" original — reaproveitado
// sem mudancas para o Growth Radar - HISPAM. Recomendado usar um projeto
// Vercel separado (com seu proprio DASHBOARD_USER/DASHBOARD_PASSWORD) para
// nao misturar o controle de acesso dos dois dashboards.

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const authHeader = req.headers['authorization'];

  if (authHeader) {
    const parts = authHeader.split(' ');
    const scheme = parts[0];
    const encoded = parts[1];

    if (scheme === 'Basic' && encoded) {
      let decoded = '';
      try {
        decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      } catch (e) {
        decoded = '';
      }
      const sep = decoded.indexOf(':');
      const user = decoded.slice(0, sep);
      const pass = decoded.slice(sep + 1);

      const expectedUser = process.env.DASHBOARD_USER;
      const expectedPass = process.env.DASHBOARD_PASSWORD;

      if (expectedUser && expectedPass && user === expectedUser && pass === expectedPass) {
        try {
          const htmlPath = path.join(process.cwd(), 'dashboard.html');
          const html = fs.readFileSync(htmlPath, 'utf-8');
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.status(200).send(html);
        } catch (err) {
          res.status(500).send('Erro ao carregar o dashboard: ' + err.message);
        }
        return;
      }
    }
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Growth Radar HISPAM", charset="UTF-8"');
  res.status(401).send('Autenticacao necessaria.');
};
