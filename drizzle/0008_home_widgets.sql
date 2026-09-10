alter table couples add column if not exists home_widgets jsonb;
alter table couples add column if not exists home_widgets_revision integer default 0 not null;
