import httpx


client = None

def set_client(http_client: httpx.AsyncClient):
    global client
    client = http_client

def get_client():
    return client