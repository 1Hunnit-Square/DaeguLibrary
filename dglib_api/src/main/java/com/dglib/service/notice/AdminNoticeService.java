package com.dglib.service.notice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dglib.dto.notice.AdminNoticeDTO;
import com.dglib.dto.notice.AdminNoticeSearchDTO;

public interface AdminNoticeService {
	Page<AdminNoticeDTO> getAdminNoticeList(AdminNoticeSearchDTO searchDTO, Pageable pageable);

}
