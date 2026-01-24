package com.cinema.domain.screening.entity;

/**
 * 상영관 타입 Enum
 */
public enum ScreenType {

    /** 2D 일반 */
    NORMAL_2D("2D"),

    /** 3D */
    NORMAL_3D("3D"),

    /** IMAX */
    IMAX("IMAX"),

    /** 4DX */
    DX_4D("4DX"),

    /** SCREENX */
    SCREEN_X("SCREENX");

    private final String displayName;

    ScreenType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
