mod schema {
    diesel::table! {
        snippet {
            id ->  Nullable<Integer>,
            prefix ->  Text,
            body ->  Text,
            language ->  Nullable<Text>,
            count ->  Nullable<Integer>,
            create_at ->  Integer,
            update_at ->  Integer,
        }
    }
}
use diesel::{self, result::QueryResult, prelude::*};


use crate::server::NotesConnection;
use self::schema::snippet;
use self::schema::snippet::dsl::{snippet as all_snippets};
use rocket::serde::{Serialize, Deserialize};
use crate::util::get_epoch_ms;

#[derive(Serialize, Deserialize, Queryable, Insertable, Debug, Clone)]
#[serde(crate = "rocket::serde")]
#[table_name = "snippet"]
pub struct Snippet {
    pub id: Option<i32>,
    pub prefix: String,
    pub body: String,
    pub language: Option<String>,
    #[serde(skip_deserializing, skip_serializing)]
    pub count: Option<i32>,
    #[serde(skip_deserializing, skip_serializing)]
    pub create_at: i32,
    #[serde(skip_deserializing, skip_serializing)]
    pub update_at: i32,
}

impl Snippet {
    pub async fn all(conn: &NotesConnection) -> QueryResult<Vec<String>> {
        conn.run(|c| {
            snippet::table
                .select(snippet::prefix)
                .order(snippet::update_at.desc()).load::<String>(c)
        }).await
    }
    pub async fn insert(snippet: Snippet, conn: &NotesConnection) -> QueryResult<usize> {
        conn.run(|c| {
            let v = snippet::table.filter(snippet::prefix.eq(&snippet.prefix)).get_result::<Snippet>(c);
            match v {
                Ok(v) => {
                    let size = (get_epoch_ms() / 1000) as i32;
                    let updated_snippet = diesel::update(snippet::table.filter(snippet::prefix.eq(v.prefix)));
                    updated_snippet.set((snippet::body.eq(snippet.body.as_str()),
                                         snippet::update_at.eq(&size))
                    ).execute(c);
                    Ok(v.id.unwrap() as usize)
                }
                Err(err) => {
                    let t = Snippet {
                        id: None,
                        prefix: snippet.prefix,
                        body: snippet.body,
                        language: snippet.language,
                        count: Some(0),
                        create_at: (get_epoch_ms() / 1000) as i32,
                        update_at: (get_epoch_ms() / 1000) as i32,
                    };
                    diesel::insert_into(snippet::table).values(&t).execute(c)
                }
            }
        }).await
    }
    pub async fn delete_with_prefix(prefix: String, conn: &NotesConnection) -> QueryResult<usize> {
        conn.run(move |c| diesel::delete(snippet::table)
            .filter(snippet::prefix.eq(&prefix))
            .execute(c))
            .await
    }
    pub async fn query_body(prefix: String, conn: &NotesConnection) -> QueryResult<String> {
        conn.run(move |c| {
            let v = snippet::table.filter(snippet::prefix.eq(&prefix)).get_result::<Snippet>(c);
            return match v {
                Ok(v) => {
                    let updated_snippet = diesel::update(snippet::table.filter(snippet::id.eq(v.id)));
                    updated_snippet.set(snippet::count.eq(v.count.unwrap_or(0) + 1)).execute(c);
                    Ok(v.body)
                }
                Err(err) => {
                    Ok(String::new())
                }
            };
        }).await
    }
}

