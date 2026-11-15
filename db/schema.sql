create table if not exists events (
  id          bigserial,
  ts          timestamptz not null default now(),
  run_id      text not null,
  files       text[] not null,
  diff        text not null,
  facts       jsonb not null,
  answers     jsonb not null,
  verdict     text not null,
  reason      text not null,
  fired_by    text,
  escalated   boolean not null default false,
  latency_ms  int not null,
  cost_usd    numeric not null
);
select create_hypertable('events', 'ts', if_not_exists => true);

create table if not exists line (
  id       int primary key default 1,
  stopped  boolean not null default false,
  reason   text,
  event_id bigint,
  since    timestamptz
);
insert into line (id) values (1) on conflict (id) do nothing;
-- What the human checked before resuming. Added after the first schema, so it is an alter.
alter table line add column if not exists note text;

-- Checks per minute by verdict (Tiger Data continuous aggregate). "with no data" lets it
-- be created inside db-init's single transaction; materialized_only = false folds in the
-- not-yet-materialized current minute so the board's totals never lag the policy.
create materialized view if not exists checks_per_minute
with (timescaledb.continuous, timescaledb.materialized_only = false) as
select time_bucket('1 minute', ts) as minute,
       verdict,
       count(*)      as checks,
       sum(cost_usd) as cost_usd
from events
group by minute, verdict
with no data;

-- start_offset null refreshes the whole history each minute: tiny at demo scale, and it
-- means old events are never left out when the aggregate is first created.
select remove_continuous_aggregate_policy('checks_per_minute', if_exists => true);
select add_continuous_aggregate_policy('checks_per_minute',
  start_offset      => null,
  end_offset        => interval '1 minute',
  schedule_interval => interval '1 minute',
  if_not_exists     => true);
