// 마이페이지 — 웹 MyPage와 동일 구성
// 탭: 내 정보 / 장바구니 / 결제·예매 내역
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../exception/app_exception.dart';
import '../../models/member.dart';
import '../../models/reservation.dart';
import '../../provider/api_providers.dart';
import '../../provider/main_tab_provider.dart';
import '../../theme/cinema_theme.dart';
import '../../widgets/dialog/error_dialog.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/neon_button.dart';
import '../seat/seat_select_screen.dart';
import '../reservations/reservation_detail_screen.dart';

enum MyPageTab { profile, holds, reservations }

class MyPageScreen extends ConsumerStatefulWidget {
  const MyPageScreen({super.key});

  @override
  ConsumerState<MyPageScreen> createState() => _MyPageScreenState();
}

class _MyPageScreenState extends ConsumerState<MyPageScreen> {
  MyPageTab _tab = MyPageTab.profile;

  AsyncValue<MemberProfileModel?> _profile = const AsyncValue.loading();
  MemberProfileForm _form = MemberProfileForm();

  AsyncValue<List<MemberHoldSummaryModel>> _holds = const AsyncValue.loading();
  String? _releasingKey;

  AsyncValue<List<ReservationDetailModel>> _reservations = const AsyncValue.loading();
  bool _profileSaving = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  void _onTabChanged(MyPageTab tab) {
    setState(() => _tab = tab);
    if (tab == MyPageTab.holds) _loadHolds();
    if (tab == MyPageTab.reservations) _loadReservations();
  }

  Future<void> _loadProfile() async {
    setState(() => _profile = const AsyncValue.loading());
    try {
      final p = await ref.read(memberApiServiceProvider).getProfile();
      if (mounted) {
        setState(() {
          _profile = AsyncValue.data(p);
          _form = MemberProfileForm(email: p.email ?? '', phone: p.phone ?? '');
        });
      }
    } catch (e, st) {
      if (mounted) setState(() => _profile = AsyncValue.error(e, st));
    }
  }

  Future<void> _loadHolds() async {
    setState(() => _holds = const AsyncValue.loading());
    try {
      final list = await ref.read(memberApiServiceProvider).getMyHolds();
      if (mounted) setState(() => _holds = AsyncValue.data(list));
    } catch (e, st) {
      if (mounted) setState(() => _holds = AsyncValue.error(e, st));
    }
  }

  Future<void> _loadReservations() async {
    setState(() => _reservations = const AsyncValue.loading());
    try {
      final list = await ref.read(reservationApiServiceProvider).getMyReservations();
      if (mounted) setState(() => _reservations = AsyncValue.data(list));
    } catch (e, st) {
      if (mounted) setState(() => _reservations = AsyncValue.error(e, st));
    }
  }

  Future<void> _saveProfile() async {
    final p = _profile.value;
    if (p == null) return;
    setState(() => _profileSaving = true);
    try {
      await ref.read(memberApiServiceProvider).updateProfile(
            password: _form.password.isEmpty ? null : _form.password,
            email: _form.email,
            phone: _form.phone,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('저장되었습니다.'), backgroundColor: CinemaColors.neonBlue),
        );
        _loadProfile();
      }
    } on AppException catch (e) {
      if (mounted) {
        await showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(exception: e, title: '저장 실패'),
        );
      }
    } catch (_) {
      if (mounted) {
        await showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(exception: AuthException('저장에 실패했습니다.'), title: '저장 실패'),
        );
      }
    } finally {
      if (mounted) setState(() => _profileSaving = false);
    }
  }

  Future<void> _releaseHold(int screeningId, int seatId, String holdToken) async {
    final key = '$screeningId-$seatId';
    setState(() => _releasingKey = key);
    try {
      await ref.read(screeningApiServiceProvider).releaseHold(screeningId, seatId, holdToken);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('좌석이 해제되었습니다.'), backgroundColor: CinemaColors.neonBlue),
        );
        _loadHolds();
      }
    } on AppException catch (e) {
      if (mounted) {
        await showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(exception: e, title: '해제 실패'),
        );
      }
    } catch (_) {
      if (mounted) {
        await showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(exception: AuthException('해제에 실패했습니다.'), title: '해제 실패'),
        );
      }
    } finally {
      if (mounted) setState(() => _releasingKey = null);
    }
  }

  static String _formatDateTime(String? iso) {
    if (iso == null || iso.isEmpty) return '-';
    try {
      return DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  static String _formatTime(String? iso) {
    if (iso == null || iso.isEmpty) return '-';
    try {
      return DateFormat('HH:mm').format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  static String _formatPrice(int amount) => NumberFormat('#,###원').format(amount);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CinemaColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          '마이페이지',
          style: GoogleFonts.bebasNeue(
            fontSize: 24,
            color: CinemaColors.textPrimary,
            letterSpacing: 2,
          ),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildTabBar(),
          Expanded(
            child: switch (_tab) {
              MyPageTab.profile => _buildProfileTab(),
              MyPageTab.holds => _buildHoldsTab(),
              MyPageTab.reservations => _buildReservationsTab(),
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: CinemaColors.glassBorder)),
      ),
      child: Row(
        children: [
          _tabChip('내 정보', _tab == MyPageTab.profile, () => _onTabChanged(MyPageTab.profile)),
          _tabChip('장바구니', _tab == MyPageTab.holds, () => _onTabChanged(MyPageTab.holds)),
          _tabChip('결제/예매 내역', _tab == MyPageTab.reservations, () => _onTabChanged(MyPageTab.reservations)),
        ],
      ),
    );
  }

  Widget _tabChip(String label, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isActive ? CinemaColors.neonBlue : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.roboto(
            fontSize: 14,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
            color: isActive ? CinemaColors.neonBlue : CinemaColors.textMuted,
          ),
        ),
      ),
    );
  }

  Widget _buildProfileTab() {
    return _profile.when(
      data: (p) {
        if (p == null) return const SizedBox.shrink();
        return SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: GlassCard(
            padding: const EdgeInsets.all(20),
            borderRadius: 20,
            blur: 20,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _profileField('아이디', p.loginId, readOnly: true),
                const SizedBox(height: 16),
                _profileField('이름', p.name, readOnly: true),
                const SizedBox(height: 16),
                _profileField('새 비밀번호 (변경 시에만 입력)', _form.password,
                    readOnly: false, obscure: true, onChanged: (v) => setState(() => _form = _form.copyWith(password: v))),
                const SizedBox(height: 16),
                _profileField('이메일', _form.email,
                    onChanged: (v) => setState(() => _form = _form.copyWith(email: v))),
                const SizedBox(height: 16),
                _profileField('연락처', _form.phone,
                    onChanged: (v) => setState(() => _form = _form.copyWith(phone: v))),
                const SizedBox(height: 24),
                NeonButton(
                  label: _profileSaving ? '저장 중...' : '저장',
                  onPressed: _profileSaving ? () {} : () { _saveProfile(); },
                  isPrimary: true,
                ),
              ],
            ),
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator(color: CinemaColors.neonBlue)),
      error: (e, _) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              e.toString(),
              style: GoogleFonts.roboto(color: CinemaColors.neonRed, fontSize: 12),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            TextButton(onPressed: _loadProfile, child: const Text('다시 시도')),
          ],
        ),
      ),
    );
  }

  Widget _profileField(
    String label,
    String value, {
    bool readOnly = false,
    bool obscure = false,
    void Function(String)? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.roboto(
            fontSize: 12,
            color: CinemaColors.textMuted,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: TextEditingController(text: value),
          onChanged: onChanged,
          readOnly: readOnly,
          obscureText: obscure,
          decoration: InputDecoration(
            filled: true,
            fillColor: readOnly ? CinemaColors.surface : CinemaColors.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: CinemaColors.glassBorder),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: CinemaColors.glassBorder),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
          style: GoogleFonts.roboto(
            fontSize: 14,
            color: CinemaColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildHoldsTab() {
    return _holds.when(
      data: (list) {
        if (list.isEmpty) {
          return _emptyState(
            icon: Icons.event_seat_outlined,
            title: '장바구니가 비어 있습니다',
            message: '영화 목록에서 좌석을 선택하면 여기에 표시됩니다.',
            onAction: () => ref.read(mainTabIndexProvider.notifier).setIndex(1),
            actionLabel: '영화 목록',
          );
        }
        return RefreshIndicator(
          onRefresh: _loadHolds,
          color: CinemaColors.neonBlue,
          child: ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: list.length,
            itemBuilder: (context, i) {
              final h = list[i];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: GlassCard(
                  padding: const EdgeInsets.all(16),
                  borderRadius: 16,
                  blur: 20,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  h.movieTitle,
                                  style: GoogleFonts.roboto(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: CinemaColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${h.screenName} · ${_formatDateTime(h.startTime)}',
                                  style: GoogleFonts.roboto(
                                    fontSize: 12,
                                    color: CinemaColors.textMuted,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '${h.seats.length}석 · ${h.seats.map((s) => s.displayName).join(', ')}',
                                  style: GoogleFonts.roboto(
                                    fontSize: 12,
                                    color: CinemaColors.neonAmber,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          NeonButton(
                            label: '결제하기',
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => SeatSelectScreen(
                                    screeningId: h.screeningId,
                                    movieTitle: h.movieTitle,
                                    screenName: h.screenName,
                                    theaterName: '',
                                    startTime: h.startTime,
                                  ),
                                ),
                              );
                            },
                            isPrimary: true,
                          ),
                        ],
                      ),
                      const Divider(color: CinemaColors.glassBorder, height: 24),
                      ...h.seats.map(
                        (s) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${s.displayName} (만료: ${_formatTime(s.holdExpireAt)})',
                                style: GoogleFonts.roboto(
                                  fontSize: 12,
                                  color: CinemaColors.textMuted,
                                ),
                              ),
                              TextButton(
                                onPressed: _releasingKey == '${h.screeningId}-${s.seatId}'
                                    ? null
                                    : () => _releaseHold(h.screeningId, s.seatId, s.holdToken),
                                child: Text(
                                  _releasingKey == '${h.screeningId}-${s.seatId}' ? '해제 중...' : '해제',
                                  style: GoogleFonts.roboto(
                                    fontSize: 12,
                                    color: CinemaColors.neonBlue,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator(color: CinemaColors.neonBlue)),
      error: (e, _) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              e.toString(),
              style: GoogleFonts.roboto(color: CinemaColors.neonRed, fontSize: 12),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            TextButton(onPressed: _loadHolds, child: const Text('다시 시도')),
          ],
        ),
      ),
    );
  }

  Widget _buildReservationsTab() {
    return _reservations.when(
      data: (list) {
        if (list.isEmpty) {
          return _emptyState(
            icon: Icons.confirmation_number_outlined,
            title: '예매 내역이 없습니다',
            message: '영화 목록에서 상영을 선택해 예매해 보세요.',
            onAction: () => ref.read(mainTabIndexProvider.notifier).setIndex(1),
            actionLabel: '영화 목록',
          );
        }
        return RefreshIndicator(
          onRefresh: _loadReservations,
          color: CinemaColors.neonBlue,
          child: ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: list.length,
            itemBuilder: (context, i) {
              final r = list[i];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: GlassCard(
                  padding: const EdgeInsets.all(16),
                  borderRadius: 16,
                  blur: 20,
                  child: InkWell(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => ReservationDetailScreen(reservationId: r.reservationId),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          r.movieTitle,
                          style: GoogleFonts.roboto(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: CinemaColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${r.screenName} · ${_formatDateTime(r.startTime)}',
                          style: GoogleFonts.roboto(
                            fontSize: 12,
                            color: CinemaColors.textMuted,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          r.reservationNo,
                          style: GoogleFonts.roboto(
                            fontSize: 12,
                            color: CinemaColors.neonBlue,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${r.totalSeats}석 · ${_formatPrice(r.totalAmount)}',
                          style: GoogleFonts.roboto(
                            fontSize: 12,
                            color: CinemaColors.neonAmber,
                          ),
                        ),
                        if (r.payment != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            '결제 ${r.payment!.payStatus} · ${_formatPrice(r.payment!.payAmount)}${r.payment!.paidAt != null ? ' · ${_formatDateTime(r.payment!.paidAt)}' : ''}',
                            style: GoogleFonts.roboto(
                              fontSize: 11,
                              color: CinemaColors.textMuted,
                            ),
                          ),
                        ],
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: Text(
                            '상세 →',
                            style: GoogleFonts.roboto(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: CinemaColors.neonBlue,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator(color: CinemaColors.neonBlue)),
      error: (e, _) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              e.toString(),
              style: GoogleFonts.roboto(color: CinemaColors.neonRed, fontSize: 12),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            TextButton(onPressed: _loadReservations, child: const Text('다시 시도')),
          ],
        ),
      ),
    );
  }

  Widget _emptyState({
    required IconData icon,
    required String title,
    required String message,
    required VoidCallback onAction,
    required String actionLabel,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 56, color: CinemaColors.textMuted.withValues(alpha: 0.6)),
            const SizedBox(height: 16),
            Text(
              title,
              style: GoogleFonts.roboto(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: CinemaColors.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: GoogleFonts.roboto(
                fontSize: 13,
                color: CinemaColors.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            NeonButton(label: actionLabel, onPressed: onAction, isPrimary: true),
          ],
        ),
      ),
    );
  }
}

class MemberProfileForm {
  MemberProfileForm({
    this.password = '',
    this.email = '',
    this.phone = '',
  });

  final String password;
  final String email;
  final String phone;

  MemberProfileForm copyWith({
    String? password,
    String? email,
    String? phone,
  }) {
    return MemberProfileForm(
      password: password ?? this.password,
      email: email ?? this.email,
      phone: phone ?? this.phone,
    );
  }
}
