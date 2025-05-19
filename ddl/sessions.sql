drop table if exists sessions;
create table sessions(
    id varchar primary key,
    valid_to timestamp not null,
    user_id varchar,
    added_dtm timestamp not null default now())