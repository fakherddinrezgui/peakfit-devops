package com.peakfit.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String current;
    private String nouveau;
}
