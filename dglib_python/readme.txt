powerShell

(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -

환경변수 설정
$env:Path += ";$env:USERPROFILE\AppData\Roaming\Python\Scripts"