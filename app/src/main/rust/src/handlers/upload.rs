use rocket::form::Form;
use rocket::fs::TempFile;

#[derive(FromForm)]
pub struct UploadData<'f> {
    key: Option<String>,
    data: TempFile<'f>,
}

#[derive(FromForm)]
pub struct Upload<'f> {
    path: &'f str,
    file: TempFile<'f>,
}

#[post("/upload", format = "multipart/form-data", data = "<form>")]
pub async fn upload(mut form: Form<Upload<'_>>) -> std::io::Result<()> {
    let f = form.path.to_string();
    form.file.persist_to(f).await?;
    Ok(())
}