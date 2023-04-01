// https://github.com/SergioBenitez/Rocket
// https://api.rocket.rs/v0.5-rc/rocket/

use ndk::asset::AssetManager;
use rocket::{Config, routes};
use rocket::config::Environment;

#[get("/")]
fn hello() -> &'static str {
    "Hello, world!"
}

pub fn run_server(host: &str, port: u16, ass: AssetManager) {
    log::error!("{}:{}", host,port);
    let config = Config::build(Environment::Staging)
        .address(host)
        .port(port)
        .finalize().unwrap();

    rocket::custom(config).mount("/", routes![hello])
        .launch();
}

