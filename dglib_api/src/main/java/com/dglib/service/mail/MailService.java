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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.dglib.config.MailConfig;
import com.dglib.dto.mail.MailDTO;
import com.dglib.dto.mail.MailListDTO;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.util.EncryptUtil;

import jakarta.mail.Address;
import jakarta.mail.Flags;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMessage.RecipientType;
import jakarta.mail.search.AndTerm;
import jakarta.mail.search.FromTerm;
import jakarta.mail.search.HeaderTerm;
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
        			.from(JwtFilter.getName(), JwtFilter.getMid() + "@dglib.kro.kr")
                    .to(to)
                    .withSubject(subject)
                    .withHTMLText(content)
                    .bcc("archive@dglib.kro.kr")
                    .buildEmail();
        	mailer.sendMail(email);
    }
    
    
    public Page<MailListDTO> getMailList(String type, String mailId, int page, int size){
    		Page<MailListDTO> mailPage;
    		
        	try {
        		Folder inbox = mailConfig.getFolder(type);
        		Message[] messages = filterMail(type, inbox, mailId, null);
        		
        		int total = messages.length;
        		int fromIndex = Math.min(page * size, total);
        	    int toIndex = Math.min(fromIndex + size, total);
        		
        	    List<MailListDTO> mailList = new ArrayList<>();
        	    
            for (int i = messages.length - fromIndex - 1; i > messages.length - toIndex - 1; i--) {
            	Message msg = messages[i];

            	 String[] header = msg.getHeader("Message-ID");
            	 String eid = null;
            	 if(header != null && header.length > 0) {
            		 eid = EncryptUtil.base64Encode(header[0]);
            	 }
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
                
                Flags flags = msg.getFlags();
                boolean isRead = flags.contains(Flags.Flag.SEEN);
                
            
               MailListDTO dto = MailListDTO.builder()
            		   		   .eid(eid)
				               .subject(subject)
				               .fromName(fromName)
				               .fromEmail(fromEmail)
				               .toName(toName)
				               .toEmail(toEmail)
				               .sentTime(sentTime)
				               .isRead(isRead)
				               .build();
               
               mailList.add(dto);
            }
            
            mailPage = new PageImpl<>(mailList, PageRequest.of(page, size), total);
            
            mailConfig.closeFolder(inbox, false);
            
        	} catch (MessagingException e) {
        		throw new RuntimeException(e); 
        	}
        	return mailPage;
    }
    
    
    public MailDTO getContent(String type, String mailId, String eid) {
    	MailDTO dto = null;
    	try {
    	Folder inbox = mailConfig.getFolder(type);
		Message[] messages = filterMail(type, inbox, mailId, eid);
    	Message message = messages[0];
    	
    	Email email = EmailConverter.mimeMessageToEmail((MimeMessage) message, null, true);

    	String subject = email.getSubject();
    	
    	
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


    	List<String> fileList = new ArrayList<>();
		
    	if (!email.getAttachments().isEmpty()) {
    		email.getAttachments().forEach(attach -> {
    			fileList.add(attach.getName());
    		});
            
        }
    	
    	List<String> imgList = new ArrayList<>();
		
    	if (!email.getEmbeddedImages().isEmpty()) {
    		email.getEmbeddedImages().forEach(attach -> {
    			imgList.add(attach.getName());
    		});
            
        }
    	
    	String htmlContent = email.getHTMLText();
    	for(int i = 0; i < imgList.size(); i++) {
    		htmlContent = htmlContent.replace("cid:"+imgList.get(i), "image://"+eid + "?mailType="+type+"&fileType=image&fileNum="+i);
    	}
    	
    	String content = (htmlContent == null) ? email.getPlainText() : htmlContent;
    	
    	
    	
    	dto = MailDTO.builder()
	               .subject(subject)
	               .content(content)
	               .fromName(fromName)
	               .fromEmail(fromEmail)
	               .toName(toName)
	               .toEmail(toEmail)
	               .sentTime(sentTime)
	               .fileName(fileList)
	               .imgName(imgList)
	               .build();
    
    	mailConfig.closeFolder(inbox, false);
    	} catch (MessagingException e) {
    		throw new RuntimeException(e); 
		}
    	return dto;
    }
    
  
    
    public void deleteMail(String type, String mailId, String eid) {
    
    	try {
    		Folder inbox = mailConfig.getFolder(type);
			Message[] messages = filterMail(type, inbox, mailId, eid);
			Message message = messages[0];
			message.setFlag(Flags.Flag.DELETED, true);
			
			mailConfig.closeFolder(inbox, true);
		} catch (MessagingException e) {
			throw new RuntimeException(e); 
		}
    	
    	
    }
    

	 public ResponseEntity<Resource> getFile(String type, String eid, int fileNum, String fileType){
		InputStreamResource resource;
		
		 try {
		Folder inbox = mailConfig.getFolder(type);
		Message[] messages = filterMail(type, inbox, null, eid);
	    Message message = messages[0];
	    	
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
    
    public Message[] filterMail (String type, Folder inbox, String mailId, String eid) throws MessagingException {
    	Message[] messages;

    	if(mailId != null) {
    		SearchTerm searchTerm;
    		
    		if(type.equals("SENDER"))
    		searchTerm = new FromTerm(new InternetAddress(mailId+"@dglib.kro.kr"));	
    		else
    		searchTerm = new RecipientTerm(RecipientType.TO, new InternetAddress(mailId+"@dglib.kro.kr"));
    		
    			if(eid != null)
    			messages = inbox.search(new AndTerm(searchTerm, new HeaderTerm("Message-ID", EncryptUtil.base64Decode(eid))));
    		
    			else
    			messages = inbox.search(searchTerm);
    		
            }else {
            	
            	if(eid != null)
            	messages = inbox.search(new HeaderTerm("Message-ID", EncryptUtil.base64Decode(eid)));
            	
            	else
            	messages = inbox.getMessages();
            }
  
    	return messages;
    }
    

    
    
}