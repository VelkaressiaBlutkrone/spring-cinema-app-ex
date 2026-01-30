import 'package:flutter/material.dart';

enum RadioDirection { horizontal, vertical }

/// 제네릭(Generic)을 적용한 커스텀 라디오 그룹 위젯
///
/// [T]는 라디오 버튼의 값(Value) 타입입니다. (예: String, int, Enum 등)
class CustomRadios<T> extends StatelessWidget {
  /// 라디오 버튼 아이템
  /// key: 실제 값 (T), value: 화면에 표시될 라벨 (String)
  final Map<T, String> items;

  /// 현재 선택된 값 (Controlled Component)
  /// 부모 위젯에서 상태를 관리해야 합니다.
  final T? groupValue;

  /// 초기 선택 값 (initialValue와 groupValue 중 하나만 사용)
  ///
  /// 라디오 버튼 그룹의 초기 선택 값을 설정합니다.
  /// items의 key 중 하나여야 합니다.
  final T? initialValue;

  /// 값 변경 콜백 (새로운 형식: `ValueChanged<T?>`?)
  final ValueChanged<T?>? onChanged;

  /// 값 변경 콜백 (기존 형식: void Function(T?, String?)?)
  ///
  /// 첫 번째 파라미터는 선택된 아이템의 key,
  /// 두 번째 파라미터는 선택된 아이템의 value입니다.
  final void Function(T?, String?)? onChangedLegacy;

  final String? label;
  final String? errorText;
  final RadioDirection direction;
  final bool enabled;

  // [개선] Wrap 위젯을 위한 정렬 및 간격 옵션 추가
  final double spacing;
  final double runSpacing;

  const CustomRadios({
    super.key,
    required this.items,
    this.groupValue,
    this.initialValue,
    this.onChanged,
    this.onChangedLegacy,
    this.label,
    this.errorText,
    this.direction = RadioDirection.vertical,
    this.enabled = true,
    this.spacing = 16.0,
    this.runSpacing = 8.0,
  }) : assert(items.length >= 2, '라디오 버튼은 최소 2개 이상이어야 합니다.');

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // 현재 선택된 값 결정 (groupValue 또는 initialValue)
    final currentValue = groupValue ?? initialValue;

    // 라디오 버튼 리스트 생성
    final radioList = items.entries.map((entry) {
      final isSelected = entry.key == currentValue;

      return IntrinsicWidth(
        child: RadioListTile<T>(
          title: Text(
            entry.value,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: enabled
                  ? colorScheme.onSurface
                  : colorScheme.onSurface.withValues(alpha: 0.38),
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
          value: entry.key,
          // ignore: deprecated_member_use
          groupValue: currentValue,
          // ignore: deprecated_member_use
          onChanged: enabled
              ? (T? selectedValue) {
                  if (selectedValue != null) {
                    final selectedText = items[selectedValue];
                    // 새로운 형식의 콜백 호출
                    onChanged?.call(selectedValue);
                    // 기존 형식의 콜백 호출 (하위 호환성)
                    onChangedLegacy?.call(selectedValue, selectedText);
                  }
                }
              : null,
          contentPadding: EdgeInsets.zero,
          visualDensity: VisualDensity.compact,
          dense: true,
          // 선택된 항목 강조 색상
          activeColor: errorText != null
              ? colorScheme.error
              : colorScheme.primary,
        ),
      );
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // 라벨 영역
        if (label != null) ...[
          Text(
            label!,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: errorText != null
                  ? colorScheme.error
                  : colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
        ],

        // 배치 영역 (Wrap 사용으로 오버플로우 방지)
        direction == RadioDirection.horizontal
            ? Wrap(
                spacing: spacing, // 가로 간격
                runSpacing: runSpacing, // 세로 줄바꿈 간격
                children: radioList
                    .map(
                      (widget) => Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [widget],
                      ),
                    )
                    .toList(),
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: radioList,
              ),

        // 에러 메시지 영역
        if (errorText != null) ...[
          const SizedBox(height: 6),
          Text(
            errorText!,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.error,
            ),
          ),
        ],
      ],
    );
  }
}
