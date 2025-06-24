@echo off
REM 새 CMD 창에서 ngrok 실행
start cmd /k "ngrok start --all --config C:\ngrok\ngrok2.yml"

REM 클라이언트 디렉터리로 이동
cd /d "C:\Users\개발자\Desktop\daegu\dglib_client"

REM 클라이언트 서버 실행
npm start