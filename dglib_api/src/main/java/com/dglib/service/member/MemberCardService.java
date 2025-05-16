package com.dglib.service.member;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.dglib.entity.member.Member;
import com.dglib.repository.member.MemberRepository;
import com.dglib.util.EncryptUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberCardService {
	private final MemberRepository memberRepository;
	private final String KEY = "CREATION!@#IS!@#BEST!@#TEAM!@#AND!@#GREAT!@#DEVEPLOPERS";
	
	public Map<String, String> setQRinfo(String mid) {
		Map<String, String> result = null;
		Member member = memberRepository.findById(mid).orElseThrow(() -> new IllegalArgumentException("User not found"));
		String mno = member.getMno();
		String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
		try {
		String signature = EncryptUtil.sha256Encode(KEY, mno + time, "BASE64");
		result = Map.of("mno", mno, "time", time, "signature", signature);
		} catch (Exception e) {
			throw new RuntimeException("ENCODE_ERROR");
		}
		
		return result;
	}
	
	
}
