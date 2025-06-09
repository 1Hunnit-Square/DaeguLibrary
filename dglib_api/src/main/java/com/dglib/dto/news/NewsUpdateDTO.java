package com.dglib.dto.news;

import java.util.List;

import lombok.Data;

@Data
public class NewsUpdateDTO {

    private String title;
    private String content;
    private boolean pinned;
    private boolean hidden;
    private Long mid;

    private List<String> urlList;
    private List<NewsFileDTO> oldfiles;
}
