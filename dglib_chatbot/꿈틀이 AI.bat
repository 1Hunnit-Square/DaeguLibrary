@echo off
REM ngrok을 새 CMD 창에서 실행
start "ngrok" cmd /k "ngrok start --all --config C:\ngrok\ngrok.yml"



REM 현재 창에서 poetry 실행
set Path=%Path%;C:\Users\개발자\AppData\Local\Programs\Python\Python311\Scripts
poetry env use C:\Users\개발자\AppData\Local\pypoetry\Cache\virtualenvs\dglib-chatbot-CDq4c1jg-py3.11\Scripts\python.exe
poetry run start