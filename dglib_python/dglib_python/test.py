import requests
url = 'http://127.0.0.1:8000/detect'
message = "Test Message"
file_path = "sample.jpg"

with open(file_path, 'rb') as file:
    response = requests.post(url, data={'message': message}, files={'file': file})
    print(response.json())