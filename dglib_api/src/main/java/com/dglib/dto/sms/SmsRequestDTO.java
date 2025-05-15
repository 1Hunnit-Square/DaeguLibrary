
package com.dglib.dto.sms;


import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class SmsRequestDTO {
    private List<String> phoneList;
    private String message;
    private String smsKey;
}
