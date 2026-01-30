import 'package:flutter/material.dart';
import 'package:mobile/exception/app_exception.dart';
import 'package:mobile/widgets/custom_button.dart';

/// 에러 메시지 표시 다이얼로그 위젯
///
/// AppException을 처리하여 사용자에게 에러 메시지를 표시합니다.
/// 재사용 가능한 구조로 설계되었습니다.
///
/// 주요 특징:
/// - AppException 처리
/// - 사용자 친화적인 에러 메시지 표시
/// - 재사용 가능한 구조
///
/// 예시:
/// ```dart
/// try {
///   await someOperation();
/// } on AppException catch (e) {
///   showDialog(
///     context: context,
///     builder: (context) => ErrorDialog(exception: e),
///   );
/// }
/// ```
class ErrorDialog extends StatelessWidget {
  /// 표시할 예외 객체
  ///
  /// AppException 또는 그 하위 클래스입니다.
  final AppException exception;

  /// 다이얼로그 제목
  ///
  /// 기본값은 '오류'입니다.
  final String? title;

  /// 확인 버튼 텍스트
  ///
  /// 기본값은 '확인'입니다.
  final String confirmText;

  /// ErrorDialog 생성자
  ///
  /// [exception] 표시할 예외 객체 (필수)
  /// [title] 다이얼로그 제목 (기본값: '오류')
  /// [confirmText] 확인 버튼 텍스트 (기본값: '확인')
  const ErrorDialog({
    super.key,
    required this.exception,
    this.title,
    this.confirmText = '확인',
  });

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: Text(title ?? '오류'),
    content: Text(exception.message),
    actions: [
      CustomButton(
        text: confirmText,
        size: ButtonSize.small,
        onPressed: () => Navigator.of(context).pop(),
      ),
    ],
  );
}
