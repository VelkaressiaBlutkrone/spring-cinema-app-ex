import 'package:flutter/material.dart';

/// 버튼 스타일 열거형 및 확장
enum CustomButtonStyle { primary, secondary, danger }

// Extension을 사용하여 스타일 관련 로직을 Enum 내부로 응집시킴
extension CustomButtonStyleExtension on CustomButtonStyle {
  Color get backgroundColor {
    switch (this) {
      case CustomButtonStyle.primary:
        return Colors.blue;
      case CustomButtonStyle.secondary:
        return Colors.grey.shade600;
      case CustomButtonStyle.danger:
        return Colors.red;
    }
  }

  Color get foregroundColor => Colors.white; // 글자색 통일
}

/// 버튼 크기 열거형 및 확장
enum ButtonSize { small, medium, large }

extension ButtonSizeExtension on ButtonSize {
  double get height {
    switch (this) {
      case ButtonSize.small:
        return 36.0;
      case ButtonSize.medium:
        return 48.0;
      case ButtonSize.large:
        return 56.0;
    }
  }

  double get fontSize {
    switch (this) {
      case ButtonSize.small:
        return 14.0;
      case ButtonSize.medium:
        return 16.0;
      case ButtonSize.large:
        return 18.0;
    }
  }

  double get padding => this == ButtonSize.small ? 16.0 : 24.0;
}

/// 개선된 커스텀 버튼 위젯
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final CustomButtonStyle style;
  final ButtonSize size;
  final IconData? icon;

  // [추가] 로딩 상태 표시 여부
  final bool isLoading;
  // [추가] 가로로 꽉 채울지 여부
  final bool isFullWidth;
  // [추가] 버튼 둥글기 (커스텀 가능하도록)
  final double borderRadius;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.style = CustomButtonStyle.primary,
    this.size = ButtonSize.medium,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
    this.borderRadius = 8.0,
  });

  @override
  Widget build(BuildContext context) {
    // 로딩 중이거나 onPressed가 null이면 비활성화
    final bool isEnabled = onPressed != null && !isLoading;

    return SizedBox(
      height: size.height,
      // [개선] 가로 꽉 채우기 로직 적용
      width: isFullWidth ? double.infinity : null,
      child: ElevatedButton(
        // 로딩 중일 때는 클릭 방지 (null 전달)
        onPressed: isEnabled ? onPressed : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: style.backgroundColor,
          foregroundColor: style.foregroundColor,
          disabledBackgroundColor: Colors.grey.shade300,
          disabledForegroundColor: Colors.grey.shade600,
          padding: EdgeInsets.symmetric(horizontal: size.padding),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
          ),
          elevation: isEnabled ? 2 : 0, // 비활성화 시 그림자 제거
        ),
        child: isLoading ? _buildLoadingIndicator() : _buildButtonContent(),
      ),
    );
  }

  // [추가] 로딩 인디케이터 위젯
  Widget _buildLoadingIndicator() => SizedBox(
    width: size.fontSize + 4,
    height: size.fontSize + 4,
    child: CircularProgressIndicator(
      strokeWidth: 2.5,
      color: Colors.grey.shade600, // 비활성화 배경에 맞춘 색상
    ),
  );

  // [개선] 버튼 내용물 (오버플로우 방지 적용)
  Widget _buildButtonContent() => Row(
    mainAxisSize: MainAxisSize.min,
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      if (icon != null) ...[
        Icon(icon, size: size.fontSize),
        const SizedBox(width: 8),
      ],
      // [개선] Flexible을 사용하여 긴 텍스트 오버플로우 방지
      Flexible(
        child: Text(
          text,
          style: TextStyle(
            fontSize: size.fontSize,
            fontWeight: FontWeight.w600, // 가독성을 위해 굵기 조정
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis, // 말줄임표 (...) 처리
        ),
      ),
    ],
  );
}
