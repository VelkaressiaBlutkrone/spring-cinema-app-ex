import 'package:flutter/material.dart';

class CustomTextField extends StatelessWidget {
  final String? label;
  final String? hint;
  final TextEditingController? controller;
  final String? errorText;
  final ValueChanged<String>? onChanged;
  final int maxLines;
  final int? maxLength;
  final bool readOnly;
  final VoidCallback? onTap;

  // [추가] 키보드 타입 (이메일, 숫자 등)
  final TextInputType? keyboardType;
  // [추가] 키보드 액션 (완료, 다음 등)
  final TextInputAction? textInputAction;
  // [추가] 비밀번호 숨김 여부
  final bool obscureText;
  // [추가] 우측 아이콘 커스텀 (달력 고정 X)
  final Widget? suffixIcon;
  // [추가] 포커스 노드 (포커스 제어용)
  final FocusNode? focusNode;
  // [추가] Form 검증 (지정 시 TextFormField 사용)
  final String? Function(String?)? validator;

  const CustomTextField({
    super.key,
    this.label,
    this.hint,
    this.controller,
    this.errorText,
    this.onChanged,
    this.maxLines = 1,
    this.maxLength,
    this.readOnly = false,
    this.onTap,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.suffixIcon,
    this.focusNode,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    // 앱 테마 색상 참조
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // onTap이 있으면 강제로 읽기 전용으로 설정 (키보드 방지)
    final isReadOnly = readOnly || onTap != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
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
        // TextFormField 사용으로 Form.validate() 지원 (validator 선택)
        TextFormField(
          controller: controller,
          focusNode: focusNode,
          onChanged: onChanged,
          validator: validator,
          maxLines: maxLines,
          maxLength: maxLength,
          readOnly: isReadOnly,
          onTap: onTap,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          obscureText: obscureText,
          style: theme.textTheme.bodyLarge,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: colorScheme.onSurface.withValues(alpha: 0.4),
            ),
            errorText: errorText,
            filled: true,
            fillColor: isReadOnly
                ? colorScheme.surfaceContainerHighest.withValues(alpha: 0.3)
                : colorScheme.surface,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
            suffixIcon:
                suffixIcon ??
                (onTap != null
                    ? Icon(
                        Icons.calendar_today,
                        size: 20,
                        color: colorScheme.onSurfaceVariant,
                      )
                    : null),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: colorScheme.outline),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: errorText != null
                    ? colorScheme.error
                    : colorScheme.outline,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: errorText != null
                    ? colorScheme.error
                    : colorScheme.primary,
                width: 2,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: colorScheme.error),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: colorScheme.error, width: 2),
            ),
          ),
        ),
      ],
    );
  }
}
