/**
 * 영화 목록 — cinema theme
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { moviesApi, screeningsApi } from '@/api/movies';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate } from '@/utils/dateUtils';
import type { Movie, Screening } from '@/types/movie.types';
import { SCREENING_STATUS_LABEL } from '@/types/movie.types';
import type { SpringPage } from '@/types/api.types';

export function MoviesPage() {
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<SpringPage<Movie> | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [schedules, setSchedules] = useState<Screening[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await moviesApi.getMovies({ page: 0, size: 20 });
        if (!cancelled && res.data) setMovies(res.data as SpringPage<Movie>);
      } catch (err) {
        if (!cancelled) showError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => {
      cancelled = true;
    };
  }, [showError]);

  const openDetail = async (movie: Movie) => {
    setSelectedMovie(movie);
    setSchedulesLoading(true);
    setSchedules([]);
    try {
      const res = await screeningsApi.getScreeningsByMovie(movie.id);
      if (res.data) setSchedules(res.data as Screening[]);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSchedulesLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedMovie(null);
    setSchedules([]);
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <LoadingSpinner size="lg" message="영화 목록을 불러오는 중..." />
      </div>
    );
  }

  const list = movies?.content ?? [];
  const isEmpty = list.length === 0;

  return (
    <div className="py-4">
      <h1
        className="mb-6 font-display text-2xl tracking-widest text-cinema-text"
      >
        영화 목록
      </h1>
      {isEmpty ? (
        <EmptyState
          title="등록된 영화가 없습니다"
          message="곧 다양한 영화가 상영될 예정입니다."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.map((movie) => (
            <button
              type="button"
              key={movie.id}
              onClick={() => openDetail(movie)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-cinema-glass-border bg-cinema-surface text-left shadow-lg transition hover:border-cinema-neon-blue/40 hover:shadow-[0_0_24px_rgba(0,212,255,0.12)] focus:outline-none focus:ring-2 focus:ring-cinema-neon-blue/50"
            >
              <div className="aspect-[2/3] bg-cinema-surface-elevated">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-cinema-muted-dark">
                    🎬
                  </div>
                )}
              </div>
              <div className="p-3">
                <h2 className="line-clamp-2 font-medium text-cinema-text group-hover:text-cinema-neon-blue transition">
                  {movie.title}
                </h2>
                {movie.releaseDate && (
                  <p className="mt-1 text-xs text-cinema-muted">
                    {formatDate(movie.releaseDate, 'YYYY-MM-DD')}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedMovie}
        onClose={closeDetail}
        title={selectedMovie?.title}
        size="lg"
      >
        {selectedMovie && (
          <div className="space-y-4 text-cinema-text">
            <p className="text-cinema-muted">{selectedMovie.description ?? '-'}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-cinema-muted">
              {selectedMovie.runningTime && (
                <span>상영시간: {selectedMovie.runningTime}분</span>
              )}
              {selectedMovie.rating && <span>등급: {selectedMovie.rating}</span>}
              {selectedMovie.genre && <span>장르: {selectedMovie.genre}</span>}
              {selectedMovie.director && <span>감독: {selectedMovie.director}</span>}
            </div>
            <div>
              <h3 className="mb-2 font-display text-base tracking-widest text-cinema-text">
                상영 시간표
              </h3>
              {schedulesLoading ? (
                <LoadingSpinner size="sm" message="상영 일정 조회 중..." />
              ) : schedules.length === 0 ? (
                <p className="text-sm text-cinema-muted">상영 예정인 일정이 없습니다.</p>
              ) : (
                <ul className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-cinema-glass-border bg-cinema-bg p-3">
                  {schedules.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-cinema-surface px-3 py-2 text-sm"
                    >
                      <span className="text-cinema-muted">
                        {[s.theaterName, s.screenName, SCREENING_STATUS_LABEL[s.status] ?? s.status]
                          .filter(Boolean)
                          .join(' - ')}
                      </span>
                      <span className="text-cinema-muted-dark">
                        {formatDate(s.startTime, 'YYYY-MM-DD HH:mm')} ~{' '}
                        {formatDate(s.endTime, 'HH:mm')}
                      </span>
                      <Link
                        to={`/book/${s.id}`}
                        state={{ screening: s }}
                        className="shrink-0 rounded-lg bg-cinema-neon-blue px-3 py-1.5 text-xs font-medium text-cinema-bg transition hover:opacity-90"
                      >
                        예매하기
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
