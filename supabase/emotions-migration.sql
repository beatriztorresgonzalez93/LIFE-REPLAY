-- Ampliar emociones permitidas (ejecutar una vez en SQL Editor si ya tenías el schema)

alter table public.episodes drop constraint if exists episodes_emotion_check;

alter table public.episodes add constraint episodes_emotion_check check (
  emotion in (
    'joy','sadness','anxiety','love','anger','calm','hope','nostalgia',
    'gratitude','pride','fear','loneliness','surprise','tiredness'
  )
);
