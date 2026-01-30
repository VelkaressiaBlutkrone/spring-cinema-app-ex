import 'package:flutter/material.dart';

/// 전체 화면 로딩 오버레이 (공통 위젯)
///
/// 비동기 작업 중 화면을 덮어 터치를 막고 로딩 인디케이터를 표시합니다.
class LoadingOverlay extends StatelessWidget {
  const LoadingOverlay({
    super.key,
    this.isLoading = false,
    this.child,
    this.message,
  });

  final bool isLoading;
  final Widget? child;
  final String? message;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (child != null) child!,
        if (isLoading)
          Container(
            color: Colors.black54,
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircularProgressIndicator(),
                  if (message != null && message!.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Text(
                      message!,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.white70,
                          ),
                    ),
                  ],
                ],
              ),
            ),
          ),
      ],
    );
  }
}
