package com.dglib.service.mail;

import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.simplejavamail.api.email.Email;
import org.simplejavamail.api.mailer.Mailer;
import org.simplejavamail.api.mailer.config.TransportStrategy;
import org.simplejavamail.email.EmailBuilder;
import org.simplejavamail.mailer.MailerBuilder;
import org.springframework.stereotype.Service;

import com.dglib.config.MailConfig;

import jakarta.mail.BodyPart;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage.RecipientType;
import jakarta.mail.internet.MimeUtility;
import jakarta.mail.search.RecipientTerm;
import jakarta.mail.search.SearchTerm;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class MailService {
	
    private final Mailer mailer;
    private final MailConfig mailConfig;

    public void sendMail(String to, String subject, String text) {
    	
        	Email email = EmailBuilder.startingBlank()
        			.from("test_admin@dglib.kro.kr")
                    .to(to)
                    .withSubject(subject)
                    .withPlainText(text)
                    .buildEmail();
        	mailer.sendMail(email);
    }
    
    
    public String getMailList(String mailId){
        	StringBuilder result = new StringBuilder();
        	Message[] messages;
        	
        	try {
        	Folder inbox = mailConfig.getFolder();
            if(mailId != null) {
            SearchTerm searchTerm = new RecipientTerm(RecipientType.TO, new InternetAddress(mailId+"@dglib.kro.kr"));
            messages = inbox.search(searchTerm);
            
            }else {
            	messages = inbox.getMessages();
            }
            for (Message msg : messages) {
                String from = Arrays.stream(msg.getFrom())
                                    .map(addr -> {
                                    	InternetAddress iAddr = (InternetAddress) addr;
                                    	String personal = iAddr.getPersonal() != null ? iAddr.getPersonal() +" " : "";
                                        String email = iAddr.getAddress();
                                    	return personal + "<" + email + ">";
                                    })
                                    .collect(Collectors.joining(", "));
                					
                result.append("Subject: ").append(msg.getSubject()).append("\n")
                      .append("From: ").append(from).append("\n")
                      .append("Date: ").append(msg.getSentDate()).append("\n\n");
            }
            mailConfig.closeFolder(inbox);
        	} catch (MessagingException e) {
        		throw new RuntimeException(e); 
        	}
      
        return result.toString();
    }
    
    public String getMailContent(int num) {
    	StringBuilder result = new StringBuilder();
    	try {
    	Folder inbox = mailConfig.getFolder();
    	Message message = inbox.getMessage(num);
    	result.append(message.getSubject()).append("\n");
    	Object content = message.getContent();
    	if (content instanceof String) {
    	    result.append((String) content);
    	} else
    	result.append(parseMultiPart((Multipart) content));
    	
    	} catch (MessagingException e) {
    		throw new RuntimeException(e); 
    	} catch (IOException e) {
    		throw new RuntimeException(e);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
    	return result.toString();
    }
    
    
    String parseMultiPart(Multipart multipart) throws Exception {
    	StringBuilder content = new StringBuilder();
        StringBuilder attach = new StringBuilder();
        for (int i = 0; i < multipart.getCount(); i++) {
            BodyPart part = multipart.getBodyPart(i);
            System.out.println(part.getContentType());
            
            if (Part.ATTACHMENT.equalsIgnoreCase(part.getDisposition())) {
            	attach.append(MimeUtility.decodeText(part.getFileName()));
                continue;
            }
            
            if (part.isMimeType("multipart/alternative")) {
            	content.append(parseAltPart((Multipart) part.getContent()));
            	
            } else if (part.isMimeType("text/html")) {
                content.append(part.getContent());
            } else if (part.isMimeType("text/plain")) {
                if (content.length() == 0) {
                    content.append(part.getContent());
                }
            } else if (part.isMimeType("multipart/*")) {
            	// 멀티 파트일 경우 계속 파싱
            	content.append(parseMultiPart((Multipart) part.getContent()));
               }
        }
        return content.toString() +"\n"+ attach.toString();
    }
    
    String parseAltPart(Multipart altPart) throws MessagingException, IOException {
    	 StringBuilder htmlText = new StringBuilder();
         StringBuilder plainText = new StringBuilder();
    
     	for(int j = 0; j < altPart.getCount(); j++) {
     		BodyPart altBodyPart = altPart.getBodyPart(j);
     		if(altPart.getBodyPart(j).isMimeType("text/html")) {
     			htmlText.append(altBodyPart.getContent());
     		} else
     			plainText.append(altBodyPart.getContent());
     	}
     	if(htmlText.length() > 0) {
     		return htmlText.toString();
     	} else {
     		return plainText.toString();
     	}
    	
    }
    
}