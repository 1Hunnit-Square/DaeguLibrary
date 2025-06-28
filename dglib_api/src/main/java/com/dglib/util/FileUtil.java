package com.dglib.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import lombok.extern.log4j.Log4j2;
import net.coobird.thumbnailator.Thumbnails;

@Component
@Log4j2
public class FileUtil {
	
	@Value("${file.upload.path}")
    private String uploadPath;
	
	@PostConstruct
    public void init(){
        File tempFolder = new File (uploadPath);
        if(tempFolder.exists() == false){
            tempFolder.mkdir();
        }
        uploadPath = tempFolder.getAbsolutePath();
        log.info("UPLOAD_PATH : "+uploadPath);
	}
	
	 public List<Object> saveFiles(List<MultipartFile> files, String dirName) throws RuntimeException {
	        if(files == null || files.size() == 0 || dirName == null){
	            return null;
	        }
	        
	        Path dirPath = Paths.get(uploadPath, dirName);
	        if(!Files.exists(dirPath)) {
	        	try {
					Files.createDirectories(dirPath);
				} catch (IOException e) {
					 throw new RuntimeException(e.getMessage());
				}
	        }
	        
	        
	        List<Object> uploadPaths = new ArrayList<>();
	        for (MultipartFile multipartFile : files){
	        	String originName = multipartFile.getOriginalFilename();
	        	String ext = originName.substring(originName.lastIndexOf("."));
	            String savedName = UUID.randomUUID().toString() + ext;
	            Path savePath = Paths.get(uploadPath, dirName, savedName);
	            
	            try{
	                Files.copy(multipartFile.getInputStream(), savePath);

	                String contentType = multipartFile.getContentType();
	                if(contentType != null && contentType.startsWith("image")){

	                    Path thumbnailPath = Paths.get(uploadPath, dirName, "s_"+ savedName);

	                    Thumbnails.of(savePath.toFile())
	                    .size(400, 400)
	                    .toFile(thumbnailPath.toFile());
	                }
	                
	               uploadPaths.add(Map.of("originalName", originName, "filePath", pathEncode(dirName,savedName)));

	            } catch( IOException e ){
	                throw new RuntimeException(e.getMessage());
	            }
	            }
	            return uploadPaths;
	        }
	 
	 public ResponseEntity<Resource> getFile(String filePath, String type){
		 Path path = null;
		 if(type != null && type.equals("thumbnail")) {
			path = Paths.get(filePath);
       	  	String fileDir = path.getParent().toString();
       	  	String fileName = path.getFileName().toString();
       	  	String thumbnailFileName = "s_" + fileName;
       	  	path = Paths.get(uploadPath, fileDir, thumbnailFileName);
		 } else {
			path = Paths.get(uploadPath, filePath);
		 }
         Resource resource = new FileSystemResource(path.toFile());
         if(!resource.exists()){
        	 Path noFilePath = Paths.get(uploadPath, "default.png");
             resource = new FileSystemResource(noFilePath.toFile());
         }

         HttpHeaders headers = new HttpHeaders();


         try{
             headers.add("Content-Type", Files.probeContentType(resource.getFile().toPath()));
         } catch(Exception e){
             return ResponseEntity.internalServerError().build();
         }
         return ResponseEntity.ok().headers(headers).body(resource);
     }
	 
	 
	  public void deleteFiles(List<String> filePaths){
          if(filePaths == null || filePaths.size() == 0){
              return;
          }

          filePaths.forEach(filePath -> {
        	  Path path = Paths.get(filePath);
        	  String fileDir = path.getParent().toString();
        	  String fileName = path.getFileName().toString();
              String thumbnailFileName = "s_" + fileName;
              Path thumbnailPath = Paths.get(uploadPath, fileDir, thumbnailFileName);
              Path originfilePath = Paths.get(uploadPath, fileDir, fileName);
              try{
                  Files.deleteIfExists(originfilePath);
                  Files.deleteIfExists(thumbnailPath);
              } catch (IOException e){
                  throw new RuntimeException(e.getMessage());
              }


          });     
      }
	  
	  
	  public String pathEncode (String path1, String path2) {
		  Path path = Paths.get(path1, path2);
		  String pathStr = path.toString().replace("\\", "/");
		  return pathStr;
	  }
	  

	  public void deleteFolder(String folderPath) {
		    Path directoryPath = Paths.get(uploadPath, folderPath);
		    if (Files.exists(directoryPath) && Files.isDirectory(directoryPath)) {
		        try (Stream<Path> walk = Files.walk(directoryPath)) {
		            walk.sorted(Comparator.reverseOrder())
		                .map(Path::toFile)
		                .forEach(File::delete);
		        } catch (IOException e) {
		            throw new RuntimeException("파일 폴더를 삭제하는 데 실패했습니다.", e);
		        }
		    }
		}
	  

	  public boolean isImageFile(String filename) {
		    return filename != null && filename.toLowerCase().matches(".*\\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$");
		}
	 
	 

}
