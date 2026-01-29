# 영화 관련 컴포넌트

영화 정보 표시, 상영 시간표 등 영화 도메인 컴포넌트입니다.

## 개요

현재 영화 관련 컴포넌트는 페이지 레벨에서 직접 구현되어 있으며, 향후 재사용 가능한 컴포넌트로 분리할 예정입니다.

## 예정 컴포넌트

### MovieCard

영화 정보를 카드 형태로 표시하는 컴포넌트

**Props (예정)**:
```typescript
interface MovieCardProps {
  movie: Movie;
  onClick?: (movieId: number) => void;
  className?: string;
}
```

**사용 예시**:
```typescript
import { MovieCard } from '@/components/movie';

function MovieListPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {movies.map(movie => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onClick={(id) => navigate(`/movies/${id}`)}
        />
      ))}
    </div>
  );
}
```

---

### MovieList

영화 목록을 표시하는 컴포넌트

**Props (예정)**:
```typescript
interface MovieListProps {
  movies: Movie[];
  loading?: boolean;
  onMovieClick?: (movieId: number) => void;
}
```

---

### MovieDetail

영화 상세 정보를 표시하는 컴포넌트

**Props (예정)**:
```typescript
interface MovieDetailProps {
  movie: Movie;
  screenings?: Screening[];
}
```

---

### TimeTable

상영 시간표를 표시하는 컴포넌트

**Props (예정)**:
```typescript
interface TimeTableProps {
  screenings: Screening[];
  onScreeningSelect?: (screeningId: number) => void;
}
```

**사용 예시**:
```typescript
import { TimeTable } from '@/components/movie';

function MovieDetailPage() {
  const screenings = [
    { id: 1, startTime: '2026-01-29T10:00:00Z', ... },
    { id: 2, startTime: '2026-01-29T13:00:00Z', ... },
  ];
  
  return (
    <TimeTable
      screenings={screenings}
      onScreeningSelect={(id) => navigate(`/booking/${id}`)}
    />
  );
}
```

---

### ScreeningList

상영 스케줄 목록을 표시하는 컴포넌트

**Props (예정)**:
```typescript
interface ScreeningListProps {
  movieId: number;
  screenings: Screening[];
  groupByDate?: boolean;
}
```

## 관련 타입

영화 및 상영 관련 타입은 `@/types/movie.types`에 정의되어 있습니다:

```typescript
// @/types/movie.types
interface Movie {
  id: number;
  title: string;
  description?: string;
  runningTime?: number;
  rating?: string;
  genre?: string;
  director?: string;
  actors?: string;
  posterUrl?: string;
  releaseDate?: string;
  status: MovieStatus;
  createdAt?: string;
  updatedAt?: string;
}

type MovieStatus = 'RELEASED' | 'UPCOMING' | 'ENDED' | 'DELETED';

interface Screening {
  id: number;
  movieId: number;
  movieTitle: string;
  screenId: number;
  screenName: string;
  theaterName?: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  status: ScreeningStatus;
  createdAt?: string;
  updatedAt?: string;
}

type ScreeningStatus = 'SCHEDULED' | 'NOW_SHOWING' | 'ONGOING' | 'ENDED' | 'CANCELLED';
```

## 상영 상태 라벨

상영 상태를 한글로 표시하려면 `SCREENING_STATUS_LABEL` 상수를 사용할 수 있습니다:

```typescript
import { SCREENING_STATUS_LABEL } from '@/types/movie.types';

// 사용 예시
const statusText = SCREENING_STATUS_LABEL[screening.status]; // "상영 중"
```

**상태별 라벨**:
- `SCHEDULED`: "상영 예정"
- `NOW_SHOWING`: "상영 중"
- `ONGOING`: "상영 중"
- `ENDED`: "상영 종료"
- `CANCELLED`: "상영 취소"

## API 연동

영화 및 상영 정보는 `@/api/movies`를 통해 가져옵니다:

```typescript
import { moviesApi, screeningsApi } from '@/api/movies';

// 전체 영화 목록 조회
const movies = await moviesApi.getMovies();

// 특정 영화 조회
const movie = await moviesApi.getMovie(movieId);

// 특정 영화의 상영 스케줄 조회
const screenings = await screeningsApi.getScreeningsByMovie(movieId);

// 특정 상영 조회
const screening = await screeningsApi.getScreening(screeningId);
```

## Cinema Theme 스타일링

영화 컴포넌트는 프로젝트의 Cinema/Neon 테마를 따릅니다:

- **GlassCard**: 반투명 유리 효과 카드
- **NeonButton**: 네온 글로우 효과 버튼
- **Cinema 색상**: 
  - Primary: `#00d4ff` (neon blue)
  - Background: `#121212` (dark)
  - Surface: `#1a1a1a`
  - Muted: `#9ca3af`

## 관련 파일

- `@/types/movie.types`: 영화 및 상영 타입 정의
- `@/api/movies`: 영화/상영 API 호출
- `@/components/common/GlassCard`: Glassmorphism 카드
- `@/components/common/NeonButton`: Neon 효과 버튼
