DROP TABLE IF EXISTS taken;

CREATE TABLE taken(
    id varchar PRIMARY KEY,
    user_id varchar REFERENCES users(id),
    present_id varchar REFERENCES Presents(id)
)
