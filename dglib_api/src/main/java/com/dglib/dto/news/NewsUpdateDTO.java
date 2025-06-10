package com.dglib.dto.news;

import java.util.List;

import lombok.Data;

@Data
public class NewsUpdateDTO {

    private String title;
    private String content;
    private boolean pinned;
    private boolean hidden;
    private String mid;

    private List<String> urlList;
    private List<String> oldFiles;
}
