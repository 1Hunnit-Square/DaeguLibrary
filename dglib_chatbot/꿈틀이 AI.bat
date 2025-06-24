@echo off
REM 환경변수 PATH에 Python Scripts 경로 추가
set "PYTHON_SCRIPTS=%USERPROFILE%\AppData\Roaming\Python\Scripts"
set "PATH=%PATH%;%PYTHON_SCRIPTS%"

REM 새 CMD 창에서 ngrok 실행 (먼저)
start "" cmd /k "ngrok start --all --config C:\ngrok\ngrok.yml"

REM 프로젝트 디렉터리로 이동 후 서버 실행
cd /d "C:\Users\개발자\Desktop\daegu\dglib_chatbot"
poetry run start