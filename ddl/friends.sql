DROP TABLE IF EXISTS Friends;
CREATE TABLE Friends(
    id varchar primary key,
    user_id varchar REFERENCES users(id),
    friend_id varchar )