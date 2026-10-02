@echo off
title PRAKASH 3D ADVENTURE Launcher
echo ========================================================
echo           PRAKASH 3D ADVENTURE - LAUNCHER
echo ========================================================
echo Opening browser at http://localhost:8000 ...
timeout /t 1 /nobreak >nul
start "" "http://localhost:8000"
echo.
echo Running local web server (Press Ctrl+C to stop)...
echo.
node -e "const http=require('http'),fs=require('fs'),path=require('path');const m={'.html':'text/html','.css':'text/css','.js':'application/javascript','.jpg':'image/jpeg','.png':'image/png'};http.createServer((req,res)=>{let f='.'+(req.url==='/'?'/index.html':req.url.split('?')[0]);if(!fs.existsSync(f)){res.writeHead(404);res.end('Not Found');return;}let ext=path.extname(f).toLowerCase();res.writeHead(200,{'Content-Type':m[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(res);}).listen(8000,()=>console.log('>>> PRAKASH 3D ADVENTURE is LIVE at http://localhost:8000 <<<'));"
if errorlevel 1 (
    python -m http.server 8000
)
pause
