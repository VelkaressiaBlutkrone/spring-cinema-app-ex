import 'package:flutter/material.dart';

/// 제네릭(Generic)을 적용하여 재사용성을 높인 커스텀 드롭다운
///
/// [K]는 드롭다운의 값(Value) 타입입니다. (예: String, int 등)
/// [V]는 화면에 표시될 텍스트 타입입니다. (String이어야 합니다)
class CustomDropDown<K, V extends String> extends StatelessWidget {
  /// 현재 선택된 값 (Controlled Component)
  final K? value;

  /// 초기 선택 값 (initialValue와 value 중 하나만 사용)
  ///
  /// 드롭다운의 초기 선택 값을 설정합니다.
  /// items의 key 중 하나여야 합니다.
  final K? initialValue;

  /// 드롭다운 아이템 리스트
  ///
  /// key: 실제 값 (K), value: 화면에 표시될 텍스트 (V, String)
  final Map<K, V> items;

  /// 값 변경 콜백 (새로운 형식: `ValueChanged<K?>`?)
  final ValueChanged<K?>? onChanged;

  /// 값 변경 콜백 (기존 형식: void Function(K?, V?)?)
  ///
  /// 첫 번째 파라미터는 선택된 아이템의 key,
  /// 두 번째 파라미터는 선택된 아이템의 value입니다.
  final void Function(K?, V?)? onChangedLegacy;

  /// 라벨 텍스트
  final String? label;

  /// 힌트 텍스트
  final String? hint;

  /// 에러 텍스트
  final String? errorText;

  /// 비활성화 여부
  final bool enabled;

  /// 폼 검증 함수 (Form 위젯 사용 시)
  final String? Function(K?)? validator;

  const CustomDropDown({
    super.key,
    required this.items,
    this.value,
    this.initialValue,
    this.onChanged,
    this.onChangedLegacy,
    this.label,
    this.hint,
    this.errorText,
    this.enabled = true,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    // 앱의 테마 색상 가져오기
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // 유효성 검사: 현재 value 또는 initialValue가 items 목록에 있는지 확인
    // 목록에 없는 값이 들어오면 DropdownButton은 에러를 뱉으므로 null 처리
    final effectiveValue =
        (value ?? initialValue) != null &&
            items.containsKey(value ?? initialValue)
        ? (value ?? initialValue)
        : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
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
        DropdownButtonFormField<K>(
          initialValue: value != null ? effectiveValue : null,
          // 아이템 생성 로직
          items: items.entries
              .map(
                (entry) => DropdownMenuItem<K>(
                  value: entry.key,
                  child: Text(
                    entry.value,
                    style: TextStyle(
                      // 비활성화 시 텍스트 색상 조정
                      color: enabled
                          ? colorScheme.onSurface
                          : colorScheme.onSurface.withValues(alpha: 0.38),
                    ),
                    overflow: TextOverflow.ellipsis, // 텍스트가 길 경우 ... 처리
                  ),
                ),
              )
              .toList(),
          // 비활성화 로직: enabled가 false면 onChanged에 null 전달
          onChanged: enabled
              ? (K? selectedKey) {
                  if (selectedKey != null) {
                    final selectedValue = items[selectedKey];
                    // 새로운 형식의 콜백 호출
                    onChanged?.call(selectedKey);
                    // 기존 형식의 콜백 호출 (하위 호환성)
                    onChangedLegacy?.call(selectedKey, selectedValue);
                  }
                }
              : null,
          validator: validator,
          style: theme.textTheme.bodyLarge,
          icon: Icon(
            Icons.arrow_drop_down,
            color: enabled
                ? colorScheme.onSurfaceVariant
                : colorScheme.onSurface.withValues(alpha: 0.38),
          ),
          decoration: InputDecoration(
            hintText: hint,
            errorText: errorText,
            filled: true,
            // 비활성화 시 배경색 흐리게
            fillColor: enabled
                ? colorScheme.surface
                : colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 14,
            ),
            // 기본 테두리
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: colorScheme.outline),
            ),
            // 활성화(Enabled) 테두리
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: errorText != null
                    ? colorScheme.error
                    : colorScheme.outline,
              ),
            ),
            // 포커스 테두리
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: errorText != null
                    ? colorScheme.error
                    : colorScheme.primary,
                width: 2,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
