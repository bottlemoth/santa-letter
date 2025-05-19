drop table if exists users;
create table users(
    id varchar primary key,
    username varchar not null,
    password varchar not null,
    added_dtm timestamp not null default now()
);