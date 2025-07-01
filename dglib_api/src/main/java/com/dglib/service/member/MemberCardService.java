package com.dglib.service.member;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.dglib.dto.member.MemberScanDTO;
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
	
	public MemberScanDTO verifyQRinfo(Map<String, String> qrInfo) {
		MemberScanDTO result = null;
		
		String mno = qrInfo.get("mno");
		String time = qrInfo.get("time");
		String signature = qrInfo.get("signature");
		
		if(mno != null && time != null && signature != null) {
			try {
			String realSign = EncryptUtil.sha256Encode(KEY, mno + time, "BASE64");
			if(realSign.equals(signature)) {
				
				Member member = memberRepository.findByMno(mno).orElseThrow(() -> new IllegalArgumentException("User not found"));
				
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

		        LocalDateTime inputTime = LocalDateTime.parse(time, formatter);

		        long diffSec = Duration.between(inputTime, LocalDateTime.now()).getSeconds();
		        
		         if(diffSec <= 60 && diffSec >= 0) {
		        	 result = new MemberScanDTO(mno, member.getName(), false);
		         } else {
		        	 result = new MemberScanDTO(mno, member.getName(), true);
		         }
				
			} else {
				throw new IllegalArgumentException("Wrong Signature Key");
			}
			
			} catch (Exception e) {
				throw new RuntimeException("ENCODE_ERROR");
			}
		} else {
			throw new IllegalArgumentException("Not Enough Key");
		}
		
		
		return result;
	}
	
	
}
