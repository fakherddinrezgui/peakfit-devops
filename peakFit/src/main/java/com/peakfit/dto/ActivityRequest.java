package com.peakfit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ActivityRequest {
    private String day;
    private String type;
    private Float kilogram;
    private Integer calories;
    @JsonProperty("distance_km") private Float distanceKm;
    @JsonProperty("duree_min")   private Integer dureeMin;
    @JsonProperty("vitesse_moy") private Float vitesseMoy;
    @JsonProperty("freq_card_moy") private Integer freqCardMoy;
}
