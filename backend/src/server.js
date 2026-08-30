require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./socket/socket');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const httpServer = http.createServer(app);
  const io = initSocket(httpServer);
  app.set('io', io); // controllers access via req.app.get('io')

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});