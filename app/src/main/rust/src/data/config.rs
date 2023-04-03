pub struct Server {
    pub host: String,
    pub port: u16,
    pub temp_dir: String,
}

pub struct Database {
    pub host: String,
    pub port: u16,
    pub db_name: String,
    pub user: String,
    pub password: String,
}