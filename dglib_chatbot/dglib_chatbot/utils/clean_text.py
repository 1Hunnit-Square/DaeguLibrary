import re

def clean_text(text):
    pattern = re.compile(
        r"("
       
        r"`[^`]*`|"              
        r"\*\*[^*]*\*\*|"        
        r"\*[^*]*\*|"            
        r"_+[^_]+_+|"           
        r"\#{1,6} .*|"           
        r"\[.*?\]\(.*?\)|"       
        r"\!\[.*?\]\(.*?\)|"    
        r"> .*|"                
        r"-{3,}|"               
        r"^\s*[\-\*\+] .*|"      
        r"\n{2,}|"               

       
        r"[\U0001F600-\U0001F64F" 
        r"\U0001F300-\U0001F5FF"   
        r"\U0001F680-\U0001F6FF"   
        r"\U0001F1E0-\U0001F1FF"   
        r"\U00002700-\U000027BF"  
        r"\U0001F900-\U0001F9FF"   
        r"\U00002600-\U000026FF"   
        r"\U00002B50-\U00002B55"  
        r"]"
        r")", flags=re.UNICODE | re.MULTILINE)

    return pattern.sub('', text).strip()