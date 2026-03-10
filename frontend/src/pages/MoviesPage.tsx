/**
 * 영화 목록 — Noir Luxe theme
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, LayoutGroup } from 'framer-motion';
import { moviesApi, screeningsApi } from '@/api/movies';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { EmptyState } from '@/components/common/ui/EmptyState';
import { Modal } from '@/components/common/ui/Modal';
import { useToast } from '@/hooks';
import { getErrorMessage } from '@/utils/errorHandler';
import { formatDate, getScreeningDisplayStatus, SCREENING_DISPLAY_LABEL } from '@/utils/dateUtils';
import { scaleIn, staggerContainer } from '@/lib/animations';
import type { Movie, Screening } from '@/types/movie.types';
import type { SpringPage } from '@/types/api.types';

export function MoviesPage() {
  const { showError } = useToast();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [schedules, setSchedules] = useState<Screening[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  const { data: movies, isLoading: loading, error } = useQuery<SpringPage<Movie> | null>({
    queryKey: ['movies', { page: 0, size: 20 }],
    queryFn: async () => {
      const res = await moviesApi.getMovies({ page: 0, size: 20 });
      return res.data as SpringPage<Movie> | null;
    },
  });

  useEffect(() => {
    if (error) showError(getErrorMessage(error));
  }, [error, showError]);

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
      <h1 className="mb-6 font-display text-2xl tracking-widest text-noir-text">영화 목록</h1>
      {isEmpty ? (
        <EmptyState title="등록된 영화가 없습니다" message="곧 다양한 영화가 상영될 예정입니다." />
      ) : (
        <LayoutGroup>
        <motion.ul
          className="flex gap-5 overflow-x-auto pb-4 scroll-snap-x list-none"
          aria-label="영화 목록"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {list.map((movie) => (
            <motion.li key={movie.id} className="scroll-snap-item shrink-0" variants={scaleIn}>
              <button
                type="button"
                onClick={() => openDetail(movie)}
                className="group flex w-[min(180px,40vw)] flex-col overflow-hidden rounded-sm border border-noir-border bg-noir-surface text-left shadow-lg transition-all duration-300 hover:border-amber/50 hover:shadow-[0_0_24px_rgba(232,168,73,0.2)] focus:outline-none focus:ring-2 focus:ring-amber/50"
              >
              <motion.div
                layoutId={`poster-${movie.id}`}
                className="relative aspect-[2/3] overflow-hidden bg-noir-elevated"
              >
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-full w-full object-cover transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-noir-text-muted">
                    🎬
                  </div>
                )}
                <div className="poster-overlay" aria-hidden />
              </motion.div>
              <div className="p-3">
                <motion.h2
                  layoutId={`title-${movie.id}`}
                  className="line-clamp-2 font-medium text-noir-text transition group-hover:text-amber"
                >
                  {movie.title}
                </motion.h2>
                {movie.releaseDate && (
                  <p className="mt-1 text-xs text-noir-text-muted">
                    {formatDate(movie.releaseDate, 'YYYY-MM-DD')}
                  </p>
                )}
              </div>
              </button>
            </motion.li>
          ))}
        </motion.ul>
        </LayoutGroup>
      )}

      <Modal isOpen={!!selectedMovie} onClose={closeDetail} title={selectedMovie?.title} size="lg">
        {selectedMovie && (
          <div className="space-y-4 text-noir-text">
            <motion.div
              layoutId={`poster-${selectedMovie.id}`}
              className="mx-auto aspect-[2/3] w-32 overflow-hidden rounded-sm bg-noir-elevated"
            >
              {selectedMovie.posterUrl ? (
                <img
                  src={selectedMovie.posterUrl}
                  alt={selectedMovie.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl text-noir-text-muted">
                  🎬
                </div>
              )}
            </motion.div>
            <p className="text-noir-text-muted">{selectedMovie.description ?? '-'}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-noir-text-muted">
              {selectedMovie.runningTime && <span>상영시간: {selectedMovie.runningTime}분</span>}
              {selectedMovie.rating && <span>등급: {selectedMovie.rating}</span>}
              {selectedMovie.genre && <span>장르: {selectedMovie.genre}</span>}
              {selectedMovie.director && <span>감독: {selectedMovie.director}</span>}
            </div>
            <div>
              <h3 className="mb-2 font-display text-base tracking-widest text-noir-text">
                상영 시간표
              </h3>
              {schedulesLoading ? (
                <LoadingSpinner size="sm" message="상영 일정 조회 중..." />
              ) : schedules.length === 0 ? (
                <p className="text-sm text-noir-text-muted">상영 예정인 일정이 없습니다.</p>
              ) : (
                <ul className="max-h-48 space-y-2 overflow-y-auto rounded-sm border border-noir-border bg-noir-bg p-3">
                  {schedules.map((s) => {
                    const displayStatus = getScreeningDisplayStatus(s.startTime, s.endTime);
                    const canBook = displayStatus === 'BOOKABLE';
                    return (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-noir-surface px-3 py-2 text-sm"
                      >
                        <span className="text-noir-text-muted">
                          {[s.theaterName, s.screenName]
                            .filter(Boolean)
                            .join(' - ')}{' '}
                          · {SCREENING_DISPLAY_LABEL[displayStatus]}
                        </span>
                        <span className="text-noir-text-muted">
                          {formatDate(s.startTime, 'YYYY-MM-DD HH:mm')} ~{' '}
                          {formatDate(s.endTime, 'HH:mm')}
                        </span>
                        {canBook ? (
                          <Link
                            to={`/book/${s.id}`}
                            state={{ screening: s }}
                            className="shrink-0 rounded-sm bg-amber px-3 py-1.5 text-xs font-medium text-noir-bg transition hover:opacity-90"
                          >
                            예매하기
                          </Link>
                        ) : (
                          <span className="shrink-0 rounded-sm border border-noir-border bg-noir-surface px-3 py-1.5 text-xs font-medium text-noir-text-muted cursor-not-allowed">
                            {SCREENING_DISPLAY_LABEL[displayStatus]}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
