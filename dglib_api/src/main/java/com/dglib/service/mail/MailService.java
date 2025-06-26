package com.dglib.service.mail;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import org.modelmapper.ModelMapper;
import org.simplejavamail.api.email.Email;
import org.simplejavamail.api.email.EmailPopulatingBuilder;
import org.simplejavamail.api.mailer.Mailer;
import org.simplejavamail.email.EmailBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.config.MailConfig;
import com.dglib.dto.mail.MailBasicDTO;
import com.dglib.dto.mail.MailContentDTO;
import com.dglib.dto.mail.MailDTO;
import com.dglib.dto.mail.MailListDTO;
import com.dglib.dto.mail.MailSearchDTO;
import com.dglib.dto.mail.MailSendDTO;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.util.EncryptUtil;
import com.dglib.util.MailParseUtil;

import jakarta.activation.DataSource;
import jakarta.mail.Address;
import jakarta.mail.Flags;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.search.AndTerm;
import jakarta.mail.search.FlagTerm;
import jakarta.mail.search.HeaderTerm;
import jakarta.mail.search.SearchTerm;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class MailService {

    private final Mailer mailer;
    private final MailConfig mailConfig;
    private final ModelMapper modelMapper;
    private final String MAIL_ADDR = "@dglib.kro.kr";

    public void sendMail(MailSendDTO sendDTO, List<MultipartFile> files) {
    	
    	if(sendDTO.getSubject() == null || sendDTO.getSubject().trim().isEmpty()) {
			throw new IllegalArgumentException("제목을 입력해주세요.");			
		}
		
		if(sendDTO.getContent() == null || sendDTO.getContent().trim().isEmpty()) {
			throw new IllegalArgumentException("내용을 입력해주세요.");			
		}
		
		if(sendDTO.getTo() == null || sendDTO.getTo().isEmpty()) {
			sendDTO.setTo(List.of(JwtFilter.getName() + " <"+ JwtFilter.getMid() + MAIL_ADDR+">"));
		}
		
		String eid = "<"+UUID.randomUUID().toString() + "-" + System.currentTimeMillis() + MAIL_ADDR+">";
    	String tracker = String.format("""
    			<div class="dglib-tracker" style="width:0px; height:0px; overflow:hidden;">
    			<img src="%s%s.gif" border="0" />
    			</div>
    			""", sendDTO.getTrackPath(), EncryptUtil.base64Encode(eid));
    	
    	EmailPopulatingBuilder emailBuilder  = EmailBuilder.startingBlank()
    			.from(JwtFilter.getName(), JwtFilter.getMid() + MAIL_ADDR)
                .withSubject(sendDTO.getSubject())
                .bcc("archive"+MAIL_ADDR)
                .fixingMessageId(eid);

		// 파일첨부
		AtomicInteger index = new AtomicInteger(0);
		if(files != null) {
			files.forEach(file -> {
				int i = index.getAndIncrement();
				DataSource ds;
				try {
					ds = new ByteArrayDataSource(
						    file.getInputStream(),
						    file.getContentType()
							);
				} catch (IOException e) {
					throw new RuntimeException(e);
				}
				
				if(!sendDTO.getUrlList().get(i).equals("null")) {
					emailBuilder.withEmbeddedImage(file.getOriginalFilename(), ds);
					String content = sendDTO.getContent().replace(sendDTO.getUrlList().get(i), "cid:"+file.getOriginalFilename());
					sendDTO.setContent(content);
				} else {
					emailBuilder.withAttachment(file.getOriginalFilename(), ds);
				}

			});				
			}
		
			sendDTO.getTo().forEach(to -> {
				if(to.contains("<") && to.contains(">")) {
				String toName = to.split("<")[0].trim();
				String toEmail = to.split("<")[1].split(">")[0].trim();
					emailBuilder.to(toName, toEmail);
				} else {
					emailBuilder.to(to.trim());
				}
	
			});
			
    	
    		
            Email email  = emailBuilder.withHTMLText(sendDTO.getContent()+tracker)
            							.buildEmail();
        	mailer.sendMail(email);
    }
    
    
    public Page<MailListDTO> getMailList(String type, String mailId, MailSearchDTO searchDTO){
    		Page<MailListDTO> mailPage;
    		int page = searchDTO.getPage() > 0 ? searchDTO.getPage() - 1 : 1;
    		int size = searchDTO.getSize() > 0 ? searchDTO.getSize() : 10;
    		
        	try {
        		Folder inbox = mailConfig.getFolder(type, false);
        		
        		Message[] messages = listFilterMail(type, inbox, mailId, searchDTO.isNotRead());
        		sortMessages(messages);
        		
                int total = messages.length;
                int fromIndex = Math.min(page * size, total);
        	    int toIndex = Math.min(fromIndex + size, total);
        		
        	    List<MailListDTO> mailList = new ArrayList<>();
        	    
            for (int i = fromIndex; i < toIndex; i++) {
            	Message msg = messages[i];
            	
                MailBasicDTO basicDTO = MailParseUtil.getBasicInfo(mailId + MAIL_ADDR, type, msg);

            	 String[] header = msg.getHeader("Message-ID");
            	 String eid = null;
            	 if(header != null && header.length > 0) {
            		 eid = EncryptUtil.base64Encode(header[0]);
            	 } else {
            		 MimeMessage copy = new MimeMessage((MimeMessage) msg);
            		 String newId = "<" + UUID.randomUUID().toString() + "-" + System.currentTimeMillis() + "@"+basicDTO.getFromEmail()+">";
            		 copy.setHeader("Message-ID", newId);
            		 copy.saveChanges();
            		 eid = EncryptUtil.base64Encode(newId);
            		 
            		 inbox.appendMessages(new Message[]{copy});

            		msg.setFlag(Flags.Flag.DELETED, true);
            	 }
            	 
                MailListDTO dto = new MailListDTO();
                modelMapper.map(basicDTO, dto);
                dto.setEid(eid);
                dto.setRead(msg.getFlags().contains(Flags.Flag.SEEN));

               mailList.add(dto);
            }
  
            
            mailPage = new PageImpl<>(mailList, PageRequest.of(page, size), total);
            
            mailConfig.closeFolder(inbox, true);
            
        	} catch (MessagingException e) {
        		throw new RuntimeException(e); 
        	}
        	return mailPage;
    }
    
    
    public MailDTO getContent(String type, String mailId, String eid) {
    	MailDTO dto = null;
    	Folder inbox;
    	try {
    	if(type.equals("SENDER")) {
    	inbox = mailConfig.getFolder(type, true);
    	} else {
    	inbox = mailConfig.getFolder(type, false);
    	}
		Message[] messages = readFilterMail(type, inbox, eid);
    	Message message = messages[0];
    	
    	MailBasicDTO basicDTO = MailParseUtil.getBasicInfo(mailId + MAIL_ADDR, type, message);
    	
    	if(basicDTO == null) {
    		throw new RuntimeException("Not Access");
    	}
    	
    	MailContentDTO contentDTO = MailParseUtil.getContentInfo(eid, type, message);
    	
    	 dto = new MailDTO();
         modelMapper.map(basicDTO, dto);
         modelMapper.map(contentDTO, dto);
    
    	mailConfig.closeFolder(inbox, false);
    	 
		} catch (Exception e) {
			throw new RuntimeException(e); 
		}
    	return dto;
    }
    
  
    
    public void deleteMail(String type, String mailId, String eid) {
    
    	try {
    		Folder inbox = mailConfig.getFolder(type, false);
			Message[] messages = readFilterMail(type, inbox, eid);
			Message message = messages[0];
			
	    	MailBasicDTO basicDTO = MailParseUtil.getBasicInfo(mailId + MAIL_ADDR, type, message);
	    	
	    	if(basicDTO == null) {
	    		throw new RuntimeException("Not Access");
	    	}
	    	
			message.setFlag(Flags.Flag.DELETED, true);
			
			mailConfig.closeFolder(inbox, true);
		} catch (MessagingException e) {
			throw new RuntimeException(e); 
		}
    	
    	
    }
    
    
    
    public void deleteListMail(String type, String mailId, List<String> eidList) {
    
    	try {
    		Folder inbox = mailConfig.getFolder(type, false);
    		
    		eidList.forEach(eid -> {
    			
    			Message[] messages;
				try {
					messages = readFilterMail(type, inbox, eid);
	
	    			Message message = messages[0];
	    			
	    	    	MailBasicDTO basicDTO = MailParseUtil.getBasicInfo(mailId + MAIL_ADDR, type, message);
	    	    	
		    	    	if(basicDTO == null) {
		    	    		throw new RuntimeException("Not Access");
		    	    	}
	    	    	message.setFlag(Flags.Flag.DELETED, true);		
    			
				} catch (MessagingException e) {
					throw new RuntimeException(e); 
				}
    			
    		});
			
			
			mailConfig.closeFolder(inbox, true);
		
    		} catch (MessagingException e) {
    			throw new RuntimeException(e); 
    		}
    	
    }
    
    public void readMail(String type, String eid) {
        
    	try {
    		Folder inbox = mailConfig.getFolder(type, false);
			Message[] messages = readFilterMail(type, inbox, eid);
			Message message = messages[0];
			message.setFlag(Flags.Flag.SEEN, true);
			System.out.println("mail read - " + eid);
			mailConfig.closeFolder(inbox, true);
		} catch (MessagingException e) {
			throw new RuntimeException(e); 
		}
    	
    	
    }
    

	 public ResponseEntity<Resource> getFile(String type, String eid, int fileNum){
		 ByteArrayResource resource;
		
		 try {
		Folder inbox = mailConfig.getFolder(type, true);
		Message[] messages = readFilterMail(type, inbox, eid);
	    Message message = messages[0];
	    	
	   
        resource = MailParseUtil.getFileResource(message, fileNum);
        
        mailConfig.closeFolder(inbox, false);
        } catch(Exception e){
        	System.out.println(e);
             return ResponseEntity.internalServerError().build();
         }
		 
         return ResponseEntity.ok()
        		 .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
        		 .contentType(MediaType.APPLICATION_OCTET_STREAM)
        		 .contentLength(resource.contentLength())
        		 .body(resource);
     }
	 
	    public Message[] listFilterMail (String type, Folder inbox, String mailId, boolean notRead) throws MessagingException {
	    	Message[] messages;

	        SearchTerm searchTerm = null;

	        if (mailId != null) {
	            String fullAddress = mailId + "@dglib.kro.kr";

	            SearchTerm addressTerm = new SearchTerm() {
	                @Override
	                public boolean match(Message msg) {
	                    try {
	                        Address[] targets = type.equals("SENDER")
	                            ? msg.getFrom()
	                            : msg.getRecipients(Message.RecipientType.TO);

	                        if (targets != null) {
	                            for (Address address : targets) {
	                                if (address instanceof InternetAddress) {
	                                    String actual = ((InternetAddress) address).getAddress();
	                                    if (actual.equalsIgnoreCase(fullAddress)) {
	                                        return true;
	                                    }
	                                }
	                            }
	                        }
	                    } catch (MessagingException e) {
	                    	throw new RuntimeException(e); 
	                    }
	                    return false;
	                }
	            };
	            	if(!type.equals("SENDER") && notRead) {
	            	SearchTerm unreadTerm = new FlagTerm(new Flags(Flags.Flag.SEEN), false);
	                searchTerm = new AndTerm(addressTerm, unreadTerm);
	            	} else {
	            		searchTerm = addressTerm;
	            	}
	            	
	                messages = inbox.search(searchTerm);
	            }
	        else {
	            messages = inbox.getMessages();
	        }

	        return messages;
	    }
    
    public Message[] readFilterMail (String type, Folder inbox, String eid) throws MessagingException {
    	Message[] messages;

        SearchTerm searchTerm = null;
            if (eid != null) {
                searchTerm = new HeaderTerm("Message-ID", EncryptUtil.base64Decode(eid));
                messages = inbox.search(searchTerm);
            } else {
            	throw new RuntimeException("Not Exist Id");
            }
        return messages;
    }
    
    public static void sortMessages(Message[] messages) {
      
    	Arrays.sort(messages, (m1, m2) -> {
    		try {
                Date d1 = m1.getReceivedDate();
                Date d2 = m2.getReceivedDate();

               
                if (d1 == null && d2 == null) return 0;
                if (d1 == null) return -1; 
                if (d2 == null) return 1;

                return d2.compareTo(d1);
    		 } catch(Exception e) {
    	    	  throw new RuntimeException("Sort Error");
    	      }
        });
     
    }
    
}