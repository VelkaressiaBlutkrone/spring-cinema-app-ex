import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../exception/app_exception.dart';
import '../../../models/member.dart';
import '../../../provider/api_providers.dart';
import '../../../theme/cinema_theme.dart';
import '../../../widgets/dialog/error_dialog.dart';
import '../../../widgets/glass_card.dart';
import '../../../widgets/neon_button.dart';

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

class ProfileTab extends ConsumerStatefulWidget {
  const ProfileTab({super.key});

  @override
  ConsumerState<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends ConsumerState<ProfileTab> {
  AsyncValue<MemberProfileModel?> _profile = const AsyncValue.loading();
  MemberProfileForm _form = MemberProfileForm();
  bool _profileSaving = false;

  late final TextEditingController _passwordController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;

  @override
  void initState() {
    super.initState();
    _passwordController = TextEditingController();
    _emailController = TextEditingController();
    _phoneController = TextEditingController();
    _loadProfile();
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _profile = const AsyncValue.loading());
    try {
      final p = await ref.read(memberApiServiceProvider).getProfile();
      if (mounted) {
        setState(() {
          _profile = AsyncValue.data(p);
          _form = MemberProfileForm(email: p.email ?? '', phone: p.phone ?? '');
          _emailController.text = _form.email;
          _phoneController.text = _form.phone;
          _passwordController.text = '';
        });
      }
    } catch (e, st) {
      if (mounted) setState(() => _profile = AsyncValue.error(e, st));
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

  Widget _profileField(
    String label, {
    TextEditingController? controller,
    String? readOnlyValue,
    bool obscure = false,
    void Function(String)? onChanged,
  }) {
    final isReadOnly = readOnlyValue != null;
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
        isReadOnly
            ? TextField(
                controller: TextEditingController(text: readOnlyValue),
                readOnly: true,
                decoration: _fieldDecoration(),
                style: GoogleFonts.roboto(fontSize: 14, color: CinemaColors.textPrimary),
              )
            : TextField(
                controller: controller,
                onChanged: onChanged,
                obscureText: obscure,
                decoration: _fieldDecoration(),
                style: GoogleFonts.roboto(fontSize: 14, color: CinemaColors.textPrimary),
              ),
      ],
    );
  }

  InputDecoration _fieldDecoration() {
    return InputDecoration(
      filled: true,
      fillColor: CinemaColors.surface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: CinemaColors.glassBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: CinemaColors.glassBorder),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    );
  }

  @override
  Widget build(BuildContext context) {
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
                _profileField('아이디', readOnlyValue: p.loginId),
                const SizedBox(height: 16),
                _profileField('이름', readOnlyValue: p.name),
                const SizedBox(height: 16),
                _profileField('새 비밀번호 (변경 시에만 입력)',
                    controller: _passwordController,
                    obscure: true,
                    onChanged: (v) => setState(() => _form = _form.copyWith(password: v))),
                const SizedBox(height: 16),
                _profileField('이메일',
                    controller: _emailController,
                    onChanged: (v) => setState(() => _form = _form.copyWith(email: v))),
                const SizedBox(height: 16),
                _profileField('연락처',
                    controller: _phoneController,
                    onChanged: (v) => setState(() => _form = _form.copyWith(phone: v))),
                const SizedBox(height: 24),
                NeonButton(
                  label: '저장',
                  onPressed: () { _saveProfile(); },
                  isPrimary: true,
                  isLoading: _profileSaving,
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
}
