package com.peakfit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ObjectifRequest {
    private String titre;
    private String type;
    @JsonProperty("type_activite") private String typeActivite;
    private Float cible;
    private Float actuel;
    private String unite;
    private String statut;
    private String couleur;
    @JsonProperty("date_fin") private String dateFin;
}
