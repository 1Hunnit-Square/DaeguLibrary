package com.dglib.dto.member;

import java.util.List;

import lombok.Data;

@Data
public class MemberStatsDTO {
List<GenderCountDTO> genderCount;
List<AgeCountDTO> ageCount;
List<RegionCountDTO> regionCount;
}
