package com.dglib.service.mail;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.simplejavamail.api.email.AttachmentResource;
import org.simplejavamail.api.email.Email;
import org.simplejavamail.api.mailer.Mailer;
import org.simplejavamail.converter.EmailConverter;
import org.simplejavamail.email.EmailBuilder;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.dglib.config.MailConfig;
import com.dglib.dto.mail.MailDTO;

import jakarta.mail.Address;
import jakarta.mail.Flags;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMessage.RecipientType;
import jakarta.mail.search.FromTerm;
import jakarta.mail.search.RecipientTerm;
import jakarta.mail.search.SearchTerm;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class MailService {
	
    private final Mailer mailer;
    private final MailConfig mailConfig;

    public void sendMail(String to, String subject, String content) {
    	
        	Email email = EmailBuilder.startingBlank()
        			.from("test_admin@dglib.kro.kr")
                    .to(to)
                    .withSubject(subject)
                    .withHTMLText(content)
                    .bcc("archive@dglib.kro.kr")
                    .buildEmail();
        	mailer.sendMail(email);
    }
    
    
    public List<MailDTO> getMailList(String type, String mailId){
    		List<MailDTO> mailList = new ArrayList<>();
    		
        	try {
        		Folder inbox = mailConfig.getFolder(type);
        		Message[] messages = filterMail(type, inbox, mailId);
        		
        		
            for (int i = messages.length - 1; i > 0; i--) {
            	Message msg = messages[i];

                Address[] fromList = msg.getFrom();
           
            	String fromName = ((InternetAddress) fromList[0]).getPersonal();
            	String fromEmail = ((InternetAddress) fromList[0]).getAddress();
            
                
                List<String> toName = new ArrayList<>();
            	List<String> toEmail = new ArrayList<>();
                Arrays.stream(msg.getRecipients(Message.RecipientType.TO)).forEach(addr -> {
                	toName.add(((InternetAddress) addr).getPersonal());
                	toEmail.add(((InternetAddress) addr).getAddress());
                });
                
                String subject = msg.getSubject();
                LocalDateTime sentTime = msg.getSentDate().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime();
                
            
               MailDTO dto = MailDTO.builder()
				               .subject(subject)
				               .fromName(fromName)
				               .fromEmail(fromEmail)
				               .toName(toName)
				               .toEmail(toEmail)
				               .sentTime(sentTime)
				               .build();
               
               mailList.add(dto);
            }
            
            mailConfig.closeFolder(inbox, false);
            
        	} catch (MessagingException e) {
        		throw new RuntimeException(e); 
        	}
        	return mailList;
    }
    
    
    public MailDTO getContent(String type, String mailId, int num) {
    	MailDTO dto = null;
    	try {
    	Folder inbox = mailConfig.getFolder(type);
		Message[] messages = filterMail(type, inbox, mailId);
    	Message message = messages[messages.length - num];
    	
    	Email email = EmailConverter.mimeMessageToEmail((MimeMessage) message, null, true);
    	System.out.println(email.getHeaders().get("Message-ID").iterator().next());
    	String subject = email.getSubject();
    	String htmlContent = email.getHTMLText();
    	String content = (htmlContent == null) ? email.getPlainText() : htmlContent;
    	
    	
    	List<String> toName = new ArrayList<>();
    	List<String> toEmail = new ArrayList<>();
    	email.getToRecipients().forEach(to -> {
    		toName.add(to.getName());
    		toEmail.add(to.getAddress());
    		
    	});
    	
    	String fromName = email.getFromRecipient().getName();
    	String fromEmail = email.getFromRecipient().getAddress();
    	
    	LocalDateTime sentTime = email.getSentDate().toInstant()
                 .atZone(ZoneId.systemDefault())
                 .toLocalDateTime();


    	List<String> nameList = new ArrayList<>();
		
    	if (!email.getAttachments().isEmpty()) {
    		email.getAttachments().forEach(attach -> {
    			nameList.add(attach.getName());
    		});
            
        }
    	
    	
    	dto = MailDTO.builder()
	               .subject(subject)
	               .content(content)
	               .fromName(fromName)
	               .fromEmail(fromEmail)
	               .toName(toName)
	               .toEmail(toEmail)
	               .sentTime(sentTime)
	               .fileName(nameList)
	               .build();
    
    	mailConfig.closeFolder(inbox, false);
    	} catch (MessagingException e) {
    		throw new RuntimeException(e); 
		}
    	return dto;
    }
    
  
    
    public void deleteMail(String type, String mailId, int num) {
    
    	try {
    		Folder inbox = mailConfig.getFolder(type);
			Message[] messages = filterMail(type, inbox, mailId);
			Message message = messages[messages.length - num];
			message.setFlag(Flags.Flag.DELETED, true);
			
			mailConfig.closeFolder(inbox, true);
		} catch (MessagingException e) {
			throw new RuntimeException(e); 
		}
    	
    	
    }
    

	 public ResponseEntity<Resource> getFile(String type, String mailId, int num, int fileNum, String fileType){
		InputStreamResource resource;
		
		 try {
		Folder inbox = mailConfig.getFolder(type);
		Message[] messages = filterMail(type, inbox, mailId);
	    Message message = messages[messages.length - num];
	    	
	    Email email = EmailConverter.mimeMessageToEmail((MimeMessage) message, null, true);
	    
	    AttachmentResource attachment;
	    
	    attachment = fileType.equals("image") ? email.getEmbeddedImages().get(fileNum) : email.getAttachments().get(fileNum);
	   
		
	    InputStream inputStream = attachment.getDataSource().getInputStream();
		
        resource = new InputStreamResource(inputStream);
         
        } catch(Exception e){
        	System.out.println(e);
             return ResponseEntity.internalServerError().build();
         }
         return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM)
        		 .body(resource);
     }
    
    public Message[] filterMail (String type, Folder inbox, String mailId) throws MessagingException {
    	Message[] messages;

    	if(mailId != null) {
    		SearchTerm searchTerm;
    		
    		if(type.equals("SENDER"))
    		searchTerm = new FromTerm(new InternetAddress(mailId+"@dglib.kro.kr"));	
    		else
    		searchTerm = new RecipientTerm(RecipientType.TO, new InternetAddress(mailId+"@dglib.kro.kr"));
    		
            messages = inbox.search(searchTerm);
            
            }else {
            	messages = inbox.getMessages();
            }
  
    	return messages;
    }


    
    
}