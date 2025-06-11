package com.dglib.dto.notice;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class NoticeListDTO {
   private Long ano;
   private String title;
   private boolean isPinned;
   private String name;
   private LocalDateTime postedAt;
   private int viewCount;
}
