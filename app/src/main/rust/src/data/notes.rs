mod schema {
    diesel::table! {
        notes(_id) {
            _id ->  Nullable<Integer>,
            title ->  Text,
            content ->  Text,
            create_at ->  BigInt,
            update_at ->  BigInt,
        }
    }
}

use diesel::{self, result::QueryResult, prelude::*};
use crate::server::NotesConnection;
use self::schema::notes;
use self::schema::notes::dsl::{notes as all_notes};
use rocket::serde::{Serialize, Deserialize};
use crate::util::get_epoch_ms;

#[derive(Serialize, Deserialize, Queryable, Insertable, Debug, Clone)]
#[serde(crate = "rocket::serde")]
#[table_name = "notes"]
pub struct Notes {
    pub _id: Option<i32>,
    pub title: String,
    pub content: String,
    #[serde(skip_deserializing, skip_serializing)]
    pub create_at: i64,
    #[serde(skip_deserializing, skip_serializing)]
    pub update_at: i64,
}

#[derive(Serialize, Queryable)]
pub struct Note {
    pub _id: Option<i32>,
    pub title: String,
    pub update_at: i64,
}

impl Notes {
    pub async fn all(conn: &NotesConnection) -> QueryResult<Vec<Note>> {
        conn.run(|c| {
            notes::table
                .select((notes::_id, notes::title, notes::update_at))
                .order(notes::update_at.desc()).load::<Note>(c)
        }).await
    }
    pub async fn insert(note: Notes, conn: &NotesConnection) -> QueryResult<usize> {
        conn.run(|c| {
            let t = Notes {
                _id: None,
                title: note.title,
                content: note.content,
                create_at: (get_epoch_ms() / 1000) as i64,
                update_at: (get_epoch_ms() / 1000) as i64,
            };
            diesel::insert_into(notes::table).values(&t).execute(c)
        }).await
    }
    pub async fn search(needle: String, conn: &NotesConnection) -> QueryResult<Vec<Note>> {
        conn.run(|c| {
            notes::table
                .select((notes::_id, notes::title, notes::update_at))
                .filter(notes::title.like(needle))
                .order(notes::update_at.desc()).load::<Note>(c)
        }).await
    }
    pub async fn like(needle: String, conn: &NotesConnection) -> QueryResult<Vec<Note>> {
        conn.run(|c| {
            notes::table
                .select((notes::_id, notes::title, notes::update_at))
                .filter(notes::content.like(needle))
                .order(notes::update_at.desc()).load::<Note>(c)
        }).await
    }
    pub async fn query_content(id: i32, conn: &NotesConnection) -> QueryResult<String> {
        conn.run(move |c| {
            let v = notes::table.filter(notes::_id.eq(&id))
                .get_result::<Notes>(c);
            return match v {
                Ok(v) => {
                    Ok(v.title + "\n\n" + &v.content)
                }
                Err(err) => {
                    Ok(String::new())
                }
            };
        }).await
    }
    pub async fn update(v: Notes, conn: &NotesConnection) -> QueryResult<usize> {
        conn.run(move |c| {
            let size = (get_epoch_ms() / 1000) as i64;
            let updated_notes = diesel::update(notes::table.filter(notes::_id.eq(v._id)));
            updated_notes.set((
                notes::title.eq(v.title.as_str()),
                notes::content.eq(v.content.as_str()),
                notes::update_at.eq(&size))
            ).execute(c)
        }).await
    }
}