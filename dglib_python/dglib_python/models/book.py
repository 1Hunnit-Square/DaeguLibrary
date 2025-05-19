from typing import Dict, List, Optional
from datetime import datetime

class BookCache:  
    def __init__(self):
        self.cache: Dict[str, dict] = {}
        self.last_update_time: Optional[datetime] = None
        self.failed_genres: set = set()
    
    def update_genre(self, genre: str, data: dict) -> None:
        self.cache[genre] = data
        self.failed_genres.discard(genre)
    
    def get_genre_data(self, genre: str) -> Optional[dict]:
        return self.cache.get(genre)
    
    def mark_genre_failed(self, genre: str) -> None:
        self.failed_genres.add(genre)
    
    def set_update_time(self) -> None:
        self.last_update_time = datetime.now()
    
    def get_failed_genres(self) -> List[str]:
        return list(self.failed_genres)
    
    def clear_failed_genres(self) -> None:
        self.failed_genres.clear()


book_cache = BookCache()