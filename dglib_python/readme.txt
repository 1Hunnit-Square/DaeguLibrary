powerShell

(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -

환경변수 설정
$env:Path += ";$env:USERPROFILE\AppData\Roaming\Python\Scripts"         --일회용임 재부팅하면 다시해야함 귀찮으면 시스템 환경변수에 직접 추가

poetry install

poetry run start