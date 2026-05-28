package com.peakfit.dto;

import lombok.Data;

@Data
public class NutritionRepasRequest {
    private String date;
    private String heure;
    private String type;
    private String nom;
    private Integer calories;
    private Float proteines;
    private Float glucides;
    private Float lipides;
}
