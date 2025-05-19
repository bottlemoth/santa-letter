drop table if exists presents;

create table presents(
    id varchar primary key,
    Link varchar,
    user_id varchar REFERENCES users(id),
    opis varchar,
    approved boolean default false);

insert into presents(id,link,opis) values('2','23','awde');