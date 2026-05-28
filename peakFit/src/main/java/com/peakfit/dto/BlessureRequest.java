package com.peakfit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class BlessureRequest {
    private String zone;
    private String severite;
    private String debut;
    @JsonProperty("date_fin") private String dateFin;
    private Boolean guerison;
    private String notes;
}
