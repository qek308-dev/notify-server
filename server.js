const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(express.json()); // 解析 JSON
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
    console.log('有一個網頁連線進來了！');
    clients.push(ws);
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
});

// 接收來自釘釘自動化系統的請求
app.post('/api/notify', (req, res) => {
    const storeName = req.body.storeName;
    
    if (!storeName) {
        return res.status(400).send('缺少 storeName 參數');
    }

    console.log(`收到釘釘通知，門市為: ${storeName}`);

    // 把通知廣播給所有開著的網頁
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ storeName: storeName }));
        }
    });

    res.send('通知已送出');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`✅ 伺服器已啟動！正在監聽 Port ${PORT}`);
});
