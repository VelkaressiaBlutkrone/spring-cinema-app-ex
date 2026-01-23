package com.cinema.global.dto;

import java.util.List;

import org.springframework.data.domain.Page;

import lombok.Builder;
import lombok.Getter;

/**
 * 페이징 응답 DTO
 *
 * @param <T> 응답 데이터 타입
 */
@Getter
@Builder
public class PageResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean first;
    private final boolean last;
    private final boolean hasNext;
    private final boolean hasPrevious;

    /**
     * Spring Data Page를 PageResponse로 변환
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    /**
     * ApiResponse로 래핑
     */
    public ApiResponse<PageResponse<T>> toApiResponse() {
        return ApiResponse.success(this);
    }
}
