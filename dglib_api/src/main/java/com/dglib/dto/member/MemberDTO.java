package com.dglib.dto.member;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import lombok.Data;


@Data
public class MemberDTO extends User{
	private static final long serialVersionUID = 1L;
	
	private String mid;
	private String pw;
	private String name;
	private String mno;
	private String roleName;
	
	public MemberDTO(String mid, String pw, String name, String mno, String roleName) {
		super(mid, pw, List.of(new SimpleGrantedAuthority("ROLE_"+roleName)));
		this.mid = mid;
		this.name = name;
		this.mno = mno;
		this.roleName = roleName;
	}

	public Map<String, Object> getClaims(){
		Map<String, Object> dataMap = new HashMap<>();
		dataMap.put("mid", mid);
		dataMap.put("name", name);
		dataMap.put("mno", mno);
		dataMap.put("roleName", roleName);
		
		return dataMap;
	}
	

}


