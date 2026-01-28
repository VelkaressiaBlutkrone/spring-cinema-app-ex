# 일반적인 문제 해결 절차

1. **에러 메시지 확인**: 정확한 에러 메시지와 스택 트레이스 확인
2. **로그 확인**:
   - 백엔드: `logs/application.log`, `logs/error.log`
   - 프론트엔드: 브라우저 콘솔, 개발자 도구
3. **의존성 확인**:
   - 백엔드: `build.gradle` 의존성 버전
   - 프론트엔드: `package.json` 패키지 버전
4. **캐시 정리**:
   - Gradle: `./gradlew clean`
   - npm: `rm -rf node_modules && npm install`
5. **재시작**: IDE, 서버, 개발 서버 재시작

## 문제 해결 체크리스트

- [X] 에러 메시지를 정확히 읽고 이해했는가?
- [X] 관련 로그 파일을 확인했는가?
- [X] 의존성 버전이 호환되는가?
- [X] 캐시를 정리했는가?
- [X] 서버/개발 서버를 재시작했는가?
- [X] 환경 변수 설정이 올바른가?
- [X] 포트가 충돌하지 않는가?
- [X] 데이터베이스 연결이 정상인가?

## 추가 도움말

문제가 지속되면:

1. 이 문서의 관련 섹션을 다시 확인
2. 프로젝트의 `README.md` 확인
3. 관련 기술 문서 참조:
   - [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
   - [React 공식 문서](https://react.dev)
   - [TypeScript 공식 문서](https://www.typescriptlang.org)
   - [Vite 공식 문서](https://vitejs.dev)
