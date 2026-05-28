package com.peakfit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ProgrammeRequest {
    private String nom;
    private String description;
    private String objectif;
    @JsonProperty("duree_weeks") private Integer dureeWeeks;
}
