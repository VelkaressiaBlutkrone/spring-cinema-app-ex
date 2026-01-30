import 'package:flutter_riverpod/flutter_riverpod.dart';

/// 메인 탭 인덱스 (홈 0, 영화찾기 1, 예매내역 2, 마이페이지 3)
/// 홈 화면에서 "지금 바로 예매하기" / "예매 내역 전체 보기" 시 해당 탭으로 전환용
final mainTabIndexProvider =
    NotifierProvider<MainTabIndexNotifier, int>(MainTabIndexNotifier.new);

class MainTabIndexNotifier extends Notifier<int> {
  @override
  int build() => 0;

  void setIndex(int index) {
    state = index;
  }
}
