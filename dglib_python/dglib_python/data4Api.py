import requests
from datetime import datetime, timedelta

today = datetime.today()
one_month_ago = today - timedelta(days=30)

start_date = one_month_ago.strftime('%Y-%m-%d')
end_date = today.strftime('%Y-%m-%d')

url = 'http://data4library.kr/api/loanItemSrch'

AUTH_KEY = 'c1888c7a4825d9bd126707b7edf5314571ec8da864cd982b5eac20238ea88a5a'

params = {
    'authKey': AUTH_KEY,
    'startDt': start_date,
    'endDt': end_date,
    'kdc': '8',            
    'pageNo': 1,
    'pageSize': 5,
    'format': 'json'
}

response = requests.get(url, params=params)

if response.status_code == 200:
    data = response.json()
    items = data['response']['docs']
    for idx, item in enumerate(items, start=1):
        book = item['doc']
        print(f"{idx}. {book['bookname']} - {book['authors']} ({book['publisher']}, {book['publication_year']})")
else:
    print("API 요청 실패:", response.status_code)
