import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../exception/app_exception.dart';
import '../../provider/auth_provider.dart';
import '../../theme/cinema_theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/dialog/error_dialog.dart';

/// 로그인 화면 (공통 위젯 사용)
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _loginIdController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _loginIdController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _isLoading = true);
    try {
      await ref.read(authStateProvider.notifier).login(
            _loginIdController.text.trim(),
            _passwordController.text,
          );
      // authState 갱신으로 AuthGate가 MainTabScreen으로 전환
    } on AppException catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      showDialog(
        context: context,
        builder: (ctx) => ErrorDialog(exception: e, title: '로그인 실패'),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      showDialog(
        context: context,
        builder: (ctx) => ErrorDialog(
          exception: AuthException('로그인 중 오류가 발생했습니다.'),
          title: '오류',
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CinemaColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 48),
                Text(
                  '로그인',
                  style: GoogleFonts.bebasNeue(
                    fontSize: 28,
                    color: CinemaColors.textPrimary,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '영화관 예매 서비스',
                  style: GoogleFonts.roboto(
                    fontSize: 14,
                    color: CinemaColors.textMuted,
                  ),
                ),
                const SizedBox(height: 40),
                CustomTextField(
                  label: '아이디',
                  hint: '아이디를 입력하세요',
                  controller: _loginIdController,
                  textInputAction: TextInputAction.next,
                  keyboardType: TextInputType.text,
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? '아이디를 입력하세요' : null,
                ),
                const SizedBox(height: 16),
                CustomTextField(
                  label: '비밀번호',
                  hint: '비밀번호를 입력하세요',
                  controller: _passwordController,
                  obscureText: true,
                  textInputAction: TextInputAction.done,
                  validator: (v) =>
                      (v == null || v.isEmpty) ? '비밀번호를 입력하세요' : null,
                ),
                const SizedBox(height: 32),
                CustomButton(
                  text: '로그인',
                  onPressed: _isLoading ? null : _submit,
                  isLoading: _isLoading,
                  isFullWidth: true,
                  size: ButtonSize.large,
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: _isLoading
                      ? null
                      : () => Navigator.of(context).pushNamed('/signup'),
                  child: Text(
                    '회원가입',
                    style: GoogleFonts.roboto(
                      fontSize: 14,
                      color: CinemaColors.neonBlue,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
