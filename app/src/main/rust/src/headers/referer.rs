use rocket::Request;
use rocket::request::{FromRequest, Outcome};

pub struct Referer(pub String);

#[rocket::async_trait]
impl<'r> FromRequest<'r> for Referer {
    type Error = ();
    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, ()> {
        let referer = request.headers().get_one("referer");
        match referer {
            Some(v) => {
                Outcome::Success(Referer(v.to_string()))
            }
            None => {
                Outcome::Forward(())
            }
        }
    }
}