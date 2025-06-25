package com.dglib.util;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import com.dglib.dto.mail.MailBasicDTO;
import com.dglib.dto.mail.MailContentDTO;
import com.dglib.dto.mail.MailFileDTO;

import jakarta.mail.Address;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeUtility;

public class MailParseUtil {

	
	public static MailBasicDTO getBasicInfo(String email, String type, Message message) throws MessagingException {
        Address[] fromList = message.getFrom();
        
    	String fromName = ((InternetAddress) fromList[0]).getPersonal();
    	String fromEmail = ((InternetAddress) fromList[0]).getAddress();
        
        List<String> toName = new ArrayList<>();
    	List<String> toEmail = new ArrayList<>();
        Arrays.stream(message.getRecipients(Message.RecipientType.TO)).forEach(addr -> {
        	toName.add(((InternetAddress) addr).getPersonal());
        	toEmail.add(((InternetAddress) addr).getAddress());
        });
        
        
        if((type.equals("SENDER") && email.equals(fromEmail)) || (type.equals("RECIEVER") && toEmail.contains(email))) {
        	 String subject = message.getSubject();

             LocalDateTime sentTime = message.getReceivedDate().toInstant()
                     .atZone(ZoneId.systemDefault())
                     .toLocalDateTime();
     		
     		
     		return MailBasicDTO.builder()
     			.fromName(fromName)
     			.fromEmail(fromEmail)
     			.toEmail(toEmail)
     			.toName(toName)
     			.subject(subject)
     			.sentTime(sentTime)
     			.build();
     		
        } else {
        	return null;
        }
        
       
	}
	
	public static MailContentDTO getContentInfo(String eid, String mailType, Message message) throws Exception {
		
		
        List<MailFileDTO> fileList = new ArrayList<>();
        StringBuilder plainBuilder = new StringBuilder();
        StringBuilder htmlBuilder = new StringBuilder();
        
        parsePart(message, fileList, plainBuilder, htmlBuilder, eid, mailType);
        
        String content = null;
        if(mailType.equals("SENDER")) {
        content = htmlBuilder.length() > 0 ? removeTracker(htmlBuilder.toString()) : plainBuilder.toString();
        } else {
        content = htmlBuilder.length() > 0 ? htmlBuilder.toString() : plainBuilder.toString();
        }

       return MailContentDTO.builder()
    		   .content(content)
    		   .fileList(fileList)
    		   .build();
	
	}
	
	
	public static ByteArrayResource getFileResource(Message message, int fileNum) throws Exception {
	    List<Part> fileParts = new ArrayList<>();
	    findFileParts(message, fileParts);

	    if (fileNum >= 0 && fileNum < fileParts.size()) {
	    	 Part target = fileParts.get(fileNum);
	         try (InputStream is = target.getInputStream()) {
	             byte[] bytes = is.readAllBytes();
	             return new ByteArrayResource(bytes);
	         }
	    }

	    return null;
	}

	
	private static void parsePart(Part part, List<MailFileDTO> fileList,
            StringBuilder plainBuilder, StringBuilder htmlBuilder,
            String eid, String mailType) throws Exception {

			if (part.isMimeType("multipart/*")) {
			Multipart multipart = (Multipart) part.getContent();
			for (int i = 0; i < multipart.getCount(); i++) {
			parsePart(multipart.getBodyPart(i), fileList, plainBuilder, htmlBuilder, eid, mailType);
			}
			} else {
			String disposition = part.getDisposition();
			String filename = part.getFileName();
			
			if ((Part.ATTACHMENT.equalsIgnoreCase(disposition) || Part.INLINE.equalsIgnoreCase(disposition))
			&& filename != null) {
			
			filename = MimeUtility.decodeText(filename);
			boolean isImage = part.isMimeType("image/*");
			String type = isImage ? "image" : "other";
			
			
			int index = fileList.size();
			String path = eid + "?mailType=" + mailType + "&fileNum=" + index;
			fileList.add(new MailFileDTO(filename, type, path));
			
			// HTML 본문에서 CID 치환
			if (isImage && htmlBuilder.length() > 0) {
			String cid = getCid(part) != null ? getCid(part) : filename;
			String cidRef = "cid:" + cid;
			int idx;
			while ((idx = htmlBuilder.indexOf(cidRef)) != -1) {
			  htmlBuilder.replace(idx, idx + cidRef.length(), "image://"+path);
						}
					}
				} else if (part.isMimeType("text/plain")) {
					plainBuilder.append((String) part.getContent());
				} else if (part.isMimeType("text/html")) {
					htmlBuilder.append((String) part.getContent());
				}
			} 
	}
	
	private static void findFileParts(Part part, List<Part> fileParts) throws Exception {
	    if (part.isMimeType("multipart/*")) {
	        Multipart multipart = (Multipart) part.getContent();
	        for (int i = 0; i < multipart.getCount(); i++) {
	            findFileParts(multipart.getBodyPart(i), fileParts);
	        }
	    } else {
	        String disposition = part.getDisposition();

	        boolean isAttachment = Part.ATTACHMENT.equalsIgnoreCase(disposition);
	        boolean isInlineImage = Part.INLINE.equalsIgnoreCase(disposition);

	        if ((isAttachment || isInlineImage) && part.getFileName() != null) {
	            fileParts.add(part);
	        }
	    }
	}
	
	
	private static String getCid(Part part) throws MessagingException {
		String[] contentIds = part.getHeader("Content-ID");
		String contentId = null;
		if (contentIds != null && contentIds.length > 0) {
		    contentId = contentIds[0].trim();
		    if (contentId.startsWith("<") && contentId.endsWith(">")) {
		        contentId = contentId.substring(1, contentId.length() - 1);
		    }
		}
		
		return contentId;
	}
	
	   public static String removeTracker(String html) {
	        Document doc = Jsoup.parse(html);

	        Elements trackers = doc.select("div.dglib-tracker");
	        
	        for (Element tracker : trackers) {
	            tracker.remove();
	        }
	        return doc.body().html();
	    }
}
