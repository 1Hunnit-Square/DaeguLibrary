package com.dglib.controller.common;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.util.FileUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/view")
public class FileController {
	
	private final FileUtil fileUtil;
	 
	 @GetMapping("/{*fileName}") //type이 thumbnail 이면 썸네일로 표시됨
	    public ResponseEntity<Resource> viewFile(@PathVariable String fileName, @RequestParam(required = false) String type){
	    return fileUtil.getFile(fileName, type);
	    }
	 
	 @PostMapping("/upload/test")
	 public ResponseEntity<Object> uploadFile(@RequestParam List<MultipartFile> files, @RequestParam String path){
		 List<Object> fileList = fileUtil.saveFiles(files, path);
		 return ResponseEntity.ok(fileList);
	 }
	 
	 @PostMapping("/delete/test")
	 public ResponseEntity<String> deleteFile(@RequestParam List<String> fileNames){
		 fileUtil.deleteFiles(fileNames);
		 return ResponseEntity.ok().build();
	 }
}
