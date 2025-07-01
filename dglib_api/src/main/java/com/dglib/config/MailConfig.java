package com.dglib.config;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.mail.Folder;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Store;

@Component
public class MailConfig {
	@Value("${mail.smtp.host}")
	private String HOST;
	private final String RECIEVER = "creation";
	private final String SENDER = "archive"; 
	
	@Value("${server.creation.password}")
    private String PASSWORD;
    private final Properties props = new Properties();
    
    @PostConstruct
	public void init() {
	
    
    props.put("mail.store.protocol", "imaps");
    props.put("mail.imaps.host", HOST);
    props.put("mail.imaps.port", "993");
    props.put("mail.imaps.ssl.enable", "true");
    props.put("mail.imaps.ssl.trust", "*"); // 모든 인증서 신뢰
    props.put("mail.imaps.ssl.checkserveridentity", "false"); // 호스트네임 검증 비활성화
    }

	
	
    public Folder getFolder(String type, boolean readOnly) throws MessagingException{
    	Session session = Session.getInstance(props);
    	Folder inbox = null;
			Store store = session.getStore("imaps");
			
			if(type.equals("SENDER"))
	    	store.connect(HOST, SENDER, PASSWORD);
			else
			store.connect(HOST, RECIEVER, PASSWORD);
	    	
			inbox = store.getFolder("INBOX");
			
			if(readOnly)
			inbox.open(Folder.READ_ONLY);
			else
			inbox.open(Folder.READ_WRITE);

       
        return inbox;
    }
    
    
    public void closeFolder(Folder folder, boolean expunge) throws MessagingException {

            if (folder != null && folder.isOpen()) {
                Store store = folder.getStore();
                folder.close(expunge);
                if (store != null && store.isConnected()) {
                    store.close();
                }
            }
    }
    
 
    
}
